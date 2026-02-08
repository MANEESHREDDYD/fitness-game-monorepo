import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MatchesScreen } from "../screens/main/MatchesScreen";
import { CreateMatchScreen } from "../screens/main/CreateMatchScreen";
import { JoinMatchScreen } from "../screens/main/JoinMatchScreen";
import { LobbyScreen } from "../screens/main/LobbyScreen";
import { InMatchScreen } from "../screens/main/InMatchScreen";
import { MatchesStackParamList } from "./types";

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export const MatchesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MatchesHome" component={MatchesScreen} />
    <Stack.Screen name="CreateMatch" component={CreateMatchScreen} />
    <Stack.Screen name="JoinMatch" component={JoinMatchScreen} />
    <Stack.Screen name="Lobby" component={LobbyScreen} />
    <Stack.Screen name="InMatch" component={InMatchScreen} />
  </Stack.Navigator>
);
