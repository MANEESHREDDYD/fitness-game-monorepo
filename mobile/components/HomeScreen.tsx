import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

const API_URL = 'http://10.0.2.2:3000/api';

interface HomeScreenProps {
    token: string;
    onJoinMatch: (matchId: string) => void;
}

export default function HomeScreen({ token, onJoinMatch }: HomeScreenProps) {
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/matches`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMatches(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const createMatch = async () => {
        try {
            // Hardcode park ID 1 for MVP
            const res = await fetch(`${API_URL}/matches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ parkId: 1, durationMinutes: 30 })
            });
            const data = await res.json();
            if (res.ok) {
                onJoinMatch(data.matchId);
            } else {
                Alert.alert('Error', 'Failed to create match');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Available Matches</Text>

            <FlatList
                data={matches}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.matchItem} onPress={() => onJoinMatch(item.id)}>
                        <Text style={styles.matchText}>Match #{item.id} - {item.status}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text>No active matches found.</Text>}
            />

            <TouchableOpacity style={styles.createButton} onPress={createMatch}>
                <Text style={styles.buttonText}>Create New Match</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, marginTop: 50 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    matchItem: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
        borderRadius: 8
    },
    matchText: { fontSize: 16 },
    createButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20
    },
    buttonText: { color: 'white', fontWeight: 'bold' }
});
