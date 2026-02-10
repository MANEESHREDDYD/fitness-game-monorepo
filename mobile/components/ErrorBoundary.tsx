import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong.</Text>
                    <Text style={styles.message}>{this.state.error?.message}</Text>
                    <TouchableOpacity style={styles.button} onPress={this.resetError}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 20
    },
    title: {
        fontSize: 24,
        color: '#ff4d4d',
        marginBottom: 10,
        fontWeight: 'bold'
    },
    message: {
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 20
    },
    button: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8
    },
    buttonText: {
        color: 'white'
    }
});
