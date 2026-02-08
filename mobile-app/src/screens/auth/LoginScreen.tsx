import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { authService } from "../../services/authService";
import { setAccessToken } from "../../store/slices/userSlice";

export const LoginScreen = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<string>("");

  const handleLogin = async () => {
    try {
      setStatus("Signing in...");
      const token = await authService.signIn();
      if (token) {
        dispatch(setAccessToken(token));
        setStatus("Signed in");
      } else {
        setStatus("No token returned");
      }
    } catch (error) {
      setStatus("Sign-in failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Game</Text>
      <Button title="Sign in with Azure AD B2C" onPress={handleLogin} />
      <Text style={styles.status}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  status: { marginTop: 12 }
});
