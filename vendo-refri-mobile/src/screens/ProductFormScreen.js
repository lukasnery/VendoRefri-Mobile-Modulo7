import React, { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import api, { apiErrorMessage, imageUrl } from "../services/api";
import { colors, spacing } from "../theme";

export default function ProductFormScreen({ route, navigation }) {
  const { isAdmin } = useAuth();
  const productId = route.params?.productId;
  const [form, setForm] = useState({ nome: "", preco: "", estoque: "" });
  const [existingImage, setExistingImage] = useState(null);
  const [pickedImage, setPickedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert("Acesso restrito", "Somente administradores podem gerenciar produtos.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      return;
    }

    if (productId) {
      (async () => {
        try {
          setLoading(true);
          const response = await api.get(`/products/${productId}`);
          const p = response.data;
          setForm({ nome: p.nome, preco: String(p.preco), estoque: String(p.estoque) });
          setExistingImage(p.imagemUrl || null);
        } catch (err) {
          setError(apiErrorMessage(err));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [productId, isAdmin]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso às imagens para selecionar a foto do produto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert("Imagem muito grande", "Selecione uma imagem de até 5 MB.");
        return;
      }
      setPickedImage(asset);
    }
  }

  function imageFileInfo(asset) {
    const allowed = new Set(["jpg", "jpeg", "png", "webp"]);
    const fromName = asset.fileName?.includes(".")
      ? asset.fileName.split(".").pop()?.toLowerCase()
      : null;

    const mimeToExtension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };

    const extension = allowed.has(fromName) ? fromName : (mimeToExtension[asset.mimeType] || "jpg");
    const mime = asset.mimeType && mimeToExtension[asset.mimeType]
      ? asset.mimeType
      : extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

    const originalBase = asset.fileName?.replace(/\.[^.]+$/, "") || "produto";
    const safeBase = originalBase.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 40) || "produto";

    return { extension, mime, name: `${safeBase}.${extension}` };
  }

  function makeFormData() {
    const data = new FormData();
    data.append("nome", form.nome.trim());
    data.append("preco", form.preco.replace(",", "."));
    data.append("estoque", form.estoque);

    if (pickedImage) {
      const { mime, name } = imageFileInfo(pickedImage);
      data.append("imagem", {
        uri: pickedImage.uri,
        name,
        type: mime,
      });
    }

    return data;
  }

  async function submit() {
    setError("");
    const preco = Number(form.preco.replace(",", "."));
    const estoque = Number(form.estoque);

    if (form.nome.trim().length < 2 || !Number.isFinite(preco) || preco <= 0 || !Number.isInteger(estoque) || estoque < 0) {
      setError("Informe nome, preço maior que zero e estoque inteiro maior ou igual a zero.");
      return;
    }

    try {
      setLoading(true);
      const data = makeFormData();
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (productId) {
        await api.put(`/products/${productId}`, data, config);
      } else {
        await api.post("/products", data, config);
      }

      navigation.goBack();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const preview = pickedImage?.uri || imageUrl(existingImage);

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{productId ? "Editar produto" : "Novo produto"}</Text>
          <Text style={styles.subtitle}>O backend valida extensão, MIME, limite de 5 MB e gera nome único para evitar colisões.</Text>

          <View style={styles.imageBox}>
            {preview ? <Image source={{ uri: preview }} style={styles.image} /> : <Text style={styles.imageText}>Nenhuma imagem selecionada</Text>}
          </View>
          <AppButton title="Selecionar imagem" variant="secondary" onPress={pickImage} />
          <View style={{ height: spacing.lg }} />

          <AppInput label="Nome" value={form.nome} onChangeText={(v) => update("nome", v)} />
          <AppInput label="Preço" value={form.preco} onChangeText={(v) => update("preco", v)} keyboardType="decimal-pad" />
          <AppInput label="Estoque" value={form.estoque} onChangeText={(v) => update("estoque", v)} keyboardType="number-pad" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton title={productId ? "Salvar alterações" : "Cadastrar produto"} onPress={submit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 20, marginTop: spacing.sm, marginBottom: spacing.lg },
  imageBox: { height: 190, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  image: { width: "100%", height: "100%" },
  imageText: { color: colors.muted },
  error: { color: colors.danger, marginBottom: spacing.md },
});
