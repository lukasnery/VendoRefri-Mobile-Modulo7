import React, { useCallback, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import api, { apiErrorMessage } from "../services/api";
import { colors, spacing } from "../theme";

export default function OrdersScreen() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const response = await api.get("/orders?page=1&limit=50");
      setOrders(response.data.items || []);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function cancel(order) {
    Alert.alert("Cancelar pedido", "Ao cancelar, a quantidade será devolvida ao estoque.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar pedido",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/orders/${order.id}`);
            await load();
          } catch (err) {
            Alert.alert("Erro", apiErrorMessage(err));
          }
        },
      },
    ]);
  }

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.content}
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{isAdmin ? "Todos os pedidos" : "Meus pedidos"}</Text>
            <Text style={styles.subtitle}>{isAdmin ? "Perfil ADMIN visualiza todos os usuários." : "Perfil USER visualiza apenas os próprios pedidos."}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.product}>{item.product?.nome}</Text>
            {isAdmin ? <Text style={styles.muted}>Cliente: {item.user?.nome}</Text> : null}
            <Text style={styles.muted}>Quantidade: {item.quantidade}</Text>
            <Text style={styles.muted}>Data: {new Date(item.createdAt).toLocaleString("pt-BR")}</Text>
            <View style={{ marginTop: spacing.md }}><AppButton title="Cancelar pedido" variant="secondary" compact onPress={() => cancel(item)} /></View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{error || "Nenhum pedido encontrado."}</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 40, flexGrow: 1 },
  header: { marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 4, lineHeight: 20 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, marginBottom: spacing.md },
  product: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 4 },
  muted: { color: colors.muted, marginTop: 2 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 80 },
});
