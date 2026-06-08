import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListStoreOrders } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#16a34a",
  cancelled: "#ef4444",
};

export default function OrdersScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useCustomerAuth();
  const { data: orders, isLoading } = useListStoreOrders({ query: { enabled: !!token } as any });

  useEffect(() => {
    if (!token) router.replace("/auth");
  }, [token]);

  if (!token) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : !orders?.length ? (
        <View style={styles.empty}>
          <Feather name="package" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
          <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
            Your order history will appear here.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/shop")}
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.shopBtnText, { color: colors.primaryForeground }]}>Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
          renderItem={({ item }) => {
            const statusColor = STATUS_COLORS[item.status ?? "pending"] ?? "#64748b";
            return (
              <Pressable
                onPress={() => router.push(`/order/${item.orderNumber}`)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.orderNum, { color: colors.primary }]}>{item.orderNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {(item.status ?? "pending").charAt(0).toUpperCase() + (item.status ?? "pending").slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                </Text>
                <View style={styles.cardBottom}>
                  <Text style={[styles.total, { color: colors.foreground }]}>
                    PKR {Number(item.totalAmount).toLocaleString()}
                  </Text>
                  <View style={styles.chevronRow}>
                    <Text style={[styles.viewDetail, { color: colors.primary }]}>View Details</Text>
                    <Feather name="chevron-right" size={14} color={colors.primary} />
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 12 },
  emptyMsg: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  shopBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 },
  shopBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderNum: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  total: { fontSize: 16, fontFamily: "Inter_700Bold" },
  chevronRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewDetail: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
