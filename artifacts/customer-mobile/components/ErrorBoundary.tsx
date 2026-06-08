import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { reloadAppAsync } from "expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function ErrorFallback() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 32 }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Something went wrong</Text>
      <Text style={[styles.msg, { color: colors.mutedForeground }]}>
        An unexpected error occurred. Please restart the app.
      </Text>
      <Pressable
        onPress={() => reloadAppAsync()}
        style={[styles.btn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Restart App</Text>
      </Pressable>
    </View>
  );
}

type State = { hasError: boolean };
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 12, textAlign: "center" },
  msg: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 28, lineHeight: 22 },
  btn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10 },
  btnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
