import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContext, useAuth } from "@/contexts/auth";
import { ExplanationsContext } from "@/contexts/explanations";
import { SubscriptionContext } from "@/contexts/subscription";
import { LanguageProvider } from "@/contexts/language";

// Import polyfills for pdfjs-dist before any other imports that might use it
import "@/lib/pdfjs-polyfills";

import { trpc, trpcClient } from "@/lib/trpc";
import "@/lib/i18n";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth-page" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="feynman-ai" options={{ headerShown: false }} />
      <Stack.Screen name="start-learning" options={{ headerShown: false }} />
      <Stack.Screen name="topic-picker" options={{ headerShown: false }} />
      <Stack.Screen name="character-picker" options={{ headerShown: false }} />
      <Stack.Screen name="explanation" options={{ headerShown: false }} />
      <Stack.Screen
        name="privacy-policy"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="record-audio"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />

      <Stack.Screen
        name="note-generating"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="generated-topic" options={{ headerShown: false }} />
      <Stack.Screen
        name="capture-text-image"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="paywall"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="learning-session" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    "Poppins-Black": require("@/assets/fonts/Poppins-Black.ttf"),
    "Poppins-BlackItalic": require("@/assets/fonts/Poppins-BlackItalic.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-BoldItalic": require("@/assets/fonts/Poppins-BoldItalic.ttf"),
    "Poppins-ExtraBold": require("@/assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraBoldItalic": require("@/assets/fonts/Poppins-ExtraBoldItalic.ttf"),
    "Poppins-ExtraLight": require("@/assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-ExtraLightItalic": require("@/assets/fonts/Poppins-ExtraLightItalic.ttf"),
    "Poppins-Italic": require("@/assets/fonts/Poppins-Italic.ttf"),
    "Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
    "Poppins-LightItalic": require("@/assets/fonts/Poppins-LightItalic.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-MediumItalic": require("@/assets/fonts/Poppins-MediumItalic.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-SemiBoldItalic": require("@/assets/fonts/Poppins-SemiBoldItalic.ttf"),
    "Poppins-Thin": require("@/assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ThinItalic": require("@/assets/fonts/Poppins-ThinItalic.ttf"),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      // Hide native splash screen immediately so we can show custom one
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
            <AuthContext>
              <SubscriptionContext>
                <ExplanationsContext>
                  <RootLayoutNav />
                </ExplanationsContext>
              </SubscriptionContext>
            </AuthContext>
          </LanguageProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
