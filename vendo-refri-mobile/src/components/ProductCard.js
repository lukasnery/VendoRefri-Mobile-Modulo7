import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl } from "../services/api";
import { colors, spacing } from "../theme";
import AppButton from "./AppButton";

export default function ProductCard({ product, isAdmin, onEdit, onDelete, onBuy }) {
  const source = imageUrl(product.imagemUrl);
  return (
    <View style={styles.card}>
      {source ? (
        <Image source={{ uri: source }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>Sem imagem</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name}>{product.nome}</Text>
        <Text style={styles.price}>R$ {Number(product.preco).toFixed(2).replace(".", ",")}</Text>
        <Text style={[styles.stock, product.estoque <= 5 && styles.lowStock]}>
          Estoque: {product.estoque}
        </Text>
        <View style={styles.actions}>
          {isAdmin ? (
            <>
              <View style={styles.action}><AppButton title="Editar" variant="secondary" compact onPress={onEdit} /></View>
              <View style={styles.action}><AppButton title="Excluir" variant="danger" compact onPress={onDelete} /></View>
            </>
          ) : (
            <View style={styles.action}><AppButton title="Comprar" compact onPress={onBuy} disabled={product.estoque <= 0} /></View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, marginBottom: spacing.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  image: { width: "100%", height: 150, backgroundColor: "#F3F4F6" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  placeholderText: { color: colors.muted },
  body: { padding: spacing.md },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  price: { fontSize: 17, color: colors.primary, fontWeight: "700", marginTop: 4 },
  stock: { color: colors.muted, marginTop: 4 },
  lowStock: { color: colors.warning, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
});
