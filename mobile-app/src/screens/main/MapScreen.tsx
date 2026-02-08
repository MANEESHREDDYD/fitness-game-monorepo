import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";
import { matchService } from "../../services/matchService";
import { MatchZone } from "../../types/match";

export const MapScreen = () => {
  const [zones, setZones] = useState<MatchZone[]>([]);
  const [hasLocation, setHasLocation] = useState(false);
  const [region, setRegion] = useState({
    latitude: 40.785091,
    longitude: -73.968285,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  });

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await matchService.getZones("central-park");
        setZones(response.zones || []);
      } catch {
        setZones([]);
      }
    };
    loadZones();
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasLocation(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await Geolocation.requestAuthorization("whenInUse");
        setHasLocation(result === "granted");
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (!hasLocation) {
      return;
    }

    Geolocation.getCurrentPosition(
      (pos) => {
        setRegion({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [hasLocation]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={hasLocation}
        showsMyLocationButton={hasLocation}
      >
        {zones.map((zone) => (
          <Marker key={zone.id} coordinate={{ latitude: zone.lat, longitude: zone.lng }} title={zone.name} />
        ))}
      </MapView>
      {zones.length === 0 && <Text style={styles.helper}>No zones loaded</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  helper: { position: "absolute", bottom: 24, alignSelf: "center" }
});
