import * as SecureStorage from "expo-secure-store";
import logger from "./logger";

const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStorage.getItemAsync("access_token");
    if (!token) {
      logger.error("No access token found");
      return null;
    }
    return token;
  } catch (error) {
    logger.error("Error retrieving access token:", error);
    return null;
  }
};

export default getAccessToken;
