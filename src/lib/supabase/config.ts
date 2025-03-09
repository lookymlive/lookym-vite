import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";

// Asegúrate de tener estas variables en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan las variables de entorno de Supabase");
}

// Cliente de Supabase tipado
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Configuración de autenticación
export const authConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
};

// URLs de redirección para autenticación
export const redirectConfig = {
  redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
};

// Configuración de almacenamiento
export const storageConfig = {
  buckets: {
    VIDEOS: "videos",
    AVATARS: "avatars",
  },
};
