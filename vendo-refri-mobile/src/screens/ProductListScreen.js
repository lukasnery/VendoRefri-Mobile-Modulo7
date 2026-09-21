import React, { useCallback, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AppButton from "../components/AppButton";
import ProductCard from "../components/ProductCard";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import api, { apiErrorMessage } from "../services/api";
import { colors, spacing } from "../theme";

export default function ProductListScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError("");
      const response = await api.get("/products?page=1&limit=50");
      setProducts(response.data.items || []);
    } catch (err) {
      setError(apiErrorMessage(err, "Erro ao carregar produtos."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => {
    loadProducts();
  }, []));

  function confirmDelete(product) {
    Alert.alert(
      "Excluir produto",
      `Deseja excluir “${product.nome}”? Produtos com pedidos vinculados são protegidos pela regra de negócio.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/products/${product.id}`);
              await loadProducts(true);
            } catch (err) {
              Alert.alert("Não foi possível excluir", apiErrorMessage(err));
            }
          },
        },
      ]
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        contentContainerStyle={styles.content}
        data={products}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(true); }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Produtos</Text>
              <Text style={styles.subtitle}>{isAdmin ? "Gerencie o catálogo e o estoque." : "Consulte o catálogo e realize pedidos."}</Text>
            </View>
            {isAdmin ? (
              <View style={{ minWidth: 110 }}><AppButton title="Novo" compact onPress={() => navigation.navigate("ProductForm")} /></View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isAdmin={isAdmin}
            onEdit={() => navigation.navigate("ProductForm", { productId: item.id })}
            onDelete={() => confirmDelete(item)}
            onBuy={() => navigation.navigate("ProductDetail", { productId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{loading ? "Carregando..." : "Nenhum produto encontrado"}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 40, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 4 },
  empty: { flex: 1, minHeight: 250, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.text, fontWeight: "700", fontSize: 18 },
  error: { color: colors.danger, textAlign: "center", marginTop: spacing.sm },
});
