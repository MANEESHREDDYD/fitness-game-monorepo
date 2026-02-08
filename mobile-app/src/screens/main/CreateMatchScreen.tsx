import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { matchService } from "../../services/matchService";

export const CreateMatchScreen = () => {
  const navigation = useNavigation<any>();
  const [parkId, setParkId] = useState("central-park");
  const [teamSize, setTeamSize] = useState("2");
  const [status, setStatus] = useState("");
  const [matchCode, setMatchCode] = useState("");

  const handleCreate = async () => {
    try {
      setStatus("Creating...");
      const match = await matchService.createMatch(parkId, Number(teamSize));
      setMatchCode(match.code || "");
      setStatus("Created");
      navigation.navigate("Lobby", { matchId: match.id });
    } catch {
      setStatus("Failed to create match");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Park ID</Text>
      <TextInput value={parkId} onChangeText={setParkId} style={styles.input} />
      <Text>Team Size</Text>
      <TextInput value={teamSize} onChangeText={setTeamSize} style={styles.input} keyboardType="numeric" />
      <Text>Join Code (share with friends)</Text>
      <TextInput value={matchCode} style={styles.input} editable={false} />
      <Button title="Create" onPress={handleCreate} />
      <Text>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8 }
});
