import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const loaderRotation = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate text after logo
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 500,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Animate loader
    Animated.timing(loaderOpacity, {
      toValue: 1,
      duration: 400,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Start loader rotation
    const rotationAnimation = Animated.loop(
      Animated.timing(loaderRotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    return () => {
      rotationAnimation.stop();
    };
  }, []);

  const spin = loaderRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={[Colors.cream, Colors.beige]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Animated.Text style={styles.appName}>Nexus AI</Animated.Text>
          <Animated.Text style={styles.tagline}>Learn Faster</Animated.Text>
        </Animated.View>

        {/* Loader */}
        <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
          <Animated.View
            style={[
              styles.loader,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={styles.loaderDot} />
          </Animated.View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.darkBrown,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  appName: {
    fontSize: 36,
    fontFamily: "Poppins-Bold",
    color: Colors.darkBrown,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.grayText,
    marginTop: 4,
  },
  loaderContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.lightGray,
    borderTopColor: Colors.orange,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
    marginTop: -5,
  },
});
