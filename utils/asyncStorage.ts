import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "./logger";

export const getItem = async (key: string) => {
  try {
    const result = await AsyncStorage.getItem(key);
    return result === null ? [] : JSON.parse(result);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const setItem = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

export const mergeItem = async (key: string, updateData: any) => {
  try {
    await AsyncStorage.mergeItem(key, JSON.stringify(updateData));
  } catch (err) {
    console.error(err);
  }
};

export const removeItem = async (key: string) => {
  try {
    log.debug("removeItem", key);
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error(err);
  }
};
