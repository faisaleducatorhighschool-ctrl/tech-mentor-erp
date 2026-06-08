import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAddToStoreWishlist,
  useGetStoreProduct,
  useGetStoreSettings,
  useGetStoreWishlist,
  useRemoveFromStoreWishlist,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function ProductDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const { token } = useCustomerAuth();
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading } = useGetStoreProduct(Number(id));
  const { data: settings } = useGetStoreSettings();
  const { data: wishlist } = useGetStoreWishlist({ query: { enabled: !!token } as any });
  const addToWishlist = useAddToStoreWishlist();
  const removeFromWishlist = useRemoveFromStoreWishlist();

  const currency = settings?.currency ?? "PKR";
  const isInWishlist = wishlist?.some((w: any) => w.productId === Number(id) || w.id === Number(id));

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Product not found</Text>
      </View>
    );
  }

  const price = product.discountPrice != null ? Number(product.discountPrice) : Number(product.salePrice);
  const hasDiscount = product.discountPrice != null && Number(product.discountPrice) < Number(product.salePrice);
  const inStock = (product.stock ?? 0) > 0;

  async function handleAddToCart() {
    if (!inStock) return;
    addItem({
      productId: product!.id,
      name: product!.name,
      price,
      salePrice: Number(product!.salePrice),
      stock: product!.stock ?? 0,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  async function handleWishlist() {
    if (!token) { router.push("/auth"); return; }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isInWishlist) {
      removeFromWishlist.mutate({ productId: Number(id) });
    } else {
      addToWishlist.mutate({ data: { productId: Number(id) } });
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.imageArea, { backgroundColor: colors.muted }]}>
          <Feather name="book-open" size={80} color={colors.mutedForeground} />
        </View>

        <View style={styles.body}>
          {(product as any).categoryName ? (
            <Text style={[styles.category, { color: colors.primary }]}>{(product as any).categoryName}</Text>
          ) : null}
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>
            <Pressable onPress={handleWishlist} style={styles.wishBtn}>
              <Feather
                name={isInWishlist ? "heart" : "heart"}
                size={22}
                color={isInWishlist ? "#ef4444" : colors.mutedForeground}
              />
            </Pressable>
          </View>

          {product.sku ? (
            <Text style={[styles.sku, { color: colors.mutedForeground }]}>SKU: {product.sku}</Text>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {currency} {price.toLocaleString()}
            </Text>
            {hasDiscount && (
              <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>
                {currency} {Number(product.salePrice).toLocaleString()}
              </Text>
            )}
            {hasDiscount && (
              <View style={[styles.discountBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.discountText}>
                  {Math.round((1 - price / Number(product.salePrice)) * 100)}% off
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.stockRow, { backgroundColor: inStock ? "#dcfce7" : "#fee2e2" }]}>
            <Feather
              name={inStock ? "check-circle" : "x-circle"}
              size={14}
              color={inStock ? "#16a34a" : "#ef4444"}
            />
            <Text style={[styles.stockText, { color: inStock ? "#16a34a" : "#ef4444" }]}>
              {inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </Text>
          </View>

          {product.description ? (
            <>
              <Text style={[styles.descLabel, { color: colors.foreground }]}>Description</Text>
              <Text style={[styles.desc, { color: colors.mutedForeground }]}>{product.description}</Text>
            </>
          ) : null}

          {product.unit ? (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>Unit: {product.unit}</Text>
          ) : null}
        </View>

        <View style={{ height: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80 }} />
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8 }]}>
        <Pressable
          onPress={handleAddToCart}
          disabled={!inStock}
          style={[
            styles.cartBtn,
            { backgroundColor: addedToCart ? colors.success : colors.primary, opacity: !inStock ? 0.5 : 1 },
          ]}
        >
          <Feather name={addedToCart ? "check" : "shopping-cart"} size={18} color="#fff" />
          <Text style={styles.cartBtnText}>
            {addedToCart ? "Added to Cart!" : inStock ? "Add to Cart" : "Out of Stock"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  imageArea: { height: 240, alignItems: "center", justifyContent: "center" },
  body: { padding: 20, gap: 8 },
  category: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 28 },
  wishBtn: { padding: 4 },
  sku: { fontSize: 12, fontFamily: "Inter_400Regular" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  price: { fontSize: 24, fontFamily: "Inter_700Bold" },
  originalPrice: { fontSize: 15, fontFamily: "Inter_400Regular", textDecorationLine: "line-through" },
  discountBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  discountText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  stockText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  descLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  desc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  cartBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 12 },
  cartBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
