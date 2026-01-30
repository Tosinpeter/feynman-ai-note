import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const openEmail = () => {
    Linking.openURL("mailto:support@Feynman.ai");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.navDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainTitle}>Privacy Policy</Text>
          <Text style={styles.dateText}>Effective July 29, 2024</Text>
          <Text style={styles.dateText}>Last updated Sep 9, 2024</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Welcome to Feynman AI</Text>
            <Text style={styles.bodyText}>
              We care about your privacy and want to make sure you understand
              how we handle your information when using our app. Below, we
              explain what information we collect, how we use it, and the
              choices you have regarding your data.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who We Are</Text>
            <Text style={styles.bodyText}>
              Feynman AI is powered by Feynman, LLC, self-funded company focused
              on providing you with a smooth, reliable note-taking experience.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>

            <View style={styles.listItem}>
              <Text style={styles.listNumber}>1. </Text>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>
                  Audio Recordings and Files:
                </Text>
                <Text style={styles.bodyText}>
                  We store any audio recordings and files you upload, so you can
                  easily access or download them whenever needed.
                </Text>
              </View>
            </View>

            <View style={styles.listItem}>
              <Text style={styles.listNumber}>2. </Text>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>App Stats and Analytics:</Text>
                <Text style={styles.bodyText}>
                  To keep Feynman running efficiently, we collect minimal data
                  such as the number of notes you create. We use third-party
                  services to manage and analyze this data.
                </Text>
              </View>
            </View>

            <View style={styles.listItem}>
              <Text style={styles.listNumber}>3. </Text>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>User Data:</Text>
                <Text style={styles.bodyText}>
                  We collect user data such as email, name, and profile picture.
                  This data is used to personalize your experience and is not
                  shared with third parties.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Cookies and Other Technologies
            </Text>
            <Text style={styles.bodyText}>
              At Feynman AI, we prioritize your privacy and don&apos;t rely on
              third-party &quot;cookies&quot; or similar tracking technologies, like web
              beacons, across our website, services, or apps. However, we do use
              some in-house cookies to improve functionality and your overall
              experience:
            </Text>

            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.bulletContent}>
                <Text style={styles.bulletTitle}>Communications Cookies: </Text>
                <Text style={styles.bodyText}>
                  These help ensure data flows smoothly across our platform and
                  assist in identifying and fixing any errors.
                </Text>
              </View>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.bulletContent}>
                <Text style={styles.bulletTitle}>Essential Cookies: </Text>
                <Text style={styles.bodyText}>
                  These are vital for the features and services you use, such as
                  language preferences or transaction verification, ensuring the
                  app functions as expected.
                </Text>
              </View>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.bulletContent}>
                <Text style={styles.bulletTitle}>Analytical Cookies: </Text>
                <Text style={styles.bodyText}>
                  We use these to understand how you interact with our services,
                  helping us optimize and improve them.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opting Out</Text>
            <Text style={styles.bodyText}>
              If you&apos;d prefer not to use cookies, you can disable them in your
              browser settings by selecting &quot;Block all cookies.&quot; Keep in mind,
              disabling cookies might affect certain features on our website and
              app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beyond Cookies</Text>
            <Text style={styles.bodyText}>
              We may occasionally use &quot;click-through URLs&quot; in our emails to link
              you to specific content on our site. When you click these links, it
              briefly passes through our server, helping us measure engagement. If
              you&apos;d rather avoid this, simply avoid clicking links in our emails.
            </Text>
            <Text style={styles.bodyText}>
              Most of the data we collect through cookies is non-personal. If
              local laws treat things like IP addresses as personal data, we apply
              the same protections to them as we would with other personal
              information.
            </Text>
            <Text style={styles.bodyText}>
              In some cases, we might combine non-personal data collected through
              cookies with personal data we already have. In such cases, this
              combined data is treated as personal information and protected under
              this Privacy Policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Third-Party Partners</Text>
            <Text style={styles.bodyText}>
              We rely on a few trusted third-party services to help manage and
              enhance our app:
            </Text>

            <View style={styles.linkItem}>
              <Text style={styles.bodyText}>• </Text>
              <Text style={styles.bodyText}>Mixpanel — </Text>
              <TouchableOpacity
                onPress={() => openLink("https://mixpanel.com/legal/privacy-policy")}
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linkItem}>
              <Text style={styles.bodyText}>• </Text>
              <Text style={styles.bodyText}>RevenueCat — </Text>
              <TouchableOpacity
                onPress={() =>
                  openLink("https://www.revenuecat.com/privacy")
                }
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bodyText}>
              These services may collect or process some of your data, so please
              refer to their policies for more details.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advertising Practices</Text>
            <Text style={styles.bodyText}>
              Any advertisements shown through our own platform while using
              Feynman AI are designed to respect your privacy. These ads don&apos;t
              track or share your personal information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rights</Text>

            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.bulletContent}>
                <Text style={styles.bulletTitle}>Delete Your Data: </Text>
                <Text style={styles.bodyText}>
                  You have the right to request the permanent deletion of your
                  information from our system at any time.
                </Text>
              </View>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <View style={styles.bulletContent}>
                <Text style={styles.bulletTitle}>Contact Us: </Text>
                <Text style={styles.bodyText}>If you have any questions or need help, feel free to email us at </Text>
                <TouchableOpacity onPress={openEmail}>
                  <Text style={styles.linkText}>support@Feynman.ai</Text>
                </TouchableOpacity>
                <Text style={styles.bodyText}>.</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.bodyText}>
              For further questions or support, you can reach us at:
            </Text>
            <TouchableOpacity onPress={openEmail}>
              <Text style={styles.emailLink}>support@Feynman.ai</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.bodyText}>
              Thank you for choosing Feynman AI! We&apos;re here to support you on
              your note-taking journey.
            </Text>
          </View>

          <Text style={styles.footer}>
            Build with <Text style={styles.heart}>❤️</Text> by Feynman Team
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
    marginBottom: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  listNumber: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginRight: 4,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    color: Colors.text,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 12,
    marginLeft: 16,
  },
  bullet: {
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
    marginRight: 8,
    lineHeight: 24,
  },
  bulletContent: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  bulletTitle: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    color: Colors.text,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 16,
  },
  linkText: {
    fontSize: 15,
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  emailLink: {
    fontSize: 15,
    color: "#3B82F6",
    textDecorationLine: "underline",
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  heart: {
    color: "#EF4444",
  },
});
