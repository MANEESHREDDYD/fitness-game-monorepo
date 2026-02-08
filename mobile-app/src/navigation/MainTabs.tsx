import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/main/HomeScreen";
import { MapScreen } from "../screens/main/MapScreen";
import { MatchesStack } from "./MatchesStack";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Matches" component={MatchesStack} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
