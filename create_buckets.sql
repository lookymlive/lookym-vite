-- Script simplificado para crear buckets de almacenamiento en Supabase

-- Crear bucket de videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket de avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Buckets creados correctamente' AS mensaje;