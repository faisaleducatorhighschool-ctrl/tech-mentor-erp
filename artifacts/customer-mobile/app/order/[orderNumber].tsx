import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetStoreOrder } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const { data: order, isLoading } = useGetStoreOrder(orderNumber!);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Row label="Order #" value={(order as any).orderNumber ?? orderNumber} colors={colors} bold />
        <Row label="Status" value={String((order as any).status ?? "-")} colors={colors} />
        <Row label="Payment" value={String((order as any).paymentMethod ?? "-")} colors={colors} />
        <Row label="Payment Status" value={String((order as any).paymentStatus ?? "-")} colors={colors} />
        <Row label="Date" value={(order as any).createdAt ? new Date((order as any).createdAt).toLocaleString() : "-"} colors={colors} />
        {(order as any).notes ? <Row label="Notes" value={(order as any).notes} colors={colors} /> : null}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Items</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {((order as any).items ?? []).map((item: any, i: number) => (
          <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
            <View style={styles.itemLeft}>
              <Text style={[styles.itemName, { color: colors.foreground }]}>{item.productName ?? `Product ${item.productId}`}</Text>
              <Text style={[styles.itemQty, { color: colors.mutedForeground }]}>Qty: {item.quantity}</Text>
            </View>
            <Text style={[styles.itemTotal, { color: colors.primary }]}>
              PKR {(Number(item.price) * Number(item.quantity)).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Summary</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Row label="Subtotal" value={`PKR ${Number((order as any).subtotal ?? 0).toLocaleString()}`} colors={colors} />
        {Number((order as any).discount ?? 0) > 0 && (
          <Row label="Discount" value={`-PKR ${Number((order as any).discount).toLocaleString()}`} colors={colors} />
        )}
        {Number((order as any).tax ?? 0) > 0 && (
          <Row label="Tax" value={`PKR ${Number((order as any).tax).toLocaleString()}`} colors={colors} />
        )}
        <Row label="Total" value={`PKR ${Number((order as any).totalAmount ?? 0).toLocaleString()}`} colors={colors} bold />
      </View>
    </ScrollView>
  );
}

function Row({ label, value, colors, bold }: { label: string; value: string; colors: any; bold?: boolean }) {
  return (
    <View style={[rowStyles.row, { borderBottomColor: colors.border }]}>
      <Text style={[rowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[rowStyles.value, { color: colors.foreground, fontFamily: bold ? "Inter_700Bold" : "Inter_400Regular" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 15, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 16, marginBottom: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  itemLeft: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  itemQty: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  itemTotal: { fontSize: 13, fontFamily: "Inter_700Bold" },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 13, fontFamily: "Inter_400Regular" },
  value: { fontSize: 13, flex: 1, textAlign: "right" },
});
