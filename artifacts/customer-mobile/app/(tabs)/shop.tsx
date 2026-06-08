import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetStoreSettings,
  useListStoreCategories,
  useListStoreProducts,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const params = useLocalSearchParams<{ categoryId?: string }>();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId, 10) : null
  );
  const [page, setPage] = useState(1);

  const { data: settings } = useGetStoreSettings();
  const { data: categories } = useListStoreCategories();
  const { data: products, isLoading } = useListStoreProducts(
    {
      search: search || undefined,
      categoryId: selectedCategory ?? undefined,
      page,
      limit: 20,
    }
  );

  const currency = settings?.currency ?? "PKR";
  const items = products?.data ?? [];
  const totalPages = products?.totalPages ?? 1;

  function resetPage() { setPage(1); }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={(t) => { setSearch(t); resetPage(); }}
            placeholder="Search books..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search ? (
            <Pressable onPress={() => { setSearch(""); resetPage(); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {categories && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          style={[styles.catScroll, { borderBottomColor: colors.border }]}
        >
          <Pressable
            onPress={() => { setSelectedCategory(null); resetPage(); }}
            style={[
              styles.catChip,
              { backgroundColor: selectedCategory === null ? colors.primary : colors.muted, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.catChipText, { color: selectedCategory === null ? "#fff" : colors.foreground }]}>
              All
            </Text>
          </Pressable>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => { setSelectedCategory(c.id); resetPage(); }}
              style={[
                styles.catChip,
                { backgroundColor: selectedCategory === c.id ? colors.primary : colors.muted, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.catChipText, { color: selectedCategory === c.id ? "#fff" : colors.foreground }]}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="book" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ padding: 12, paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 80 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                id={item.id}
                name={item.name}
                salePrice={Number(item.salePrice)}
                discountPrice={item.discountPrice != null ? Number(item.discountPrice) : null}
                stock={item.stock ?? 0}
                categoryName={(item as any).categoryName}
                currency={currency}
              />
            </View>
          )}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  disabled={page <= 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  style={[styles.pageBtn, { opacity: page <= 1 ? 0.4 : 1, backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  <Feather name="chevron-left" size={18} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.pageText, { color: colors.mutedForeground }]}>
                  {page} / {totalPages}
                </Text>
                <Pressable
                  disabled={page >= totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={[styles.pageBtn, { opacity: page >= totalPages ? 0.4 : 1, backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  <Feather name="chevron-right" size={18} color={colors.foreground} />
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  catScroll: { maxHeight: 50, borderBottomWidth: 1 },
  catList: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: "center" },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  row: { gap: 10, marginBottom: 10 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, marginTop: 80 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 16 },
  pageBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  pageText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
