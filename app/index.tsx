import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth";
import CustomSplashScreen from "@/components/SplashScreen";

export default function Index() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to be determined before navigating
    if (isLoading) return;

    console.log("User Profile:", profile);

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth-page");
      }
        }, 500);

    
  }, [isAuthenticated, isLoading, router, profile]);

  // Return empty view - splash screen is handled in _layout.tsx
  return <CustomSplashScreen/>;
}
