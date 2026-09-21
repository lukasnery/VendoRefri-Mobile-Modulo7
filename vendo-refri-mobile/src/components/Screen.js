import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme";

export default function Screen({ children, padded = true, style }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  padded: { padding: spacing.md },
});
