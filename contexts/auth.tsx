import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User, AuthError } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Storage key for cached profile
const PROFILE_STORAGE_KEY = "@nexus_user_profile";

// Complete any pending auth sessions (required for web OAuth)
WebBrowser.maybeCompleteAuthSession();

// Configure Google Sign-In
// Replace with your actual Web Client ID from Google Cloud Console
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";

// Initialize Google Sign-In configuration
GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  iosClientId: Platform.OS === "ios" ? IOS_CLIENT_ID : undefined,
  scopes: ["profile", "email"],
  offlineAccess: true,
});

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Pick<Profile, "full_name" | "avatar_url">>) => Promise<{ error: Error | null }>;
  refreshProfile: (userId?: string) => Promise<void>;
}

// Get the redirect URL for OAuth (used for Apple Sign-In)
// Note: WebBrowser handles the callback internally, no separate route needed
const getRedirectUrl = () => {
  const redirectUrl = AuthSession.makeRedirectUri({
    scheme: "rork-app",
  });
  return redirectUrl;
};

export const [AuthContext, useAuth] = createContextHook((): AuthState => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile from the profiles table and save to local storage
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      const profileData = data as Profile;
      
      // Save profile to local storage
      try {
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      } catch (storageError) {
        console.error("Error saving profile to local storage:", storageError);
      }

      return profileData;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  // Load cached profile from local storage
  const loadCachedProfile = async (): Promise<Profile | null> => {
    try {
      const cachedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (cachedProfile) {
        return JSON.parse(cachedProfile) as Profile;
      }
      return null;
    } catch (error) {
      console.error("Error loading cached profile:", error);
      return null;
    }
  };

  // Clear cached profile from local storage
  const clearCachedProfile = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cached profile:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Load cached profile first for faster initial load
        const cachedProfile = await loadCachedProfile();
        if (cachedProfile) {
          setProfile(cachedProfile);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch profile from the profiles table (this will also save to local storage)
          const profileData = await fetchProfile(currentSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
          // Clear cached profile when user logs out
          await clearCachedProfile();
        }
        
        setIsLoading(false);

      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Native Google Sign-In
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if Google Play Services are available (Android only)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Attempt to sign in
      const response = await GoogleSignin.signIn();
      
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        
        if (!idToken) {
          throw new Error("No ID token received from Google");
        }

        // Sign in to Supabase with the Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log("Successfully signed in with Google:", data.user?.email);
      } else {
        throw new Error("Google sign in cancelled or failed");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // User cancelled the sign-in flow - no need to show error
            console.log("User cancelled Google sign in");
            return;
          case statusCodes.IN_PROGRESS:
            errorMessage = "Sign in is already in progress";
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = "Google Play Services is not available on this device";
            break;
          default:
            errorMessage = error.message || "Failed to sign in with Google";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert("Sign In Failed", errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apple Sign-In (using web OAuth flow)
  const signInWithApple = useCallback(async () => {
    try {
      setIsLoading(true);
      const redirectUrl = getRedirectUrl();
      console.log("Apple OAuth redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== "web",
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // On native platforms, open the browser for OAuth
      if (Platform.OS !== "web" && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showInRecents: true,
            preferEphemeralSession: false,
          }
        );

        console.log("WebBrowser result type:", result.type);

        if (result.type === "success" && result.url) {
          // Extract tokens from the callback URL
          const url = result.url;
          const hashIndex = url.indexOf("#");
          if (hashIndex !== -1) {
            const hash = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                throw new Error(sessionError.message);
              }
            }
          }
        } else if (result.type === "cancel") {
          console.log("User cancelled Apple sign in");
          return;
        } else if (result.type === "dismiss") {
          console.log("Apple sign in dismissed");
          return;
        }
      }
    } catch (error) {
      console.error("Error signing in with Apple:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      Alert.alert("Sign In Failed", errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Error signing in with email:", error);
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      return { error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Google if signed in
      try {
        const isSignedIn = await GoogleSignin.getCurrentUser();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (googleError) {
        console.log("Google sign out error (may not be signed in):", googleError);
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear cached profile from local storage
      await clearCachedProfile();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl(),
      });
      return { error };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error: error as AuthError };
    }
  };

  // Update the current user's profile
  const updateProfile = useCallback(async (
    updates: Partial<Pick<Profile, "full_name" | "avatar_url">>
  ): Promise<{ error: Error | null }> => {
    if (!session?.user?.id) {
      return { error: new Error("No authenticated user") };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh profile state from the database
      const updatedProfile = await fetchProfile(session.user.id);
      setProfile(updatedProfile);

      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error: error as Error };
    }
  }, [session?.user?.id]);

  // Refresh the profile state from the database
  const refreshProfile = useCallback(async (userId?: string): Promise<void> => {
    const id = userId ?? session?.user?.id;
    if (!id) return;

    const profileData = await fetchProfile(id);
    setProfile(profileData);
  }, [session?.user?.id]);

  return {
    profile,
    session,
    isLoading,
    isAuthenticated: !!profile,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updateProfile,
    setSession,
    refreshProfile,
  };
});
