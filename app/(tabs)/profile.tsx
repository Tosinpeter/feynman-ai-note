import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronRight,
  LogOut,
  Star,
  FileText,
  Shield,
  Sparkles,
  Send,
  Languages,
  Headphones,
  Calendar,
  Trash2,
  Globe,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Share,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLanguage, Language } from "@/contexts/language";
import BottomSheet from "@/components/BottomSheet";
import PrivacyPolicyContent from "@/components/PrivacyPolicyContent";
import TermsOfServiceContent from "@/components/TermsOfServiceContent";
import LanguageSelectionContent from "@/components/LanguageSelectionContent";

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  showChevron?: boolean;
  chevronColor?: string;
  rightText?: string;
  titleColor?: string;
  isLastItem?: boolean;
}

function SettingsItem({
  icon,
  title,
  onPress,
  showChevron = true,
  chevronColor = Colors.navInactive,
  rightText,
  titleColor = Colors.text,
  isLastItem = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={[styles.settingsItem, isLastItem && styles.settingsItemLast]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsIcon}>{icon}</View>
      <Text style={[styles.settingsTitle, { color: titleColor }]}>{title}</Text>
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      {showChevron && <ChevronRight size={16} color={chevronColor} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  const handleLanguageChange = async (lang: Language) => {
    await changeLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (confirm(t('profile.logOutConfirm'))) {
        // signOut();
        router.replace("/auth-page");
      }
    } else {
      Alert.alert(t('profile.logOut'), t('profile.logOutConfirm'), [
        { text: t('profile.cancel'), style: "cancel" },
        {
          text: t('profile.logOut'),
          style: "destructive",
          onPress: () => {
            // signOut();
            router.replace("/auth-page");
          },
        },
      ]);
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === "web") {
      if (confirm(t('profile.deleteAccountConfirm'))) {
        // TODO: Implement account deletion logic
        console.log("Delete account");
        // signOut();
        router.replace("/auth-page");
      }
    } else {
      Alert.alert(
        t('profile.deleteAccount'),
        t('profile.deleteAccountConfirm'),
        [
          { text: t('profile.cancel'), style: "cancel" },
          {
            text: t('profile.delete'),
            style: "destructive",
            onPress: () => {
              // TODO: Implement account deletion logic
              console.log("Delete account");
              // signOut();
              router.replace("/auth-page");
            },
          },
        ]
      );
    }
  };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message: Platform.OS === 'ios' 
          ? 'Check out Nexus AI - Learn smarter with AI-powered study tools! Download now: https://apps.apple.com/app/nexus-ai'
          : 'Check out Nexus AI - Learn smarter with AI-powered study tools! Download now: https://play.google.com/store/apps/details?id=com.nexus.ai',
        title: 'Nexus AI - Learn Fast',
        url: Platform.OS === 'ios' ? 'https://apps.apple.com/app/nexus-ai' : undefined,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share the app');
      console.error('Share error:', error);
    }
  };

  const handleRateApp = async () => {
    // App Store and Play Store URLs - replace with actual app IDs
    const iosAppId = 'your-ios-app-id'; // Replace with actual App Store ID
    const androidPackage = 'com.nexus.ai'; // Replace with actual package name
    
    let storeUrl = '';
    
    if (Platform.OS === 'ios') {
      storeUrl = `itms-apps://itunes.apple.com/app/id${iosAppId}?action=write-review`;
    } else if (Platform.OS === 'android') {
      storeUrl = `market://details?id=${androidPackage}`;
    } else {
      // Web fallback
      storeUrl = 'https://apps.apple.com/app/nexus-ai';
    }

    try {
      const supported = await Linking.canOpenURL(storeUrl);
      if (supported) {
        await Linking.openURL(storeUrl);
      } else {
        // Fallback to web URLs
        const webUrl = Platform.OS === 'ios' 
          ? `https://apps.apple.com/app/id${iosAppId}`
          : `https://play.google.com/store/apps/details?id=${androidPackage}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open app store');
      console.error('Rate app error:', error);
    }
  };

  const handleGetHelp = async () => {
    const supportEmail = 'support@nexusai.com'; // Replace with actual support email
    const subject = encodeURIComponent('Help Request - Nexus AI App');
    const body = encodeURIComponent(`
Hi Nexus AI Support Team,

I need help with:

---
App Version: 2.0.1
Platform: ${Platform.OS}
User: ${profile?.email || 'Guest'}
---
    `.trim());

    // Try Gmail first, then fallback to default mail client
    const gmailUrl = `googlegmail://co?to=${supportEmail}&subject=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

    try {
      // Try to open Gmail app first
      const canOpenGmail = await Linking.canOpenURL(gmailUrl);
      
      if (canOpenGmail) {
        await Linking.openURL(gmailUrl);
      } else {
        // Fallback to default mail client
        const canOpenMailto = await Linking.canOpenURL(mailtoUrl);
        if (canOpenMailto) {
          await Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'No Email App',
            `Please email us at ${supportEmail}`,
            [
              { text: 'OK' },
              { 
                text: 'Copy Email', 
                onPress: () => {
                  // Note: You might want to add Clipboard import for this
                  Alert.alert('Email', supportEmail);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client');
      console.error('Get help error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <SafeAreaView style={styles.safeArea}>

          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0).toUpperCase() || "G"}
                </Text>
              )}
            </View>
            <Text style={styles.userName}>{profile?.full_name || t('profile.guestUser')}</Text>
            <Text style={styles.userEmail}>{profile?.email || "guest@example.com"}</Text>
            <View style={styles.joinDateRow}>
              <Calendar size={16} color={Colors.navInactive} />
              <Text style={styles.joinDate}>{t('profile.joined')} 23 Sep 2025</Text>
            </View>
          </View>

          <View style={styles.promoCard}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>{t('profile.backToSchool')}</Text>
              <Text style={styles.promoSubtitle}>{t('profile.sale')}</Text>
              <TouchableOpacity style={styles.promoButton}>
                <Text style={styles.promoButtonText}>{t('profile.getPromo')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoIllustration}>
              <Image
                source={require("@/assets/images/img_profile.png")}
                style={styles.promoImage}
                contentFit="contain"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>

            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<Sparkles size={24} color={Colors.orange} />}
                title={t('profile.accountStatus')}
                rightText={t('profile.free')}
                showChevron={false}
                isLastItem={false}
              />
              <SettingsItem
                icon={<Shield size={24} color={Colors.navDark} />}
                title={t('profile.version')}
                rightText="2.0.1"
                showChevron={false}
                isLastItem={true}
              />
            </View>

            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<Star size={24} color="#FBBF24" />}
                title={t('profile.rateApp')}
                onPress={handleRateApp}
                isLastItem={false}
              />
              <SettingsItem
                icon={<Send size={24} color={Colors.gradientBlue} />}
                title={t('profile.shareApp')}
                onPress={handleShareApp}
                isLastItem={false}
              />
              <SettingsItem
                icon={<Languages size={24} color="#DC2626" />}
                title={t('profile.changeLanguage')}
                onPress={() => setShowLanguageModal(true)}
                isLastItem={true}
              />
            </View>

            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<Headphones size={24} color={Colors.orange} />}
                title={t('profile.getHelp')}
                onPress={handleGetHelp}
                isLastItem={false}
              />
              <SettingsItem
                icon={<FileText size={24} color={Colors.gradientBlue} />}
                title={t('welcome.termsOfService')}
                onPress={() => setShowTermsOfService(true)}
                isLastItem={false}
              />
              <SettingsItem
                icon={<Shield size={24} color={Colors.gradientGreenStart} />}
                title={t('welcome.privacyPolicy')}
                onPress={() => setShowPrivacyPolicy(true)}
                isLastItem={false}
              />


              <SettingsItem
                icon={<LogOut size={24} color="#EF4444" />}
                title={t('profile.logOut')}
                onPress={handleLogout}
                showChevron={false}
                isLastItem={true}
              />
            </View>

            <Text style={{
              color: "#DC2626", fontSize: 14,
              marginVertical: 20,
              fontFamily: Fonts.SemiBold,
            }}>{t('Super Danger Zone')}</Text>
            <View style={styles.settingsGroup}>
              <SettingsItem
                icon={<Trash2 size={24} color="#DC2626" />}
                title={t('profile.deleteAccount')}
                titleColor="#DC2626"
                onPress={handleDeleteAccount}
                showChevron={true}
                chevronColor="#DC2626"
                isLastItem={false}
              />

            </View>
          </View>

          <Text style={styles.version}>{t('profile.version')} 2.0.1</Text>
        </SafeAreaView>
      </ScrollView>

      {/* iOS Cover Bottom Sheet - Language Selection */}
      <BottomSheet
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('profile.changeLanguage')}
      >
        <LanguageSelectionContent
          currentLanguage={language}
          onLanguageSelect={handleLanguageChange}
        />
      </BottomSheet>

      {/* iOS Cover Bottom Sheet - Terms of Service */}
      <BottomSheet
        visible={showTermsOfService}
        onClose={() => setShowTermsOfService(false)}
        title={t('welcome.termsOfService')}
      >
        <TermsOfServiceContent />
      </BottomSheet>

      {/* iOS Cover Bottom Sheet - Privacy Policy */}
      <BottomSheet
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title={t('welcome.privacyPolicy')}
      >
        <PrivacyPolicyContent />
      </BottomSheet>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.Bold,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: Colors.orange,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 40,
    fontFamily: Fonts.Bold,
  },
  userName: {
    fontSize: 22,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: "rgba(0,0,0,0.6)",
    marginBottom: 5,
  },
  joinDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  joinDate: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
    color: "rgba(0,0,0,0.6)",
  },
  promoCard: {
    backgroundColor: Colors.gradientCoralStart,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
    }),
  },
  promoContent: {
    flex: 1,
    zIndex: 2,
  },
  promoTitle: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: Colors.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: Colors.white,
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  promoButtonText: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    color: Colors.text,
  },
  promoIllustration: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  promoImage: {
    width: 150,
    height: 150,
  },
  promoWatermark: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: "rgba(255,255,255,0.3)",
    textAlign: "right",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
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
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundLight,
  },
  settingsItemLast: {
    borderBottomWidth: 0,
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsTitle: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    flex: 1,
  },
  rightText: {
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: Colors.text,
    marginRight: 8,
  },
  version: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: Colors.navInactive,
    textAlign: "center",
  },
});
