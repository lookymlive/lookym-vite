
# Lookym App - Desarrollo e Implementación

Este documento contiene información detallada sobre la configuración y el proceso de desarrollo de la aplicación Lookym. Servirá como una guía de referencia para futuros desarrollos y para que otras IAs puedan entender el contexto del proyecto.

## Configuración de Autenticación con Supabase y Google

### 1. Integración con Supabase

Iniciamos conectando nuestra aplicación con Supabase para utilizar sus servicios de backend:

```toml
# supabase/config.toml
project_id = "mboujutqfahxngntzexn"

[auth.external.google]
enabled = true
```

### 2. Estructura de la Base de Datos

Creamos una tabla `profiles` para almacenar la información de roles de usuario:

```sql
-- Create a table for user profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'merchant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Configuración de Autenticación con Google

#### 3.1 Configuración en Google Cloud Console

1. Crear o seleccionar un proyecto en la [Google Cloud Console](https://console.cloud.google.com/).
2. Configurar la pantalla de consentimiento de OAuth:
   - Añadir el dominio de Supabase (`mboujutqfahxngntzexn.supabase.co`) en dominios autorizados.
   - Configurar los siguientes scopes no sensibles:
     - .../auth/userinfo.email
     - ...auth/userinfo.profile
     - openid

3. Crear credenciales OAuth:
   - Ir a "API y Servicios" > "Credenciales"
   - Crear credenciales > ID de cliente OAuth
   - Seleccionar "Aplicación web"
   - Configurar orígenes JavaScript autorizados:

     ```
     http://localhost:8080
     https://tu-dominio-de-produccion.com
     ```

   - Configurar URIs de redirección autorizados:

     ```
     https://mboujutqfahxngntzexn.supabase.co/auth/v1/callback
     http://localhost:8080/auth/callback
     https://tu-dominio-de-produccion.com/auth/callback
     ```

   - Guardar y obtener el ID de cliente y el secreto del cliente

#### 3.2 Configuración en Supabase

1. En el [Dashboard de Supabase](https://supabase.com/dashboard/project/mboujutqfahxngntzexn/auth/providers):
   - Habilitar el proveedor de autenticación de Google
   - Agregar el ID de cliente y el secreto obtenidos de Google

2. Configurar URL en Supabase (Authentication > URL Configuration):
   - Site URL: La URL de tu aplicación (ej. `http://localhost:8080`)
   - Redirect URLs:

     ```
     http://localhost:8080/auth/callback
     https://tu-dominio-de-produccion.com/auth/callback
     ```

### 4. Implementación del Hook useSupabaseAuth

Para manejar la autenticación en el frontend, implementamos un hook personalizado:

```tsx
// src/hooks/useSupabaseAuth.tsx

import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'user' | 'merchant' | null;

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  signInWithGoogle: (role?: 'merchant' | 'user') => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'merchant' | 'user') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role as UserRole;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      }
      
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (role: 'merchant' | 'user' = 'user') => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          data: {
            role
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: 'merchant' | 'user') => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUserRole(role);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      isLoading, 
      signInWithGoogle, 
      signOut,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. Implementación de la UI de Autenticación

#### 5.1 Componente SocialLoginButton.tsx

```tsx
// src/components/auth/SocialLoginButton.tsx
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface SocialLoginButtonProps {
  provider: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
}

export const SocialLoginButton = ({
  provider,
  onClick,
  disabled = false,
}: SocialLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onClick();
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Error al iniciar sesión con ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Button
        variant="outline"
        className="w-full relative"
        onClick={handleClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Conectando...
          </span>
        ) : (
          <>
            {provider === "Google" && (
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
            )}
            Continuar con {provider}
          </>
        )}
      </Button>
    </motion.div>
  );
};
```

#### 5.2 Componentes de Página de Inicio de Sesión y Registro

Implementamos páginas dedicadas para el inicio de sesión y registro, permitiendo a los usuarios seleccionar su rol (usuario o comerciante).

### 6. Manejo de Redirecciones de Autenticación

Creamos un componente `AuthCallback.tsx` para manejar las redirecciones después de la autenticación con Google:

```tsx
// src/pages/auth/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process OAuth callback
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in authentication callback:', error);
          setError(error.message);
          toast.error('Error en la autenticación: ' + error.message);
          setTimeout(() => navigate('/auth/sign-in'), 2000);
          return;
        }

        if (data.session) {
          toast.success('Inicio de sesión exitoso');
          navigate('/');
        } else {
          console.error('No session found after authentication');
          setError('No se encontró una sesión después de la autenticación');
          toast.error('Error en la autenticación: No se pudo obtener la sesión');
          setTimeout(() => navigate('/auth/sign-in'), 2000);
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('Error inesperado durante la autenticación');
        toast.error('Error inesperado durante la autenticación');
        setTimeout(() => navigate('/auth/sign-in'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        {error ? (
          <>
            <div className="text-destructive text-xl mb-4">Error de autenticación</div>
            <p className="text-muted-foreground">{error}</p>
            <p className="mt-4">Redirigiendo a la página de inicio de sesión...</p>
          </>
        ) : (
          <>
            <svg
              className="animate-spin h-12 w-12 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-lg">Procesando inicio de sesión...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
```

## Solución de Problemas Comunes

### Error con los datos de autenticación

Para resolver el error de TypeScript en `useSupabaseAuth.tsx`:

```typescript
// Error: Object literal may only specify known properties, and 'data' does not exist in type
// Solución: Usar 'options.queryParams.role' en lugar de 'data.role'
```

### Errores de redirección

Si aparecen errores como `"error": "requested path is invalid"` o redirecciones incorrectas a `localhost:3000`, verificar:

1. Que las URL de redirección estén correctamente configuradas en Google Cloud Console
2. Que las URL de sitio y redirección estén correctamente configuradas en Supabase
3. Que el origen de la aplicación coincida con la URL configurada

## Próximos Pasos

1. Implementar vistas específicas para diferentes roles de usuario (comerciante vs usuario regular)
2. Añadir funcionalidad para que los comerciantes puedan gestionar sus productos o servicios
3. Mejorar la experiencia de usuario después del inicio de sesión

## Recursos Útiles

- [Documentación de Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Documentación de Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Guía de Autenticación con React Router](https://reactrouter.com/docs/en/v6/examples/auth)
