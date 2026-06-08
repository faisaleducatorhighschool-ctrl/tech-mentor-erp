import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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
  useGetStoreFeatured,
  useGetStoreSettings,
  useListStoreCategories,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: settings } = useGetStoreSettings();
  const { data: featured, isLoading } = useGetStoreFeatured();
  const { data: categories } = useListStoreCategories();

  const currency = settings?.currency ?? "PKR";
  const storeName = settings?.storeName ?? "Faisal Book Depot";

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.storeName}>{storeName}</Text>
          <Text style={styles.storeTagline}>Books & Stationery · Khanpur</Text>
        </View>
        <Pressable onPress={() => router.push("/wishlist")} style={styles.headerBtn}>
          <Feather name="heart" size={22} color="#fff" />
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push("/shop")}
        style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}
      >
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <Text style={[styles.searchHint, { color: colors.mutedForeground }]}>Search books, stationery...</Text>
      </Pressable>

      {categories && categories.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push({ pathname: "/shop", params: { categoryId: String(item.id) } })}
                style={[styles.categoryChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Text style={[styles.categoryChipText, { color: colors.primary }]}>{item.name}</Text>
                {(item as any).productCount > 0 && (
                  <Text style={[styles.categoryCount, { color: colors.mutedForeground }]}>
                    {(item as any).productCount}
                  </Text>
                )}
              </Pressable>
            )}
          />
        </>
      )}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {featured?.newArrivals && featured.newArrivals.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>New Arrivals</Text>
                <Pressable onPress={() => router.push("/shop")}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </Pressable>
              </View>
              <FlatList
                data={featured.newArrivals.slice(0, 8)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => String(p.id)}
                contentContainerStyle={styles.hList}
                renderItem={({ item }) => (
                  <View style={{ width: 150, marginRight: 10 }}>
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
              />
            </>
          )}

          {featured?.bestSelling && featured.bestSelling.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Best Selling</Text>
              <FlatList
                data={featured.bestSelling.slice(0, 8)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => String(p.id)}
                contentContainerStyle={styles.hList}
                renderItem={({ item }) => (
                  <View style={{ width: 150, marginRight: 10 }}>
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
              />
            </>
          )}

          {featured?.discounted && featured.discounted.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>On Sale</Text>
              <FlatList
                data={featured.discounted.slice(0, 8)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => String(p.id)}
                contentContainerStyle={styles.hList}
                renderItem={({ item }) => (
                  <View style={{ width: 150, marginRight: 10 }}>
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
              />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storeName: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  storeTagline: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },
  headerBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchHint: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 10, paddingRight: 16 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  hList: { paddingHorizontal: 16 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  categoryCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
