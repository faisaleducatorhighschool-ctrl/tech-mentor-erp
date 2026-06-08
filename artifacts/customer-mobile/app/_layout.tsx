import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { setBaseUrl } from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <CustomerAuthProvider>
            <CartProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="product/[id]" options={{ headerShown: true, title: "Product" }} />
                  <Stack.Screen name="auth" options={{ presentation: "modal", headerShown: false }} />
                  <Stack.Screen name="checkout" options={{ headerShown: true, title: "Checkout" }} />
                  <Stack.Screen name="order-confirm" options={{ headerShown: false }} />
                  <Stack.Screen name="orders" options={{ headerShown: true, title: "My Orders" }} />
                  <Stack.Screen name="order/[orderNumber]" options={{ headerShown: true, title: "Order Details" }} />
                  <Stack.Screen name="wishlist" options={{ headerShown: true, title: "Wishlist" }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </GestureHandlerRootView>
            </CartProvider>
          </CustomerAuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
