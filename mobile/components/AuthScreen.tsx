import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const API_URL = 'http://10.0.2.2:3000/api/auth';

interface AuthScreenProps {
    onLogin: (token: string, userId: string) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async () => {
        const endpoint = isLogin ? '/login' : '/signup';
        try {
            const body = isLogin ? { email, password } : { email, username, password };

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                onLogin(data.token, data.user.id);
            } else {
                // Safely handle API error response
                const apiError = data.error || data;
                const msg = typeof apiError === 'string' ? apiError : JSON.stringify(apiError);
                Alert.alert('Login Failed', msg);
            }
        } catch (error: any) {
            console.log("Login Error:", error);
            // FIX: Handle both Strings and Arrays/Objects safely
            const errorMessage = typeof error === 'string'
                ? error
                : JSON.stringify(error?.message || error || "Unknown Error");

            Alert.alert("Login Failed", errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isLogin ? 'Fitness Game Login' : 'Join the Game'}</Text>

            {!isLogin && (
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                />
            )}
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchText}>
                    {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    switchText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#007AFF'
    }
});
