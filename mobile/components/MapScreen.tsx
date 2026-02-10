import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { ErrorBoundary } from './ErrorBoundary';
import VoronoiOverlay from './VoronoiOverlay';
import { startZonePulse, stopZonePulse, captureSuccessHaptic } from '../utils/haptics';

const SOCKET_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

// Central Park, NYC bounding region
const CENTRAL_PARK_REGION = {
    latitude: 40.7829,
    longitude: -73.9654,
    latitudeDelta: 0.025,
    longitudeDelta: 0.015,
};

interface MapScreenProps {
    token: string;
    matchId: string;
    parkId?: number;
}

function MapContent({ token, matchId, parkId = 1 }: MapScreenProps) {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [socket, setSocket] = useState<any>(null);
    const [otherPlayers, setOtherPlayers] = useState<Record<string, any>>({});
    const [zones, setZones] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const [adaptiveMode, setAdaptiveMode] = useState<'NORMAL' | 'AGGRESSIVE'>('NORMAL');
    const [isInZone, setIsInZone] = useState(false);

    const mapRef = useRef<MapView>(null);
    const locationSub = useRef<Location.LocationSubscription | null>(null);

    // Animation values
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.4);
    const hudSlide = useSharedValue(-100);

    useEffect(() => {
        // Pulse Animation for user marker
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(2.2, { duration: 1200 }),
                withTiming(1, { duration: 0 })
            ),
            -1,
            false
        );
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 1200 }),
                withTiming(0.5, { duration: 0 })
            ),
            -1,
            false
        );

        // HUD slide-in animation
        hudSlide.value = withTiming(0, { duration: 600 });

        fetchZones();
        setupSocket();

        return () => {
            socket?.disconnect();
            locationSub.current?.remove();
            stopZonePulse();
        };
    }, []);

    // Adaptive Telemetry Effect
    useEffect(() => {
        startLocationTracking(adaptiveMode);
    }, [adaptiveMode]);

    // Haptic zone pulse
    useEffect(() => {
        if (isInZone) {
            startZonePulse();
        } else {
            stopZonePulse();
        }
    }, [isInZone]);

    const fetchZones = async () => {
        try {
            const res = await fetch(`${API_URL}/matches/${matchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.zones) setZones(data.zones);
        } catch (err) {
            console.error('[MapScreen] Failed to fetch zones', err);
        }
    };

    const setupSocket = () => {
        const newSocket = io(SOCKET_URL, { auth: { token } });
        newSocket.on('connect', () => newSocket.emit('join_match', matchId));
        newSocket.on('opponent_location', (data: any) => {
            setOtherPlayers((prev) => ({ ...prev, [data.userId]: data }));
        });
        newSocket.on('zone_captured', async (data: any) => {
            setScore(data.newScore || score + 10);
            updateZoneColor(data.zoneId, 'RED');
            await captureSuccessHaptic();
        });
        setSocket(newSocket);
    };

    const updateZoneColor = (zoneId: number, color: string) => {
        setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, team_color: color } : z)));
    };

    const startLocationTracking = async (mode: 'NORMAL' | 'AGGRESSIVE') => {
        try {
            if (locationSub.current) locationSub.current.remove();

            const options =
                mode === 'AGGRESSIVE'
                    ? { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 2, timeInterval: 2000 }
                    : { accuracy: Location.Accuracy.Balanced, distanceInterval: 10, timeInterval: 10000 };

            console.log(`[Telemetry] Mode: ${mode}`);

            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('[Telemetry] Permission not granted, skipping tracking.');
                return;
            }

            locationSub.current = await Location.watchPositionAsync(options, (loc) => {
                if (!loc || !loc.coords) return;

                setLocation(loc);
                checkProximityToZones(loc.coords);

                socket?.emit('location_update', {
                    matchId,
                    lat: loc.coords.latitude,
                    lng: loc.coords.longitude,
                    speed: loc.coords.speed || 0,
                });
            });
        } catch (error) {
            console.error('[Telemetry] Error starting location tracking:', error);
        }
    };

    const checkProximityToZones = (coords: any) => {
        let closeToZone = false;
        for (const zone of zones) {
            if (!zone.location?.coordinates) continue;
            const dLat = zone.location.coordinates[1] - coords.latitude;
            const dLng = zone.location.coordinates[0] - coords.longitude;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist < 0.0005) {
                closeToZone = true;
                break;
            }
        }

        setIsInZone(closeToZone);
        const newMode = closeToZone ? 'AGGRESSIVE' : 'NORMAL';
        if (newMode !== adaptiveMode) setAdaptiveMode(newMode);
    };

    const PulseView = () => {
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: pulseScale.value }],
            opacity: pulseOpacity.value,
        }));
        return <Animated.View style={[styles.pulseCircle, animatedStyle]} />;
    };

    const hudAnimStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: hudSlide.value }],
    }));

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={CENTRAL_PARK_REGION}
                showsUserLocation={false}
                showsMyLocationButton={false}
                customMapStyle={DARK_MAP_STYLE}
            >
                {/* Voronoi Territory Overlays */}
                <VoronoiOverlay parkId={parkId} token={token} />

                {/* Zone Circles */}
                {zones.map((zone) =>
                    zone.location?.coordinates ? (
                        <Circle
                            key={zone.id}
                            center={{
                                latitude: zone.location.coordinates[1],
                                longitude: zone.location.coordinates[0],
                            }}
                            radius={zone.radius_meters || 20}
                            fillColor={
                                zone.team_color === 'RED'
                                    ? 'rgba(255, 50, 80, 0.35)'
                                    : 'rgba(0, 255, 170, 0.3)'
                            }
                            strokeColor={
                                zone.team_color === 'RED'
                                    ? 'rgba(255, 50, 80, 0.9)'
                                    : 'rgba(0, 255, 170, 0.8)'
                            }
                            strokeWidth={2}
                        />
                    ) : null
                )}

                {/* Other Players */}
                {Object.values(otherPlayers).map((p: any) => (
                    <Marker
                        key={p.userId}
                        coordinate={{ latitude: p.lat, longitude: p.lng }}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.enemyDot} />
                    </Marker>
                ))}

                {/* Self Marker with Pulse */}
                {location && location.coords && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.userMarker}>
                            <PulseView />
                            <View style={styles.innerDot} />
                        </View>
                    </Marker>
                )}
            </MapView>

            {/* Glassmorphic HUD */}
            <Animated.View style={[styles.hudContainer, hudAnimStyle]}>
                <View style={styles.glassPanel}>
                    <Text style={styles.statLabel}>SCORE</Text>
                    <Text style={styles.statValue}>{score}</Text>
                </View>
                <View style={styles.glassPanel}>
                    <Text style={styles.statLabel}>MODE</Text>
                    <Text
                        style={[
                            styles.statValue,
                            { color: adaptiveMode === 'AGGRESSIVE' ? '#ff3250' : '#00FFAA', fontSize: 16 },
                        ]}
                    >
                        {adaptiveMode === 'AGGRESSIVE' ? '⚡ AGGRESSIVE' : '● NORMAL'}
                    </Text>
                </View>
                {isInZone && (
                    <View style={[styles.glassPanel, { backgroundColor: 'rgba(255, 50, 80, 0.15)' }]}>
                        <Text style={[styles.statLabel, { color: '#ff3250' }]}>⚠ IN ZONE</Text>
                        <Text style={[styles.statValue, { color: '#ff3250', fontSize: 14 }]}>CAPTURING</Text>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}

export default function MapScreen(props: MapScreenProps) {
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | 'undetermined'>('undetermined');

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                setPermissionStatus(status);
            } catch (error) {
                console.error("Permission request failed", error);
                setPermissionStatus(Location.PermissionStatus.DENIED);
            }
        })();
    }, []);

    if (permissionStatus === 'undetermined') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: '#00FFAA', fontSize: 16 }}>Requesting Location Access...</Text>
            </View>
        );
    }

    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a', padding: 20 }}>
                <Text style={{ color: '#ff3250', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Location Required</Text>
                <Text style={{ color: '#aaa', textAlign: 'center', marginBottom: 20 }}>
                    This game requires GPS location to function. Please enable location services in your settings.
                </Text>
            </View>
        );
    }

    return (
        <ErrorBoundary
            fallback={
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
                    <Text style={{ color: '#ff3250', fontSize: 18, fontWeight: 'bold' }}>⚠ Map Unavailable</Text>
                    <Text style={{ color: '#666', marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }}>
                        Degraded Mode Active. Zone markers are loading from the server.
                    </Text>
                </View>
            }
        >
            <MapContent {...props} />
        </ErrorBoundary>
    );
}

// Full Google Maps Dark Mode Style (Aubergine Theme)
const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
    { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
    { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
    { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
    { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    map: { width: '100%', height: '100%' },
    hudContainer: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    glassPanel: {
        flex: 1,
        backgroundColor: 'rgba(15, 15, 25, 0.75)',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        // Glassmorphism shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    statLabel: {
        color: '#888',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    statValue: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 4,
    },
    userMarker: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#00FFAA',
        zIndex: 2,
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 170, 0.4)',
    },
    pulseCircle: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#00FFAA',
        zIndex: 1,
    },
    enemyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff3250',
        borderWidth: 1,
        borderColor: '#fff',
    },
});
