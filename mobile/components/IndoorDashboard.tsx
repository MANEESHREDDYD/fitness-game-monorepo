import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Platform } from 'react-native';
import HexagonalSkillGraph from './HexagonalSkillGraph';

interface IndoorDashboardProps {
    token: string;
    matchId: string;
}

const RACERS = [
    { id: 'user', name: 'PRO_PLAYER (YOU)', color: '#00FFAA' },
    { id: 'bot1', name: 'SQUAD_BOT_1', color: '#00D4FF' },
    { id: 'bot2', name: 'SQUAD_BOT_2', color: '#00D4FF' },
    { id: 'bot3', name: 'SQUAD_BOT_3', color: '#00D4FF' },
    { id: 'bot4', name: 'SQUAD_BOT_4', color: '#00D4FF' },
];

export default function IndoorDashboard({ token, matchId }: IndoorDashboardProps) {
    const [speed, setSpeed] = useState(0);
    const [calories, setCalories] = useState(0);
    const [sync, setSync] = useState(99.8);

    // Animation Values stored in refs
    const userProgress = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Simulation Intervals
        const telemetryInterval = setInterval(() => {
            setSpeed(prev => {
                const next = prev + (Math.random() * 2 - 0.5);
                return Math.max(12, Math.min(next, 32)); // Keep speed between 12-32 km/h
            });
            setCalories(prev => prev + 0.1);
            setSync(prev => {
                const jitter = (Math.random() - 0.5) * 0.4;
                return Math.max(98.5, Math.min(prev + jitter, 100));
            });
        }, 200);

        // Sprint Animation (30s loop)
        const sprint = Animated.loop(
            Animated.sequence([
                Animated.timing(userProgress, {
                    toValue: 1,
                    duration: 30000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(userProgress, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: false,
                })
            ])
        );

        // Graph Pulse
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ])
        );

        sprint.start();
        pulse.start();

        return () => {
            clearInterval(telemetryInterval);
            sprint.stop();
            pulse.stop();
        };
    }, []);

    const renderProgressBar = (racer: any, index: number) => {
        const isUser = racer.id === 'user';
        const botProgress = (0.2 + (index * 0.15)) + (Math.random() * 0.1);

        // Define width style with explicit cast to satisfy TS
        const widthStyle = isUser ? {
            width: userProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
            }) as any
        } : {
            width: `${(botProgress * 100).toFixed(0)}%` as any
        };

        return (
            <View key={racer.id} style={styles.racerRow}>
                <View style={styles.racerInfo}>
                    <Text style={[styles.racerName, isUser && { color: '#00FFAA' }]}>
                        {racer.name}
                    </Text>
                    <Text style={styles.racerStat}>
                        {isUser ? `${speed.toFixed(1)} KM/H` : `${(speed * 0.9).toFixed(1)} KM/H`}
                    </Text>
                </View>
                <View style={styles.barContainer}>
                    <Animated.View
                        style={[
                            styles.barFill,
                            { backgroundColor: racer.color },
                            widthStyle
                        ]}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Top Telemetry */}
            <View style={styles.header}>
                <View style={styles.telemetryBox}>
                    <Text style={styles.telemetryLabel}>SPEED</Text>
                    <Text style={styles.telemetryValue}>{speed.toFixed(1)}</Text>
                    <Text style={styles.telemetryUnit}>KM/H</Text>
                </View>
                <View style={styles.telemetryBox}>
                    <Text style={styles.telemetryLabel}>CALORIES</Text>
                    <Text style={styles.telemetryValue}>{calories.toFixed(0)}</Text>
                    <Text style={styles.telemetryUnit}>KCAL</Text>
                </View>
                <View style={styles.telemetryBox}>
                    <Text style={styles.telemetryLabel}>SYNC</Text>
                    <Text style={[styles.telemetryValue, { color: '#00D4FF' }]}>{sync.toFixed(1)}</Text>
                    <Text style={styles.telemetryUnit}>%</Text>
                </View>
            </View>

            {/* Middle Squad Tracker */}
            <View style={styles.squadSection}>
                <Text style={styles.sectionTitle}>SQUAD TRACKER // LIVE_STREAM</Text>
                {RACERS.map((r, i) => renderProgressBar(r, i))}
            </View>

            {/* Bottom Graph Section */}
            <View style={styles.graphSection}>
                <Text style={styles.sectionTitle}>SKILL DYNAMICS // BIOMETRIC_PULSE</Text>
                <Animated.View style={[styles.graphWrapper, { transform: [{ scale: pulseAnim }] }]}>
                    <HexagonalSkillGraph
                        data={[85, 92, 78, 65, 88, 74]}
                        color="#00FFAA"
                    />
                </Animated.View>
            </View>

            <View style={styles.statusFooter}>
                <View style={styles.pulseDot} />
                <Text style={styles.statusText}>ENCRYPTED LINK ESTABLISHED // MATCH_ID: {matchId.toUpperCase()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a1a',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    telemetryBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(20, 20, 45, 0.8)',
        paddingVertical: 15,
        borderRadius: 12,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'rgba(0, 212, 255, 0.2)',
    },
    telemetryLabel: {
        color: '#8ec3b9',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    telemetryValue: {
        color: 'white',
        fontSize: 28,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: 'bold',
        marginVertical: 4,
    },
    telemetryUnit: {
        color: '#666',
        fontSize: 10,
        fontWeight: 'bold',
    },
    squadSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: '#00FFAA',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 20,
        opacity: 0.8,
    },
    racerRow: {
        marginBottom: 15,
    },
    racerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    racerName: {
        color: '#aaa',
        fontSize: 11,
        fontWeight: '700',
    },
    racerStat: {
        color: '#666',
        fontSize: 10,
        fontFamily: 'monospace',
    },
    barContainer: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
        // Neon glow effect (simplified for RN)
        shadowColor: '#00FFAA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    graphSection: {
        flex: 1,
        alignItems: 'center',
    },
    graphWrapper: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff3250',
        marginRight: 10,
    },
    statusText: {
        color: '#444',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
