import React from "react";
import { useSelector } from "react-redux";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabs } from "./MainTabs";
import { RootState } from "../store";

export const RootNavigator = () => {
  const isSignedIn = useSelector((state: RootState) => Boolean(state.user.accessToken));
  return isSignedIn ? <MainTabs /> : <AuthNavigator />;
};
