import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/auth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Fonts } from '@/constants/fonts';

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function AuthPage() {
  const { signInWithGoogle, signInWithApple, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState({ google: false, apple: false });
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const appleTranslateYAnim = useRef(new Animated.Value(0)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(0.8)).current;
  const appleShadowOpacityAnim = useRef(new Animated.Value(0.8)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 4,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shadowOpacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 5,
        tension: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shadowOpacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleApplePressIn = () => {
    Animated.parallel([
      Animated.timing(appleTranslateYAnim, {
        toValue: 4,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(appleShadowOpacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleApplePressOut = () => {
    Animated.parallel([
      Animated.spring(appleTranslateYAnim, {
        toValue: 0,
        friction: 5,
        tension: 100,
        useNativeDriver: false,
      }),
      Animated.timing(appleShadowOpacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSignIn = async () => {
    if (isLoading.google || isLoading.apple || authLoading) return;
    
    try {
      setIsLoading(prev => ({ ...prev, google: true }));
      await signInWithGoogle();
      // Navigate to home page after successful sign in
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      // Error alert is already shown in auth context, no need to duplicate
    } finally {
      setIsLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleAppleSignIn = async () => {
    if (isLoading.google || isLoading.apple || authLoading) return;
    
    try {
      setIsLoading(prev => ({ ...prev, apple: true }));
      await signInWithApple();
      // Navigation will happen automatically via auth state listener in _layout.tsx
    } catch (error: any) {
      console.error("Apple sign in error:", error);
      // Error alert is already shown in auth context, no need to duplicate
    } finally {
      setIsLoading(prev => ({ ...prev, apple: false }));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={{ alignItems: "center", flex: 1 }}>
            <View style={styles.illustrationContainer}>
              <Image
                source={require("@/assets/images/IMG_1506.jpg")}
                style={styles.heroImage}
                contentFit="cover"
              />
            </View>
            <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
            <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
          </View>


          <View style={styles.textContainer}>

            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>{t('welcome.welcomeTo')} </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('welcome.appName')}</Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.signInButton,
                (isLoading.google || isLoading.apple || authLoading) && styles.buttonDisabled,
                {
                  transform: [{ translateY: translateYAnim }],
                  ...Platform.select({
                    ios: {
                      shadowOpacity: shadowOpacityAnim,
                    },
                  }),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.buttonTouchable}
                onPress={handleSignIn}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading.google || isLoading.apple || authLoading}
                activeOpacity={1}
              >
                {isLoading.google ? (
                  <ActivityIndicator size="small" color={Colors.black} style={{ marginRight: 12 }} />
                ) : (
                  <Image
                    source="https://www.google.com/favicon.ico"
                    style={styles.googleIcon}
                    contentFit="contain"
                  />
                )}
                <Text style={styles.signInText}>
                  {isLoading.google ? t('welcome.signingIn') : t('welcome.signInWithGoogle')}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.appleSignInButton,
                (isLoading.google || isLoading.apple || authLoading) && styles.buttonDisabled,
                {
                  transform: [{ translateY: appleTranslateYAnim }],
                  ...Platform.select({
                    ios: {
                      shadowOpacity: appleShadowOpacityAnim,
                    },
                  }),
                },
              ]}
            >
              <TouchableOpacity
                style={styles.buttonTouchable}
                onPress={handleAppleSignIn}
                onPressIn={handleApplePressIn}
                onPressOut={handleApplePressOut}
                disabled={isLoading.google || isLoading.apple || authLoading}
                activeOpacity={1}
              >
                {isLoading.apple ? (
                  <ActivityIndicator size="small" color={Colors.white} style={{ marginRight: 12 }} />
                ) : (
                  <Image
                    source={require("@/assets/images/img_apple.png")}
                    style={styles.appleIcon}
                    contentFit="contain"
                  />
                )}
                <Text style={styles.appleSignInText}>
                  {isLoading.apple ? t('welcome.signingIn') : t('welcome.signInWithApple')}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={[styles.securityBadge, { gap: 5, }]}>
              <ShieldCheck size={14} color={Colors.darkText} />
              <Text style={styles.securityText}>{t('welcome.secureAccount')}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/terms-of-service')}>
              <Text style={styles.footerLink}>{t('welcome.termsOfService')}</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>•</Text>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={styles.footerLink}>{t('welcome.privacyPolicy')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
  },


  illustrationContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 50,
  },
  heroImage: {
    width: 350,
    height: 230,
    borderRadius: 20,
    overflow: "hidden",
   
  },
  textContainer: {
    justifyContent: "flex-start",
    marginTop: 20,
    alignItems: "center",
  },
  tagline: {
    fontSize: 20,
    fontFamily: Fonts.SemiBold,
    color: Colors.black,
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.Regular,
    fontStyle: "italic",
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 20,
    color: Colors.black,
    fontFamily: Fonts.SemiBold,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.8)", // black with 70% opacity
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.Bold,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 5,
    borderRadius: 12,
    justifyContent: 'center',
    width: 350,
    shadowColor: "rgba(0,0,0,0.8)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 0
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  signInText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.black,
  },
  appleSignInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)", // 
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    width: 350,
    marginTop: 20,
    shadowColor: "rgba(0,0,0,0.8)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 0
  },
  buttonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  appleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  appleSignInText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  securityText: {
    fontSize: 12,
    color: Colors.darkText,
    fontFamily: Fonts.Medium,
    paddingVertical: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    gap: 8,
  },
  footerLink: {
    fontSize: 13,
    color: Colors.black,
    textDecorationLine: "underline",
  },
  footerSeparator: {
    fontSize: 13,
    color: Colors.grayText,
  },
  languageSwitcherContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
});
