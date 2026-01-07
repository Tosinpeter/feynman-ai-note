import { useSubscription } from "@/contexts/subscription";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { X, Check, Gift, RefreshCw } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

  const getOriginalPrice = (planType: PlanType) => {
    const pkg = packages[planType];
    if (!pkg) return "—";
    const price = pkg.product.price;
    let multiplier = 1;
    if (planType === "weekly") multiplier = 1 / 0.7;
    else if (planType === "monthly") multiplier = 2;
    else if (planType === "annual") multiplier = 2;
    
    const originalPrice = price * multiplier;
    const currencyCode = pkg.product.currencyCode || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(originalPrice);
  };

  const getDiscountedPrice = (planType: PlanType) => {
    const pkg = packages[planType];
    if (!pkg) return "—";
    const currencyCode = pkg.product.currencyCode || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pkg.product.price);
  };

  const getPeriodLabel = (planType: PlanType) => {
    switch (planType) {
      case "weekly": return "/week";
      case "monthly": return "/month";
      case "annual": return "/year";
      default: return "";
    }
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

  const plans = [
    {
      id: "weekly" as PlanType,
      name: "Weekly",
      badge: null,
      badgeColor: null,
      discount: "30% off first week",
    },
    {
      id: "annual" as PlanType,
      name: "Yearly",
      badge: "BEST OFFER",
      badgeColor: "#F97171",
      discount: "50% off first year",
    },
    {
      id: "monthly" as PlanType,
      name: "Monthly",
      badge: "POPULAR",
      badgeColor: "#14B8A6",
      discount: "50% off first month",
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={24} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring || isPurchasing}
            activeOpacity={0.7}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#1F2937" />
            ) : (
              <>
                <RefreshCw size={16} color="#1F2937" />
                <Text style={styles.restoreText}>Restore</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.illustrationContainer}>
            <Image
              source="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop"
              style={styles.illustrationImage}
              contentFit="contain"
            />
            <View style={styles.mascotOverlay}>
              <Text style={styles.mascotEmoji}>🎒</Text>
            </View>
            <Text style={styles.backToText}>BACK TO</Text>
            <Text style={styles.schoolText}>SCHOOL</Text>
          </View>

          {isLoadingOfferings ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F97171" />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const isHighlighted = plan.id === "annual" || plan.id === "monthly";
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
                    <View style={styles.planContent}>
                      <View style={styles.planLeft}>
                        <View
                          style={[
                            styles.radioOuter,
                            isSelected && styles.radioOuterSelected,
                          ]}
                        >
                          {isSelected && (
                            <View style={styles.checkContainer}>
                              <Check size={14} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                        </View>
                        <View style={styles.planInfo}>
                          <View style={styles.planNameRow}>
                            <Text style={styles.planName}>{plan.name}</Text>
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
                          </View>
                          <View style={styles.discountRow}>
                            <Gift size={14} color="#F97171" />
                            <Text style={styles.discountText}>{plan.discount}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.planRight}>
                        <Text style={styles.originalPrice}>
                          {getOriginalPrice(plan.id)}
                        </Text>
                        <Text style={[
                          styles.discountedPrice,
                          isHighlighted && styles.discountedPriceHighlighted
                        ]}>
                          {getDiscountedPrice(plan.id)}{getPeriodLabel(plan.id)}
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
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueText}>Get Unlimited Now</Text>
                <Gift size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <View style={styles.footerLeft}>
              <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
                <Text style={styles.footerLink}>Privacy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity onPress={() => router.push("/terms-of-service")}>
                <Text style={styles.footerLink}>Terms</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cancelText}>Cancel Anytime</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F97171",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  restoreText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  illustrationImage: {
    width: 280,
    height: 200,
    opacity: 0,
  },
  mascotOverlay: {
    position: "absolute",
    top: 20,
    alignItems: "center",
  },
  mascotEmoji: {
    fontSize: 120,
  },
  backToText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FEE2E2",
    letterSpacing: 4,
    marginTop: -20,
  },
  schoolText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FEE2E2",
    letterSpacing: 8,
    marginTop: -4,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 14,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardSelected: {
    borderColor: "#F97171",
    backgroundColor: "#FFF5F5",
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
    flex: 1,
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#F97171",
    backgroundColor: "#F97171",
  },
  checkContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  planInfo: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discountText: {
    fontSize: 13,
    color: "#F97171",
    fontWeight: "500",
  },
  planRight: {
    alignItems: "flex-end",
  },
  originalPrice: {
    fontSize: 13,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  discountedPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  discountedPriceHighlighted: {
    color: "#F97171",
  },
  continueButton: {
    backgroundColor: "#374151",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLink: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "500",
  },
  footerDivider: {
    color: "#1F2937",
    fontSize: 14,
  },
  cancelText: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "500",
  },
});
