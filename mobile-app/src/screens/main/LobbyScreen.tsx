import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { matchService } from "../../services/matchService";

export const LobbyScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { matchId } = route.params;
  const [status, setStatus] = useState("");
  const [players, setPlayers] = useState<{ id: string; displayName: string; teamId: string }[]>([]);
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const match = await matchService.getMatch(matchId);
        setPlayers(match.players || []);
        setCode(match.code || "");
        setStatus(`Match ${matchId}`);
      } catch {
        setStatus("Failed to load match");
      }
    };

    load();
  }, [matchId]);

  const handleStart = async () => {
    try {
      setStatus("Starting...");
      await matchService.startMatch(matchId);
      navigation.navigate("InMatch", { matchId });
    } catch {
      setStatus("Failed to start");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      <Text>Code: {code}</Text>
      <Text>{status}</Text>
      <Text>Players:</Text>
      {players.map((player) => (
        <Text key={player.id}>{player.displayName} ({player.teamId})</Text>
      ))}
      <Button title="Start Match" onPress={handleStart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 20 }
});
