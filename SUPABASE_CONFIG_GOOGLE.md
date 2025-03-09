# Guía de Configuración de Autenticación con Google en Supabase

Esta guía proporciona instrucciones paso a paso para configurar la autenticación con Google en una aplicación React utilizando Supabase como backend. Sigue estos pasos para implementar correctamente el inicio de sesión con Google.

## 1. Configuración en Google Cloud Console

### 1.1 Crear o seleccionar un proyecto

1. Accede a la [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto para referencia futura

### 1.2 Configurar la pantalla de consentimiento OAuth

1. En el menú lateral, navega a "API y Servicios" > "Pantalla de consentimiento de OAuth"
2. Selecciona el tipo de usuario (externo o interno)
3. Completa la información requerida:
   - Nombre de la aplicación
   - Correo electrónico de soporte
   - Logotipo (opcional)
   - Dominio de la aplicación
4. Añade el dominio de Supabase (`[tu-proyecto-id].supabase.co`) en dominios autorizados
5. Configura los siguientes scopes no sensibles:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. Guarda y continúa

### 1.3 Crear credenciales OAuth

1. En el menú lateral, navega a "API y Servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente OAuth"
3. Selecciona "Aplicación web" como tipo de aplicación
4. Asigna un nombre a tu cliente OAuth
5. Configura los orígenes JavaScript autorizados:
   ```
   http://localhost:5173
   http://localhost:8080
   https://[tu-dominio-de-produccion.com]
   ```
6. Configura las URIs de redirección autorizados:
   ```
   https://[tu-proyecto-id].supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   http://localhost:8080/auth/callback
   https://[tu-dominio-de-produccion.com]/auth/callback
   ```
7. Haz clic en "Crear"
8. Guarda el **ID de cliente** y el **Secreto del cliente** que se generan

## 2. Configuración en Supabase

### 2.1 Acceder al proyecto en Supabase

1. Inicia sesión en el [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto o crea uno nuevo

### 2.2 Configurar el proveedor de autenticación de Google

1. En el menú lateral, navega a "Authentication" > "Providers"
2. Busca y habilita el proveedor "Google"
3. Ingresa el **ID de cliente** y el **Secreto del cliente** obtenidos de Google Cloud Console
4. Guarda la configuración

### 2.3 Configurar las URLs de redirección

1. En el menú lateral, navega a "Authentication" > "URL Configuration"
2. Configura la Site URL (URL de tu aplicación):
   ```
   http://localhost:5173
   ```
   o para producción:
   ```
   https://[tu-dominio-de-produccion.com]
   ```
3. Configura las Redirect URLs:
   ```
   http://localhost:5173/auth/callback
   http://localhost:8080/auth/callback
   https://[tu-dominio-de-produccion.com]/auth/callback
   ```
4. Guarda la configuración

## 3. Configuración en la aplicación React

### 3.1 Instalar dependencias

```bash
npm install @supabase/supabase-js
```

### 3.2 Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_SUPABASE_URL=https://[tu-proyecto-id].supabase.co
VITE_SUPABASE_ANON_KEY=[tu-clave-anon-supabase]
VITE_REDIRECT_URL=http://localhost:5173/auth/callback
```

Para producción, actualiza el archivo `.env.production`:

```
VITE_SUPABASE_URL=https://[tu-proyecto-id].supabase.co
VITE_SUPABASE_ANON_KEY=[tu-clave-anon-supabase]
VITE_REDIRECT_URL=https://[tu-dominio-de-produccion.com]/auth/callback
```

> **Importante**: Asegúrate de que el archivo `.env` esté incluido en `.gitignore` para no exponer tus claves en el repositorio.

### 3.3 Crear cliente de Supabase

Crea un archivo para la configuración de Supabase, por ejemplo `src/lib/supabase/index.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

export const redirectConfig = {
  redirectTo: import.meta.env.VITE_REDIRECT_URL || window.location.origin,
};

export const authConfig = {
  // Configuraciones adicionales para autenticación
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 3.4 Implementar función de inicio de sesión con Google

Crea un hook personalizado para manejar la autenticación, por ejemplo `src/hooks/useSupabaseAuth.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { supabase, redirectConfig } from '@/lib/supabase';

export function useSupabaseAuth() {
  const [isLoading, setIsLoading] = useState(false);
  
  const signInWithGoogle = async (role: "merchant" | "user" = "user") => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectConfig.redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            role: role, // Pasar el rol como parámetro de consulta
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Otras funciones de autenticación...
  
  return {
    signInWithGoogle,
    isLoading,
    // Otros valores y funciones...
  };
}
```

### 3.5 Implementar componente de botón de inicio de sesión

Crea un componente para el botón de inicio de sesión, por ejemplo `src/components/auth/GoogleSignInButton.tsx`:

```typescript
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface GoogleSignInButtonProps {
  role?: "merchant" | "user";
  className?: string;
}

export function GoogleSignInButton({ role = "user", className = "" }: GoogleSignInButtonProps) {
  const { signInWithGoogle, isLoading } = useSupabaseAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle(role);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Cargando..." : "Iniciar sesión con Google"}
    </button>
  );
}
```

### 3.6 Implementar manejo de callback de autenticación

Crea una página para manejar el callback de autenticación, por ejemplo `src/pages/auth/AuthCallback.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Procesar el callback de autenticación
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Redirigir al usuario a la página principal o dashboard
        navigate('/');
      } catch (err) {
        console.error('Error en el callback de autenticación:', err);
        setError('Error al procesar la autenticación');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Procesando autenticación...</div>;
}
```

## 4. Solución de problemas comunes

### 4.1 Error "Invalid redirect URI"

- Verifica que las URIs de redirección en Google Cloud Console coincidan exactamente con las configuradas en Supabase
- Asegúrate de incluir el protocolo (http:// o https://) en las URLs
- Comprueba que no haya espacios o caracteres adicionales en las URLs

### 4.2 Error "Error signing in with Google"

- Verifica que el ID de cliente y el secreto estén correctamente configurados en Supabase
- Comprueba que el proveedor de Google esté habilitado en Supabase
- Revisa los logs de la consola del navegador para obtener más detalles sobre el error

### 4.3 No se completa el flujo de autenticación

- Asegúrate de que la URL de redirección en el código coincida con la configurada en Supabase y Google
- Verifica que las variables de entorno estén correctamente configuradas
- Comprueba que la página de callback esté correctamente implementada y accesible

## 5. Recursos adicionales

- [Documentación de Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Documentación de Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Guía de Autenticación con React Router](https://reactrouter.com/docs/en/v6/examples/auth)

## 6. Notas para asistentes de IA

Al solucionar problemas de autenticación con Google en Supabase, verifica estos puntos clave:

1. **Configuración de variables de entorno**: Asegúrate de que las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén correctamente definidas en el archivo .env

2. **Coincidencia de URLs**: Verifica que las URLs de redirección sean exactamente iguales en tres lugares:
   - Google Cloud Console
   - Dashboard de Supabase
   - Código de la aplicación (variable VITE_REDIRECT_URL)

3. **Scopes de OAuth**: Confirma que los scopes necesarios (email, profile, openid) estén habilitados en Google Cloud Console

4. **Formato de callback**: El formato correcto para la URL de callback es:
   ```
   https://[tu-proyecto-id].supabase.co/auth/v1/callback
   ```

5. **Manejo de errores**: Implementa un manejo adecuado de errores en las funciones de autenticación para facilitar la depuración