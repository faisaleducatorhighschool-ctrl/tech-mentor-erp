import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetStoreSettings,
  useGetStoreWishlist,
  useRemoveFromStoreWishlist,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useCart } from "@/contexts/CartContext";

export default function WishlistScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useCustomerAuth();
  const { addItem } = useCart();
  const { data: settings } = useGetStoreSettings();
  const currency = settings?.currency ?? "PKR";

  const { data: wishlist, isLoading } = useGetStoreWishlist({ query: { enabled: !!token } as any });
  const removeFromWishlist = useRemoveFromStoreWishlist();

  if (!token) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Feather name="heart" size={64} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to see your wishlist</Text>
        <Pressable
          onPress={() => router.push("/auth")}
          style={[styles.authBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.authBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const items = wishlist ?? [];

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Feather name="heart" size={64} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your wishlist is empty</Text>
        <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
          Save products you love by tapping the heart icon.
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/shop")}
          style={[styles.authBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.authBtnText, { color: colors.primaryForeground }]}>Browse Products</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={items}
      keyExtractor={(i: any) => String(i.productId ?? i.id)}
      contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
      renderItem={({ item }: { item: any }) => {
        const price = item.discountPrice != null ? Number(item.discountPrice) : Number(item.salePrice ?? 0);
        return (
          <Pressable
            onPress={() => router.push(`/product/${item.productId ?? item.id}`)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.imgBox, { backgroundColor: colors.muted }]}>
              <Feather name="book-open" size={28} color={colors.mutedForeground} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>{item.name ?? item.productName}</Text>
              <Text style={[styles.price, { color: colors.primary }]}>{currency} {price.toLocaleString()}</Text>
              <Pressable
                onPress={async () => {
                  addItem({ productId: item.productId ?? item.id, name: item.name ?? item.productName, price, salePrice: Number(item.salePrice ?? price), stock: item.stock ?? 99 });
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                style={[styles.addBtn, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
              >
                <Feather name="shopping-cart" size={13} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>Add to Cart</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => removeFromWishlist.mutate({ productId: item.productId ?? item.id })}
              style={styles.removeBtn}
            >
              <Feather name="heart" size={20} color="#ef4444" />
            </Pressable>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 12 },
  emptyMsg: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  authBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 },
  authBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  card: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden", gap: 12, padding: 12 },
  imgBox: { width: 70, height: 80, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  price: { fontSize: 14, fontFamily: "Inter_700Bold" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, marginTop: 2 },
  addBtnText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  removeBtn: { padding: 6, alignSelf: "flex-start" },
});
