import React, { createContext, useContext, useEffect, useState } from "react";
import { showToast } from "../utils/toast";
import logger from "../utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import {
  ACCESS_TOKEN_KEY,
  GOOGLE_WEB_CLIENT_ID,
  IOS_CLIENT_ID,
} from "../utils/constants";
import { tokenCache } from "../utils/cache";
import {
  GoogleSignin,
  isErrorWithCode,
  SignInResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

export type GoogleUser = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
};

type AuthContextType = {
  user: GoogleUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  accessToken: string | null;
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

WebBrowser.maybeCompleteAuthSession();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    const fetchUserAndPremium = async () => {
      try {
        const premiumStatus = await AsyncStorage.getItem("jobflow_premium");
        if (premiumStatus === "true") {
          setIsPremium(true);
        }

        const userInfo = await GoogleSignin.getCurrentUser();
        if (userInfo) {
          setUser(userInfo.user);
        }
      } catch (e) {
        logger.error("Error loading auth state:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPremium();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        profileImageSize: 150,
        offlineAccess: false,
        scopes: [
          "profile",
          "email",
          "openid",
          "https://www.googleapis.com/auth/drive.appdata",
        ],
      });

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      let userInfo: GoogleUser;

      try {
        const silentResponse = await GoogleSignin.signInSilently();

        if (silentResponse.type === "noSavedCredentialFound") {
          const explitResponse =
            (await GoogleSignin.signIn()) as SignInResponse;

          userInfo = explitResponse.data?.user as GoogleUser;
        } else {
          userInfo = silentResponse.data.user as GoogleUser;
        }
      } catch (error) {
        throw new Error((error as Error).message, {
          cause: "Google sign in configuration",
        });
      }

      setUser(userInfo);

      const { accessToken } = await GoogleSignin.getTokens();

      if (accessToken) {
        setAccessToken(accessToken);
        await tokenCache?.saveToken(ACCESS_TOKEN_KEY, accessToken);
      }

      showToast.success("Welcome back! 👋", `Signed in as ${userInfo.name ?? userInfo.email}`);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_REQUIRED:
            showToast.error("Sign In Required", "Please sign in to continue.");
            break;
          case statusCodes.IN_PROGRESS:
            showToast.error("Sign In In Progress", "Please wait for it to complete.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showToast.error("Play Services Error", "Google Play Services not available or outdated.");
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            showToast.info("Cancelled", "Sign-in was cancelled.");
            break;
          default:
            showToast.error("Sign In Error", error.message || "An unknown error occurred.");
        }
      } else {
        showToast.error("Error", (error as Error).message || "Unexpected error occurred.");
      }

      logger.error("Sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await GoogleSignin.signOut();
    await GoogleSignin.revokeAccess();
    await tokenCache?.deleteToken("access_token");
    setUser(null);
    setAccessToken(null);
    showToast.info("Signed out", "You've been logged out successfully.");
  };

  const upgradeToPremium = async () => {
    try {
      await AsyncStorage.setItem("jobflow_premium", "true");
      setIsPremium(true);
      showToast.success("Upgraded to Pro 🎉", "Unlimited jobs and an ad-free experience are now yours!");
    } catch (error) {
      logger.error("Upgrade error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, accessToken, isPremium, upgradeToPremium }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
