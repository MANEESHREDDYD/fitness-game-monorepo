import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Geolocation from "react-native-geolocation-service";
import { matchService } from "../../services/matchService";
import { signalrService } from "../../services/signalrService";
import { addChatMessage, setMatchState } from "../../store/slices/matchesSlice";
import { RootState } from "../../store";
import { haversineMeters } from "../../utils/haversine";
import { MatchZone } from "../../types/match";

export const InMatchScreen = () => {
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { matchId } = route.params;
  const matchState = useSelector((state: RootState) => state.matches.matchState);
  const [status, setStatus] = useState("Connecting...");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestZone, setNearestZone] = useState<MatchZone | null>(null);

  useEffect(() => {
    let stop = false;
    const connect = async () => {
      try {
        const negotiate = await matchService.negotiate(matchId);
        const { connectionId } = await signalrService.connect(matchId, negotiate, {
          onMatchState: (payload) => {
            dispatch(setMatchState(payload));
            setStatus("Live");
          },
          onChat: (payload) => dispatch(addChatMessage(payload))
        });

        if (connectionId) {
          await matchService.joinGroup(matchId, connectionId);
        }
      } catch {
        if (!stop) {
          setStatus("Retrying connection...");
        }
      }
    };

    connect();

    const watchId = Geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => undefined,
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 }
    );

    return () => {
      stop = true;
      Geolocation.clearWatch(watchId);
    };
  }, [dispatch, matchId]);

  useEffect(() => {
    if (!position || !matchState) {
      setNearestZone(null);
      return;
    }

    const zone = matchState.zones
      .map((z) => ({ zone: z, distance: haversineMeters(position.lat, position.lng, z.lat, z.lng) }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (zone && zone.distance <= zone.zone.radiusM) {
      setNearestZone(zone.zone);
    } else {
      setNearestZone(null);
    }
  }, [position, matchState]);

  const handleCapture = async () => {
    if (!nearestZone) {
      return;
    }
    const previous = matchState;
    if (previous) {
      const optimistic = {
        ...previous,
        zones: previous.zones.map((zone) =>
          zone.id === nearestZone.id ? { ...zone, ownerTeamId: "blue" } : zone
        )
      };
      dispatch(setMatchState(optimistic));
    }
    try {
      setStatus("Capturing...");
      await matchService.captureZone(matchId, nearestZone.id);
      setStatus("Captured");
    } catch {
      if (previous) {
        dispatch(setMatchState(previous));
      }
      setStatus("Capture failed");
    }
  };

  const timer = useMemo(() => {
    if (!matchState) {
      return "--";
    }
    const minutes = Math.floor(matchState.timerSecRemaining / 60);
    const seconds = matchState.timerSecRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [matchState]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match {matchId}</Text>
      <Text>Status: {status}</Text>
      <Text>Timer: {timer}</Text>
      <Text>Scores: {matchState ? JSON.stringify(matchState.scores) : "-"}</Text>
      <Text>Nearest Zone: {nearestZone ? nearestZone.name : "None"}</Text>
      <Button title="Capture Zone" onPress={handleCapture} disabled={!nearestZone} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 20 }
});
