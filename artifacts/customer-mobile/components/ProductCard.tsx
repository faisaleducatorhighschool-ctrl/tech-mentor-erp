import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  id: number;
  name: string;
  salePrice: number;
  discountPrice?: number | null;
  stock: number;
  categoryName?: string | null;
  currency?: string;
}

export function ProductCard({ id, name, salePrice, discountPrice, stock, categoryName, currency = "PKR" }: Props) {
  const colors = useColors();
  const router = useRouter();
  const price = discountPrice ?? salePrice;
  const hasDiscount = discountPrice != null && discountPrice < salePrice;

  return (
    <Pressable
      onPress={() => router.push(`/product/${id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
        <Feather name="book-open" size={32} color={colors.mutedForeground} />
      </View>
      <View style={styles.info}>
        {categoryName ? (
          <Text style={[styles.category, { color: colors.mutedForeground }]} numberOfLines={1}>
            {categoryName}
          </Text>
        ) : null}
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {currency} {price.toLocaleString()}
          </Text>
          {hasDiscount && (
            <Text style={[styles.original, { color: colors.mutedForeground }]}>
              {currency} {salePrice.toLocaleString()}
            </Text>
          )}
        </View>
        {stock === 0 ? (
          <Text style={[styles.outStock, { color: colors.destructive }]}>Out of Stock</Text>
        ) : stock <= 5 ? (
          <Text style={[styles.lowStock, { color: colors.accent }]}>Only {stock} left</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    flex: 1,
  },
  imagePlaceholder: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { padding: 10, gap: 3 },
  category: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  name: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  price: { fontSize: 14, fontFamily: "Inter_700Bold" },
  original: { fontSize: 11, fontFamily: "Inter_400Regular", textDecorationLine: "line-through" },
  outStock: { fontSize: 11, fontFamily: "Inter_500Medium" },
  lowStock: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
