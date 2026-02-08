import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome</Text>
    <Text>Capture zones, team up, and win matches.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 22, marginBottom: 8 }
});
