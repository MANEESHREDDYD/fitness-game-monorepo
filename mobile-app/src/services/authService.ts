import { PublicClientApplication } from "@azure/msal-react-native";
import * as Keychain from "react-native-keychain";
import Config from "react-native-config";

interface B2CConfig {
  tenant: string;
  clientId: string;
  redirectUri: string;
}

const b2cConfig: B2CConfig = JSON.parse(Config.B2C_CONFIG || "{}") as B2CConfig;

const msal = new PublicClientApplication({
  auth: {
    clientId: b2cConfig.clientId,
    redirectUri: b2cConfig.redirectUri,
    authority: `https://${b2cConfig.tenant}.b2clogin.com/${b2cConfig.tenant}.onmicrosoft.com/B2C_1_signin`
  }
});

export const authService = {
  async signIn() {
    const result = await msal.acquireToken({
      scopes: ["openid", "offline_access"],
      promptType: "SELECT_ACCOUNT"
    });

    if (result.accessToken) {
      await Keychain.setGenericPassword("accessToken", result.accessToken);
    }

    return result.accessToken;
  },
  async getStoredToken() {
    const creds = await Keychain.getGenericPassword();
    return creds ? creds.password : null;
  },
  async signOut() {
    await Keychain.resetGenericPassword();
  }
};
