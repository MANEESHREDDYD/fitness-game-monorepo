import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const ProfileScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Profile</Text>
    <Text>Stats, achievements, and preferences.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 20, marginBottom: 8 }
});
