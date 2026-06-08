import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetStoreSettings, usePlaceStoreOrder } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "truck" as const },
  { id: "jazzcash", label: "JazzCash", icon: "smartphone" as const },
  { id: "easypaisa", label: "EasyPaisa", icon: "smartphone" as const },
  { id: "bank_transfer", label: "Bank Transfer", icon: "credit-card" as const },
];

export default function CheckoutScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, total, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const { data: settings } = useGetStoreSettings();
  const placeOrder = usePlaceStoreOrder();
  const currency = settings?.currency ?? "PKR";

  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    router.back();
    return null;
  }

  async function handlePlaceOrder() {
    setError(null);
    if (!phone.trim()) { setError("Phone number is required"); return; }
    if (!address.trim()) { setError("Delivery address is required"); return; }

    try {
      const res = await placeOrder.mutateAsync({
        data: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod: paymentMethod as any,
          deliveryAddress: address.trim(),
          phone: phone.trim(),
          name: name.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      router.replace({ pathname: "/order-confirm", params: { orderNumber: (res as any).orderNumber } });
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to place order. Please try again.");
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Delivery Details</Text>
          <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" colors={colors} />
          <Field label="Phone *" value={phone} onChange={setPhone} placeholder="+92 xxx xxxxxxx" keyboardType="phone-pad" colors={colors} />
          <Field label="Delivery Address *" value={address} onChange={setAddress} placeholder="Street, City" colors={colors} multiline />
          <Field label="Order Notes" value={notes} onChange={setNotes} placeholder="Any special instructions..." colors={colors} multiline />

          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => (
            <Pressable
              key={pm.id}
              onPress={() => setPaymentMethod(pm.id)}
              style={[
                styles.pmRow,
                {
                  backgroundColor: paymentMethod === pm.id ? colors.secondary : colors.muted,
                  borderColor: paymentMethod === pm.id ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.pmRadio, { borderColor: colors.primary }]}>
                {paymentMethod === pm.id && <View style={[styles.pmRadioInner, { backgroundColor: colors.primary }]} />}
              </View>
              <Feather name={pm.icon} size={16} color={paymentMethod === pm.id ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.pmLabel, { color: paymentMethod === pm.id ? colors.primary : colors.foreground }]}>
                {pm.label}
              </Text>
            </Pressable>
          ))}

          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Order Summary</Text>
          <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {items.map((item) => (
              <View key={item.productId} style={styles.summaryRow}>
                <Text style={[styles.summaryName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.name} × {item.quantity}
                </Text>
                <Text style={[styles.summaryPrice, { color: colors.foreground }]}>
                  {currency} {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={[styles.totalLine, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {currency} {total.toLocaleString()}
              </Text>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#fee2e2" }]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8 }]}>
          <Pressable
            onPress={handlePlaceOrder}
            disabled={placeOrder.isPending}
            style={[styles.orderBtn, { backgroundColor: colors.primary, opacity: placeOrder.isPending ? 0.7 : 1 }]}
          >
            {placeOrder.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.orderBtnText}>Place Order</Text>
                <Text style={styles.orderBtnSub}>
                  {currency} {total.toLocaleString()} · {paymentMethod.toUpperCase()}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType, colors, multiline }: any) {
  return (
    <View style={fieldStyles.field}>
      <Text style={[fieldStyles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? "default"}
        multiline={!!multiline}
        numberOfLines={multiline ? 3 : 1}
        style={[fieldStyles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground, height: multiline ? 80 : 48 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 20, marginBottom: 10 },
  pmRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  pmRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  pmRadioInner: { width: 9, height: 9, borderRadius: 5 },
  pmLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
  summaryBox: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10 },
  summaryName: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, marginTop: 4 },
  totalLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  totalAmount: { fontSize: 18, fontFamily: "Inter_700Bold" },
  errorBox: { padding: 12, borderRadius: 8, marginTop: 12 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#ef4444", textAlign: "center" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  orderBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  orderBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  orderBtnSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
});

const fieldStyles = StyleSheet.create({
  field: { gap: 6, marginBottom: 12 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular", textAlignVertical: "top" },
});
