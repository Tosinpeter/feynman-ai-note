
import { useSubscription } from "@/contexts/subscription";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Check,
  Sparkles,
  Brain,
  Zap,
  Crown,
  Star,
} from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PurchasesPackage } from "react-native-purchases";

type PlanType = "weekly" | "monthly" | "annual";

export default function PaywallScreen() {
  const router = useRouter();
  const {
    currentOffering,
    isLoadingOfferings,
    purchase,
    isPurchasing,
    restore,
    isRestoring,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");

  const packages = useMemo(() => {
    if (!currentOffering?.availablePackages) return {};
    const pkgMap: Record<string, PurchasesPackage> = {};
    currentOffering.availablePackages.forEach((pkg) => {
      if (pkg.identifier.includes("weekly") || pkg.packageType === "WEEKLY") {
        pkgMap.weekly = pkg;
      } else if (pkg.identifier.includes("monthly") || pkg.packageType === "MONTHLY") {
        pkgMap.monthly = pkg;
      } else if (pkg.identifier.includes("annual") || pkg.packageType === "ANNUAL") {
        pkgMap.annual = pkg;
      }
    });
    return pkgMap;
  }, [currentOffering]);

  const getPriceString = (planType: PlanType) => {
    const pkg = packages[planType];
    if (!pkg) return "—";
    return pkg.product.priceString;
  };

  const getWeeklyPrice = (planType: PlanType) => {
    const pkg = packages[planType];
    if (!pkg) return "—";
    const price = pkg.product.price;
    let weeklyPrice = price;
    if (planType === "monthly") {
      weeklyPrice = price / 4;
    } else if (planType === "annual") {
      weeklyPrice = price / 52;
    }
    const currencyCode = pkg.product.currencyCode || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(weeklyPrice);
  };

  const handlePurchase = async () => {
    const pkg = packages[selectedPlan];
    if (!pkg) {
      console.log("No package found for selected plan:", selectedPlan);
      return;
    }
    try {
      await purchase(pkg);
      router.back();
    } catch {
      console.log("Purchase cancelled or failed");
    }
  };

  const handleRestore = async () => {
    await restore();
  };

  const features = [
    { icon: Brain, text: "Unlimited AI explanations", color: "#8B5CF6" },
    { icon: Sparkles, text: "Advanced Feynman Technique", color: "#F59E0B" },
    { icon: Zap, text: "Instant topic generation", color: "#10B981" },
    { icon: Star, text: "Premium flashcards & quizzes", color: "#EF4444" },
    { icon: Crown, text: "Priority support", color: "#3B82F6" },
  ];

  const plans = [
    {
      id: "annual" as PlanType,
      name: "Yearly",
      badge: "BEST VALUE",
      badgeColor: "#10B981",
      savings: "Save 75%",
    },
    {
      id: "monthly" as PlanType,
      name: "Monthly",
      badge: null,
      badgeColor: null,
      savings: "Save 40%",
    },
    {
      id: "weekly" as PlanType,
      name: "Weekly",
      badge: null,
      badgeColor: null,
      savings: null,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f0f23"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerSection}>
            <View style={styles.mascotContainer}>
              <LinearGradient
                colors={["#8B5CF6", "#A855F7", "#C084FC"]}
                style={styles.mascotGlow}
              />
              <Image
                source="https://r2-pub.rork.com/generated-images/21a2188b-28ec-4fab-9231-8adc2cd797f9.png"
                style={styles.mascotImage}
                contentFit="contain"
              />
              <View style={styles.crownBadge}>
                <Crown size={20} color="#FFD700" fill="#FFD700" />
              </View>
            </View>
            <Text style={styles.title}>Unlock Premium</Text>
            <Text style={styles.subtitle}>
              Master any topic with the Feynman Technique
            </Text>
          </View>

          <View style={styles.promoContainer}>
            <LinearGradient
              colors={["#F97316", "#EF4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.promoBadge}
            >
              <Text style={styles.promoText}>🎉 BACK TO SCHOOL - 50% OFF</Text>
            </LinearGradient>
          </View>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <View key={index} style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: `${feature.color}20` },
                    ]}
                  >
                    <IconComponent size={18} color={feature.color} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                  <Check size={18} color="#10B981" strokeWidth={3} />
                </View>
              );
            })}
          </View>

          {isLoadingOfferings ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                    ]}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.8}
                  >
                    {plan.badge && (
                      <View
                        style={[
                          styles.planBadge,
                          { backgroundColor: plan.badgeColor },
                        ]}
                      >
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <View style={styles.planContent}>
                      <View style={styles.planLeft}>
                        <View
                          style={[
                            styles.radioOuter,
                            isSelected && styles.radioOuterSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.planName,
                              isSelected && styles.planNameSelected,
                            ]}
                          >
                            {plan.name}
                          </Text>
                          {plan.savings && (
                            <Text style={styles.planSavings}>{plan.savings}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.planRight}>
                        <Text
                          style={[
                            styles.planPrice,
                            isSelected && styles.planPriceSelected,
                          ]}
                        >
                          {getPriceString(plan.id)}
                        </Text>
                        <Text style={styles.planPeriod}>
                          {getWeeklyPrice(plan.id)}/week
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.continueButton,
              (isPurchasing || isRestoring) && styles.continueButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={isPurchasing || isRestoring || isLoadingOfferings}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#8B5CF6", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueGradient}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.continueText}>Continue</Text>
                  <Sparkles size={20} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring || isPurchasing}
            activeOpacity={0.7}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Text style={styles.restoreText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              Payment will be charged to your account at confirmation of purchase.
              Subscription automatically renews unless auto-renew is turned off at
              least 24-hours before the end of the current period.
            </Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => router.push("/terms-of-service")}>
                <Text style={styles.legalLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalDivider}>•</Text>
              <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mascotContainer: {
    position: "relative",
    marginBottom: 20,
  },
  mascotGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -10,
    left: -10,
    opacity: 0.3,
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  crownBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  promoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  promoBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  promoText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  featuresContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#9CA3AF",
    marginTop: 12,
    fontSize: 14,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    overflow: "hidden",
  },
  planCardSelected: {
    borderColor: "#8B5CF6",
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  planBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  planBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#8B5CF6",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#8B5CF6",
  },
  planName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  planNameSelected: {
    color: "#FFFFFF",
  },
  planSavings: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
    marginTop: 2,
  },
  planRight: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planPriceSelected: {
    color: "#FFFFFF",
  },
  planPeriod: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 20,
  },
  restoreText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  legalContainer: {
    alignItems: "center",
  },
  legalText: {
    color: "#6B7280",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legalLink: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "500",
  },
  legalDivider: {
    color: "#6B7280",
    fontSize: 12,
  },
});
