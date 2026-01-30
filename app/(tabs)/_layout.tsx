import Colors from "@/constants/colors";
import CreateOptionsModal from "@/components/CreateOptionsModal";
import { Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import { Home, Grid3x3, User, Plus } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  StyleSheet, TouchableOpacity, Platform, Animated,
} from "react-native";

function FloatingActionButton() {
  const [showModal, setShowModal] = useState(false);

  const translateYAnim = useRef(new Animated.Value(0)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(0.8)).current;

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

  return (
    <>
      <Animated.View
        style={[
          styles.fab,
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
          style={{
            flex: 1,
            justifyContent: "center",
            width: 55,
            height: 52,
            alignItems: "center",
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTimeout(() => setShowModal(true), 150);
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Plus size={24} color={Colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>

      <CreateOptionsModal 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.navDark,
        tabBarInactiveTintColor: Colors.navInactive,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: Platform.OS === "ios" ? 86 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500" as const,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <Grid3x3 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab-placeholder"
        options={{
          tabBarButton: () => <FloatingActionButton />,
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 16,
    left: "20%",
    transform: [{ translateX: -28 }],
    width: 55,
    height: 52,
    borderRadius: 13,
    backgroundColor: Colors.navDark,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0,0,0,0.8)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
});
