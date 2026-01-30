import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/auth";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("user@example.com", "Guest User");
    setIsLoading(false);
    router.replace("/(tabs)/(home)");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <View style={styles.chalkboardBg}>
              <Image
                source="https://r2-pub.rork.com/generated-images/21a2188b-28ec-4fab-9231-8adc2cd797f9.png"
                style={styles.teacherRaccoon}
                contentFit="contain"
              />
              <Image
                source="https://r2-pub.rork.com/generated-images/9e6e568e-6ddf-47bb-8680-a03823770cca.png"
                style={styles.studentRaccoon}
                contentFit="contain"
              />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.tagline}>The Feynman Technique</Text>
            <Text style={styles.subtitle}>&quot;Explain anything like I&apos;m 5&quot;</Text>

            <View style={styles.titleContainer}>
              <Text style={styles.welcomeText}>Welcome to </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Feynman AI</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleText}>G</Text>
              </View>
              <Text style={styles.signInText}>
                {isLoading ? "Signing in..." : "Sign in with Google"}
              </Text>
            </TouchableOpacity>

            <View style={styles.securityBadge}>
              <View style={styles.checkContainer}>
                <Check size={16} color={Colors.teal} strokeWidth={3} />
              </View>
              <Text style={styles.securityText}>Your account is secure</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
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
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  chalkboardBg: {
    width: width * 0.85,
    height: "100%",
    backgroundColor: Colors.darkBrown,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.darkBrown,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 8px 12px ${Colors.shadow}`,
      },
    }),
  },
  teacherRaccoon: {
    position: "absolute",
    width: 140,
    height: 140,
    left: 20,
    top: "50%",
    transform: [{ translateY: -70 }],
  },
  studentRaccoon: {
    position: "absolute",
    width: 100,
    height: 100,
    right: 30,
    bottom: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  tagline: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.darkBrown,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.grayText,
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
    color: Colors.darkText,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: Colors.darkBrown,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  signInText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkText,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  checkContainer: {
    width: 24,
    height: 24,
    backgroundColor: Colors.lightTeal,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: Colors.teal,
    fontWeight: "500",
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
    color: Colors.grayText,
    textDecorationLine: "underline",
  },
  footerSeparator: {
    fontSize: 13,
    color: Colors.grayText,
  },
});
