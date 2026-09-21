import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../services/api";
import { colors, spacing } from "../theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ nome: "", email: "", cpf: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    setError("");
    if (!form.nome.trim() || !form.email.trim() || !form.cpf.trim() || form.senha.length < 6) {
      setError("Preencha todos os campos. A senha deve possuir ao menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      await register(form);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Novos cadastros recebem o perfil USER. O administrador é criado pelo seed da API.</Text>
          <AppInput label="Nome" value={form.nome} onChangeText={(v) => update("nome", v)} />
          <AppInput label="E-mail" value={form.email} onChangeText={(v) => update("email", v)} autoCapitalize="none" keyboardType="email-address" />
          <AppInput label="CPF" value={form.cpf} onChangeText={(v) => update("cpf", v)} keyboardType="numeric" maxLength={14} />
          <AppInput label="Senha" value={form.senha} onChangeText={(v) => update("senha", v)} secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton title="Cadastrar" onPress={submit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.muted, lineHeight: 20, marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md },
});
