import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetStoreSettings } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/contexts/CartContext";

export default function CartScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const { data: settings } = useGetStoreSettings();
  const currency = settings?.currency ?? "PKR";

  if (items.length === 0) {
    return (
      <View style={[styles.emptyRoot, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Cart</Text>
        <View style={styles.emptyCenter}>
          <Feather name="shopping-cart" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
            Browse our collection and add items to your cart.
          </Text>
          <Pressable
            onPress={() => router.push("/shop")}
            style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.shopBtnText, { color: colors.primaryForeground }]}>Browse Products</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Cart ({items.length})</Text>
        <Pressable onPress={clearCart}>
          <Text style={[styles.clearText, { color: colors.destructive }]}>Clear all</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.productId)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.itemIcon, { backgroundColor: colors.muted }]}>
              <Feather name="book-open" size={24} color={colors.mutedForeground} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>
                {currency} {item.price.toLocaleString()}
              </Text>
              <View style={styles.qtyRow}>
                <Pressable
                  onPress={() => updateQty(item.productId, item.quantity - 1)}
                  style={[styles.qtyBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  <Feather name="minus" size={14} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.qty, { color: colors.foreground }]}>{item.quantity}</Text>
                <Pressable
                  onPress={() => updateQty(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  style={[styles.qtyBtn, { backgroundColor: colors.muted, borderColor: colors.border, opacity: item.quantity >= item.stock ? 0.4 : 1 }]}
                >
                  <Feather name="plus" size={14} color={colors.foreground} />
                </Pressable>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.lineTotal, { color: colors.foreground }]}>
                {currency} {(item.price * item.quantity).toLocaleString()}
              </Text>
              <Pressable onPress={() => removeItem(item.productId)} style={styles.removeBtn}>
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </Pressable>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
          <Text style={[styles.totalValue, { color: colors.foreground }]}>
            {currency} {total.toLocaleString()}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/checkout")}
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.checkoutBtnText, { color: colors.primaryForeground }]}>
            Proceed to Checkout
          </Text>
          <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  emptyRoot: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  heading: { fontSize: 22, fontFamily: "Inter_700Bold" },
  clearText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  emptyCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 16 },
  emptyMsg: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280 },
  shopBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 },
  shopBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  item: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  itemIcon: { width: 60, height: 70, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  itemPrice: { fontSize: 12, fontFamily: "Inter_500Medium" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qty: { fontSize: 14, fontFamily: "Inter_600SemiBold", minWidth: 20, textAlign: "center" },
  itemRight: { alignItems: "flex-end", justifyContent: "space-between" },
  lineTotal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  removeBtn: { padding: 4 },
  footer: { paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, gap: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  checkoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 12 },
  checkoutBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
