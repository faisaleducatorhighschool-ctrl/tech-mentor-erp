import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function OrderConfirmScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderNumber } = useLocalSearchParams<{ orderNumber?: string }>();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: "#dcfce7" }]}>
          <Feather name="check-circle" size={56} color="#16a34a" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Order Placed!</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Thank you for shopping at Faisal Book Depot. Your order has been received.
        </Text>
        {orderNumber ? (
          <View style={[styles.orderBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.orderLabel, { color: colors.mutedForeground }]}>Order Number</Text>
            <Text style={[styles.orderNumber, { color: colors.primary }]}>{orderNumber}</Text>
          </View>
        ) : null}
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          We'll contact you on your provided phone number to confirm delivery.
        </Text>
      </View>

      <View style={[styles.actions, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <Pressable
          onPress={() => router.replace("/(tabs)/home")}
          style={[styles.homeBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.homeBtnText, { color: colors.primaryForeground }]}>Continue Shopping</Text>
        </Pressable>
        {orderNumber ? (
          <Pressable
            onPress={() => router.replace("/orders")}
            style={[styles.ordersBtn, { borderColor: colors.primary }]}
          >
            <Text style={[styles.ordersBtnText, { color: colors.primary }]}>View My Orders</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 24, maxWidth: 320 },
  orderBox: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  orderLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  orderNumber: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 4 },
  note: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280, lineHeight: 20 },
  actions: { gap: 10, paddingTop: 16 },
  homeBtn: { paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  homeBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  ordersBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  ordersBtnText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});
