import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Screen from "../components/Screen";
import api, { apiErrorMessage, imageUrl } from "../services/api";
import { colors, spacing } from "../theme";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [quantidade, setQuantidade] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        setError(apiErrorMessage(err));
      }
    })();
  }, [productId]);

  async function buy() {
    const q = Number(quantidade);
    if (!Number.isInteger(q) || q <= 0) {
      setError("A quantidade deve ser um inteiro maior que zero.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/orders", { productId, quantidade: q });
      Alert.alert("Pedido realizado", "O estoque foi atualizado pela API.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!product) {
    return <Screen><Text style={styles.error}>{error || "Carregando produto..."}</Text></Screen>;
  }

  return (
    <Screen>
      {product.imagemUrl ? <Image source={{ uri: imageUrl(product.imagemUrl) }} style={styles.image} /> : null}
      <Text style={styles.title}>{product.nome}</Text>
      <Text style={styles.price}>R$ {Number(product.preco).toFixed(2).replace(".", ",")}</Text>
      <Text style={styles.stock}>Estoque disponível: {product.estoque}</Text>
      <View style={{ height: spacing.lg }} />
      <AppInput label="Quantidade" value={quantidade} onChangeText={setQuantidade} keyboardType="number-pad" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton title="Confirmar pedido" onPress={buy} loading={loading} disabled={product.estoque <= 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: 220, borderRadius: 14, backgroundColor: "#eee", marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  price: { fontSize: 22, fontWeight: "800", color: colors.primary, marginTop: 4 },
  stock: { color: colors.muted, marginTop: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.md },
});
