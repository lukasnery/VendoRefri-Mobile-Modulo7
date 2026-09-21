import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../services/api";
import { colors, spacing } from "../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@vendorefri.com");
  const [senha, setSenha] = useState("Troque@123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    if (!email.trim() || !senha) {
      setError("Informe e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), senha);
    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Text style={styles.brand}>VendoRefri</Text>
          <Text style={styles.title}>Acesso ao aplicativo</Text>
          <Text style={styles.subtitle}>Entre para consultar produtos, realizar pedidos ou administrar o estoque.</Text>
        </View>

        <AppInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <AppInput
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Entrar" onPress={handleLogin} loading={loading} />
        <View style={styles.registerRow}>
          <Text style={styles.muted}>Ainda não possui conta?</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("Register")}> Criar conta</Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "center" },
  header: { marginBottom: spacing.xl },
  brand: { color: colors.primary, fontSize: 34, fontWeight: "900" },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: spacing.sm },
  subtitle: { color: colors.muted, lineHeight: 21, marginTop: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.md },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontWeight: "700" },
});
