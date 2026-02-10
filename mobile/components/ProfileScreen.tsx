import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import HexagonalSkillGraph from './HexagonalSkillGraph';

const API_URL = 'http://10.0.2.2:3000/api';

interface ProfileScreenProps {
    token: string;
    userId: string;
}

export default function ProfileScreen({ token, userId }: ProfileScreenProps) {
    const [stats, setStats] = useState<number[]>([72, 58, 85, 64, 78, 91]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/users/${userId}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                // Map backend data to 6-axis graph
                setStats([
                    Math.min(data.avg_speed_mph || 70, 100),
                    Math.min((data.total_distance_m || 5000) / 100, 100),
                    Math.min((data.zones_captured || 5) * 15, 100),
                    Math.min((data.aggression_score || 0.6) * 100, 100),
                    Math.min((data.consistency_score || 0.7) * 100, 100),
                    Math.min((data.total_captures || 8) * 10, 100),
                ]);
            }
        } catch (err) {
            console.warn('[Profile] Using default stats');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>P</Text>
                </View>
                <Text style={styles.username}>{profile?.username || 'ProUser'}</Text>
                <Text style={styles.subtitle}>Central Park, NYC</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{profile?.matches_played || 12}</Text>
                    <Text style={styles.statLabel}>MATCHES</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{profile?.zones_captured || 23}</Text>
                    <Text style={styles.statLabel}>CAPTURES</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{profile?.total_distance_m ? (profile.total_distance_m / 1000).toFixed(1) : '8.4'}</Text>
                    <Text style={styles.statLabel}>KM RUN</Text>
                </View>
            </View>

            {/* Hexagonal Skill Graph */}
            {loading ? (
                <ActivityIndicator size="large" color="#00FFAA" style={{ marginTop: 40 }} />
            ) : (
                <View testID="skill-graph">
                    <HexagonalSkillGraph data={stats} color="#00FFAA" />
                </View>
            )}

            {/* Session Summary */}
            <View style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>LAST SESSION</Text>
                <View style={styles.sessionRow}>
                    <Text style={styles.sessionKey}>Duration</Text>
                    <Text style={styles.sessionVal}>34 min</Text>
                </View>
                <View style={styles.sessionRow}>
                    <Text style={styles.sessionKey}>Calories</Text>
                    <Text style={styles.sessionVal}>287 kcal</Text>
                </View>
                <View style={styles.sessionRow}>
                    <Text style={styles.sessionKey}>Avg Speed</Text>
                    <Text style={styles.sessionVal}>4.8 mph</Text>
                </View>
                <View style={styles.sessionRow}>
                    <Text style={styles.sessionKey}>Zones Captured</Text>
                    <Text style={styles.sessionVal}>3</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a1a' },
    content: { paddingBottom: 40 },
    header: {
        alignItems: 'center',
        paddingTop: 70,
        paddingBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#00FFAA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        color: '#0a0a1a',
        fontSize: 32,
        fontWeight: 'bold',
    },
    username: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#666',
        fontSize: 14,
        marginTop: 4,
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 16,
        marginVertical: 20,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(20, 20, 35, 0.9)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        minWidth: 90,
    },
    statValue: {
        color: '#00FFAA',
        fontSize: 22,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginTop: 4,
    },
    sessionCard: {
        backgroundColor: 'rgba(20, 20, 35, 0.9)',
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    sessionTitle: {
        color: '#666',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 16,
    },
    sessionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    sessionKey: { color: '#888', fontSize: 14 },
    sessionVal: { color: 'white', fontSize: 14, fontWeight: '600' },
});
