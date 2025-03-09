# Configuración de Supabase

Este directorio contiene la configuración centralizada para la integración con Supabase en la aplicación Lookym.

## Estructura de archivos

- `config.ts`: Configuración principal del cliente de Supabase y opciones relacionadas
- `types.ts`: Definiciones de tipos para la base de datos de Supabase
- `index.ts`: Punto de entrada que exporta todas las funcionalidades

## Pasos para configurar Supabase

### 1. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-key
```

### 2. Configurar autenticación con Google

1. Crea o selecciona un proyecto en la [Google Cloud Console](https://console.cloud.google.com/)
2. Configura la pantalla de consentimiento OAuth:
   - Añade el dominio de Supabase en dominios autorizados
   - Configura los scopes necesarios (email, profile, openid)
3. Crea credenciales OAuth:
   - Configura orígenes JavaScript autorizados (localhost y dominio de producción)
   - Configura URIs de redirección autorizados:
     ```
     https://tu-proyecto.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     https://tu-dominio-produccion.com/auth/callback
     ```

### 3. Configurar Supabase

1. En el Dashboard de Supabase:
   - Habilita el proveedor de autenticación de Google
   - Agrega el ID de cliente y el secreto obtenidos de Google
2. Configura las URLs en Supabase (Authentication > URL Configuration):
   - Site URL: La URL de tu aplicación (ej. `http://localhost:5173`)
   - Redirect URLs: Las mismas que configuraste en Google

### 4. Crear buckets de almacenamiento

Ejecuta el script `create_buckets.sql` para crear los buckets necesarios:
- `videos`: Para almacenar videos de la aplicación
- `avatars`: Para almacenar avatares de usuarios

### 5. Importar y usar en la aplicación

```typescript
// Importa lo que necesites desde el punto de entrada único
import { supabase, authConfig, redirectConfig } from '@/lib/supabase';

// Ejemplo de uso para autenticación
const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      ...redirectConfig,
      ...authConfig
    }
  });
};
```

## Estructura de la base de datos

La aplicación utiliza las siguientes tablas principales:

- `profiles`: Almacena información de perfiles de usuario
  - Campos: id, username, role, created_at, updated_at

## Recursos adicionales

- [Documentación de Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Documentación de Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Guía de Autenticación con React Router](https://reactrouter.com/docs/en/v6/examples/auth)