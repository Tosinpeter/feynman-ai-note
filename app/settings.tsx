import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "expo-router";
import { ArrowLeft, LogOut, User } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (confirm(t('settings.signOutConfirm'))) {
        signOut();
        router.replace("/auth-page");
      }
    } else {
      Alert.alert(t('settings.signOut'), t('settings.signOutConfirm'), [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('settings.signOut'),
          style: "destructive",
          onPress: () => {
            signOut();
            router.replace("/auth-page");
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={Colors.darkBrown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={32} color={Colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || t('settings.guest')}</Text>
              <Text style={styles.profileEmail}>{user?.email || ""}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('settings.appVersion')}</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('welcome.termsOfService')}</Text>
                <Text style={styles.linkText}>{t('settings.view')}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('welcome.privacyPolicy')}</Text>
                <Text style={styles.linkText}>{t('settings.view')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <LogOut size={20} color={Colors.white} />
              <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            {t('settings.madeWithLove')}
          </Text>
        </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.darkText,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      },
    }),
  },
  avatarContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.orange,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.darkText,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: Colors.grayText,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.darkText,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      },
    }),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.darkText,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: Colors.grayText,
  },
  linkText: {
    fontSize: 16,
    color: Colors.orange,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.coral,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  signOutText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  footerText: {
    fontSize: 14,
    color: Colors.grayText,
    textAlign: "center",
    marginTop: 20,
  },
});
