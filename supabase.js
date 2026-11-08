import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://pucjhtjurpkjixyfvoja.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_ZL18oSqMSSYZF9Lcqz--Gw_TG9f07Zr";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      ...(Platform.OS !== "web"
        ? { storage: AsyncStorage }
        : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
