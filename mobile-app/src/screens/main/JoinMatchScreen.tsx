import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { matchService } from "../../services/matchService";

export const JoinMatchScreen = () => {
  const navigation = useNavigation<any>();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");

  const handleJoin = async () => {
    try {
      setStatus("Joining...");
      const response = await matchService.joinByCode(code, "Player", "blue");
      setStatus("Joined");
      navigation.navigate("Lobby", { matchId: response.match.id });
    } catch {
      setStatus("Failed to join");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Match Code</Text>
      <TextInput value={code} onChangeText={setCode} style={styles.input} autoCapitalize="characters" />
      <Button title="Join" onPress={handleJoin} />
      <Text>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8 }
});
