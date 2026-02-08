import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const MatchesScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Button title="Create Match" onPress={() => navigation.navigate("CreateMatch")} />
      <Button title="Join Match" onPress={() => navigation.navigate("JoinMatch")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }
});
