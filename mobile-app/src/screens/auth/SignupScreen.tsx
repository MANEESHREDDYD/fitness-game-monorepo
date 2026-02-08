import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const SignupScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Create an account in B2C</Text>
    <Text>Use the same B2C flow as login for now.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 20, marginBottom: 8 }
});
