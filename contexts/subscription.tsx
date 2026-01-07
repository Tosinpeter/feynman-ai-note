import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";

function getRCToken() {
  if (__DEV__ || Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

const rcToken = getRCToken();
if (rcToken) {
  Purchases.configure({ apiKey: rcToken });
  console.log("[RevenueCat] Configured with token");
}

export const [SubscriptionContext, useSubscription] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (rcToken) {
          setIsInitialized(true);
          console.log("[RevenueCat] Initialized successfully");
        }
      } catch (error) {
        console.error("[RevenueCat] Initialization error:", error);
      }
    };
    init();
  }, []);

  const customerInfoQuery = useQuery({
    queryKey: ["customerInfo"],
    queryFn: async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        console.log("[RevenueCat] Customer info fetched:", info.entitlements.active);
        return info;
      } catch (error) {
        console.error("[RevenueCat] Error fetching customer info:", error);
        throw error;
      }
    },
    enabled: isInitialized,
    staleTime: 1000 * 60 * 5,
  });

  const offeringsQuery = useQuery({
    queryKey: ["offerings"],
    queryFn: async () => {
      try {
        const offerings = await Purchases.getOfferings();
        console.log("[RevenueCat] Offerings fetched:", offerings.current?.identifier);
        return offerings;
      } catch (error) {
        console.error("[RevenueCat] Error fetching offerings:", error);
        throw error;
      }
    },
    enabled: isInitialized,
    staleTime: 1000 * 60 * 10,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log("[RevenueCat] Purchasing package:", pkg.identifier);
      const result = await Purchases.purchasePackage(pkg);
      return result;
    },
    onSuccess: (data) => {
      console.log("[RevenueCat] Purchase successful:", data.customerInfo.entitlements.active);
      queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
    },
    onError: (error: any) => {
      console.error("[RevenueCat] Purchase error:", error);
      if (!error.userCancelled) {
        Alert.alert("Purchase Failed", error.message || "Something went wrong. Please try again.");
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log("[RevenueCat] Restoring purchases...");
      const info = await Purchases.restorePurchases();
      return info;
    },
    onSuccess: (data) => {
      console.log("[RevenueCat] Restore successful:", data.entitlements.active);
      queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
      const hasPremium = data.entitlements.active["premium"] !== undefined;
      if (hasPremium) {
        Alert.alert("Success!", "Your purchases have been restored.");
      } else {
        Alert.alert("No Purchases Found", "We couldn't find any previous purchases to restore.");
      }
    },
    onError: (error: any) => {
      console.error("[RevenueCat] Restore error:", error);
      Alert.alert("Restore Failed", error.message || "Something went wrong. Please try again.");
    },
  });

  const isPremium = customerInfoQuery.data?.entitlements.active["premium"] !== undefined;

  const currentOffering = offeringsQuery.data?.current;

  const { mutateAsync: purchaseAsync } = purchaseMutation;
  const { mutateAsync: restoreAsync } = restoreMutation;

  const purchase = useCallback(
    (pkg: PurchasesPackage) => {
      return purchaseAsync(pkg);
    },
    [purchaseAsync]
  );

  const restore = useCallback(() => {
    return restoreAsync();
  }, [restoreAsync]);

  return {
    isInitialized,
    isPremium,
    customerInfo: customerInfoQuery.data,
    isLoadingCustomerInfo: customerInfoQuery.isLoading,
    currentOffering,
    isLoadingOfferings: offeringsQuery.isLoading,
    purchase,
    isPurchasing: purchaseMutation.isPending,
    restore,
    isRestoring: restoreMutation.isPending,
    refetchCustomerInfo: () => queryClient.invalidateQueries({ queryKey: ["customerInfo"] }),
  };
});
