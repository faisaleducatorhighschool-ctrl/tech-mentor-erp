import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetStoreCustomerMe } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { token, signOut } = useCustomerAuth();

  const { data: customer, isLoading } = useGetStoreCustomerMe({ query: { enabled: !!token } as any });

  async function handleSignOut() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await signOut();
  }

  if (!token) {
    return (
      <View style={[styles.guestRoot, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
        <View style={[styles.avatarBox, { backgroundColor: colors.muted }]}>
          <Feather name="user" size={40} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>Welcome!</Text>
        <Text style={[styles.guestMsg, { color: colors.mutedForeground }]}>
          Sign in to view your orders, wishlist, and manage your profile.
        </Text>
        <Pressable
          onPress={() => router.push("/auth")}
          style={[styles.signInBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.signInBtnText, { color: colors.primaryForeground }]}>Sign In / Register</Text>
        </Pressable>
        <View style={[styles.divider, { borderColor: colors.border }]} />
        <MenuItem icon="shopping-bag" label="Browse Products" onPress={() => router.push("/shop")} colors={colors} />
        <MenuItem icon="heart" label="Wishlist" onPress={() => router.push("/wishlist")} colors={colors} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.guestRoot, { backgroundColor: colors.background, paddingTop: topPad + 40 }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 80 }}
    >
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(customer?.name ?? "U").charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{customer?.name}</Text>
        <Text style={styles.userEmail}>{customer?.email ?? customer?.phone}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow label="Name" value={customer?.name ?? "-"} colors={colors} />
        <InfoRow label="Email" value={customer?.email ?? "-"} colors={colors} />
        <InfoRow label="Phone" value={customer?.phone ?? "-"} colors={colors} />
        {customer?.address ? <InfoRow label="Address" value={customer.address} colors={colors} /> : null}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MenuItem icon="package" label="My Orders" onPress={() => router.push("/orders")} colors={colors} />
        <MenuItem icon="heart" label="Wishlist" onPress={() => router.push("/wishlist")} colors={colors} />
      </View>

      <Pressable
        onPress={handleSignOut}
        style={[styles.signOutBtn, { borderColor: colors.destructive }]}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[rowStyles.value, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, colors }: { icon: any; label: string; onPress: () => void; colors: any }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [rowStyles.menuRow, { opacity: pressed ? 0.7 : 1 }]}>
      <Feather name={icon} size={18} color={colors.primary} />
      <Text style={[rowStyles.menuLabel, { color: colors.foreground }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  guestRoot: { flex: 1, alignItems: "center", paddingHorizontal: 24, gap: 12 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  guestTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  guestMsg: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  signInBtn: { marginTop: 4, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, width: "100%" },
  signInBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  divider: { width: "100%", borderTopWidth: 1, marginVertical: 8 },
  header: { alignItems: "center", paddingBottom: 24, paddingHorizontal: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  section: { margin: 16, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, paddingVertical: 14, borderRadius: 10, borderWidth: 1 },
  signOutText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 13, fontFamily: "Inter_400Regular" },
  value: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
});
