import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function NotFoundScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Text style={[styles.code, { color: colors.primary }]}>404</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Page not found</Text>
      <Pressable onPress={() => router.replace("/(tabs)/home")} style={[styles.btn, { backgroundColor: colors.primary }]}>
        <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Go Home</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  code: { fontSize: 72, fontFamily: "Inter_700Bold" },
  title: { fontSize: 20, fontFamily: "Inter_500Medium" },
  btn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
