import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.nome}</Text>
        <Text style={styles.line}>{user?.email}</Text>
        <Text style={styles.line}>CPF: {user?.cpf}</Text>
        <View style={[styles.badge, user?.role === "ADMIN" ? styles.admin : styles.user]}>
          <Text style={styles.badgeText}>{user?.role}</Text>
        </View>
      </View>
      <Text style={styles.info}>
        O controle funcional é aplicado tanto na interface quanto na API. Somente ADMIN pode cadastrar, editar ou excluir produtos.
      </Text>
      <AppButton title="Sair" variant="secondary" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "900", color: colors.text, marginBottom: spacing.lg },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.lg },
  name: { fontSize: 22, fontWeight: "900", color: colors.text },
  line: { color: colors.muted, marginTop: spacing.sm },
  badge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: spacing.md },
  admin: { backgroundColor: "#FEE4E2" },
  user: { backgroundColor: "#ECFDF3" },
  badgeText: { fontWeight: "800", color: colors.text },
  info: { color: colors.muted, lineHeight: 21, marginVertical: spacing.lg },
});
