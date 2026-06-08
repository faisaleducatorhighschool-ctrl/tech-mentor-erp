import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoreLogin, useStoreRegister } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function AuthScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useCustomerAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const loginMutation = useStoreLogin();
  const registerMutation = useStoreRegister();
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  async function handleSubmit() {
    setError(null);
    try {
      if (tab === "login") {
        if (!email.trim() || !password) { setError("Email and password required"); return; }
        const res = await loginMutation.mutateAsync({ data: { email: email.trim(), password } });
        await signIn(res.token, res.customer as any);
      } else {
        if (!name.trim() || !email.trim() || !phone.trim() || !password) {
          setError("All fields are required");
          return;
        }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        const res = await registerMutation.mutateAsync({ data: { name: name.trim(), email: email.trim(), phone: phone.trim(), password } });
        await signIn(res.token, res.customer as any);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e?.response?.data?.error ?? (tab === "login" ? "Invalid credentials" : "Registration failed"));
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 20, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>

          <View style={styles.logoArea}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoChar}>FB</Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Faisal Book Depot</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Customer Portal</Text>
          </View>

          <View style={[styles.tabRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            {(["login", "register"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => { setTab(t); setError(null); }}
                style={[styles.tabBtn, tab === t && { backgroundColor: colors.background }]}
              >
                <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
                  {t === "login" ? "Sign In" : "Register"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.form}>
            {tab === "register" && (
              <>
                <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" colors={colors} />
                <Field label="Phone" value={phone} onChange={setPhone} placeholder="+92 xxx xxxxxxx" keyboardType="phone-pad" colors={colors} />
              </>
            )}
            <Field label="Email" value={email} onChange={setEmail} placeholder="email@example.com" keyboardType="email-address" colors={colors} autoCapitalize="none" />
            <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" secure colors={colors} />
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}>
              <Text style={styles.errorMsg}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{tab === "login" ? "Sign In" : "Create Account"}</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, secure, keyboardType, colors, autoCapitalize }: any) {
  return (
    <View style={fieldStyles.field}>
      <Text style={[fieldStyles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={!!secure}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "words"}
        autoCorrect={false}
        style={[fieldStyles.input, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, alignItems: "stretch" },
  closeBtn: { alignSelf: "flex-end", padding: 4, marginBottom: 12 },
  logoArea: { alignItems: "center", marginBottom: 28 },
  logoBox: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoChar: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  tabRow: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 3, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  form: { gap: 14, marginBottom: 20 },
  errorBox: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  errorMsg: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#ef4444", textAlign: "center" },
  submitBtn: { paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});

const fieldStyles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  input: { height: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
});
