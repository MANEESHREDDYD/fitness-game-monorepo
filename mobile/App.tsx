import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import IndoorDashboard from './components/IndoorDashboard';
import ProfileScreen from './components/ProfileScreen';

type Tab = 'map' | 'leaderboard' | 'profile';

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [matchId, setMatchId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('map');

    const handleLogin = (newToken: string, newUserId: string) => {
        setToken(newToken);
        setUserId(newUserId);
    };

    const handleJoinMatch = (id: string) => {
        setMatchId(id);
    };

    const renderContent = () => {
        if (!token) return <AuthScreen onLogin={handleLogin} />;
        if (!matchId) return <HomeScreen token={token} onJoinMatch={handleJoinMatch} />;

        switch (activeTab) {
            case 'map':
                return <IndoorDashboard token={token} matchId={matchId} />;
            case 'profile':
                return <ProfileScreen token={token} userId={userId || ''} />;
            case 'leaderboard':
                return (
                    <View style={styles.leaderboard}>
                        <Text style={styles.lbTitle}>🏆 LEADERBOARD</Text>
                        <View style={styles.lbRow}><Text style={styles.lbRank}>#1</Text><Text style={styles.lbName}>ProUser</Text><Text style={styles.lbScore}>2,450</Text></View>
                        <View style={styles.lbRow}><Text style={styles.lbRank}>#2</Text><Text style={styles.lbName}>squad_alpha</Text><Text style={styles.lbScore}>1,820</Text></View>
                        <View style={styles.lbRow}><Text style={styles.lbRank}>#3</Text><Text style={styles.lbName}>squad_bravo</Text><Text style={styles.lbScore}>1,650</Text></View>
                        <View style={styles.lbRow}><Text style={styles.lbRank}>#4</Text><Text style={styles.lbName}>squad_charlie</Text><Text style={styles.lbScore}>1,200</Text></View>
                        <View style={styles.lbRow}><Text style={styles.lbRank}>#5</Text><Text style={styles.lbName}>squad_delta</Text><Text style={styles.lbScore}>980</Text></View>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            {renderContent()}
            {/* Bottom Tab Bar (only when in game) */}
            {token && matchId && (
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'map' && styles.tabActive]}
                        onPress={() => setActiveTab('map')}
                        testID="map-tab"
                    >
                        <Text style={[styles.tabText, activeTab === 'map' && styles.tabTextActive]}>🗺️ MAP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
                        onPress={() => setActiveTab('leaderboard')}
                        testID="leaderboard-tab"
                    >
                        <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>🏆 BOARD</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
                        onPress={() => setActiveTab('profile')}
                        testID="profile-tab"
                    >
                        <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>👤 PROFILE</Text>
                    </TouchableOpacity>
                </View>
            )}
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a1a' },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(15, 15, 25, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingBottom: 20,
        paddingTop: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    tabActive: {
        borderTopWidth: 2,
        borderTopColor: '#00FFAA',
    },
    tabText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    tabTextActive: {
        color: '#00FFAA',
    },
    leaderboard: {
        flex: 1,
        backgroundColor: '#0a0a1a',
        paddingTop: 80,
        paddingHorizontal: 20,
    },
    lbTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: 2,
    },
    lbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 20, 35, 0.9)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    lbRank: {
        color: '#00FFAA',
        fontSize: 18,
        fontWeight: 'bold',
        width: 40,
    },
    lbName: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    lbScore: {
        color: '#888',
        fontSize: 16,
        fontWeight: '600',
    },
});
