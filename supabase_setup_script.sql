-- Complete Supabase Schema for Lookym App

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Core Tables
-- ==========================================

-- Profiles table (for user information)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'merchant')),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Videos table (for merchant content)
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  merchant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT,
  price NUMERIC,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Comments table (for user interactions)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auth attempts table (for rate limiting)
CREATE TABLE IF NOT EXISTS auth_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on ip and timestamp for faster queries
CREATE INDEX IF NOT EXISTS auth_attempts_ip_timestamp_idx ON auth_attempts (ip, timestamp);

-- Email verifications table (for email verification)
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ
);

-- Create index on token for faster verification
CREATE INDEX IF NOT EXISTS email_verifications_token_idx ON email_verifications (token);

-- ==========================================
-- Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Security Policies
-- ==========================================

-- Policies for profiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for videos
CREATE POLICY "Cualquiera puede ver videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Los comerciantes pueden insertar sus propios videos"
  ON videos FOR INSERT
  WITH CHECK (
    auth.uid() = merchant_id AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'merchant')
  );

CREATE POLICY "Los comerciantes pueden actualizar sus propios videos"
  ON videos FOR UPDATE
  USING (
    auth.uid() = merchant_id AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'merchant')
  );

CREATE POLICY "Los comerciantes pueden eliminar sus propios videos"
  ON videos FOR DELETE
  USING (
    auth.uid() = merchant_id AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'merchant')
  );

-- Policies for comments
CREATE POLICY "Cualquiera puede ver comentarios"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios autenticados pueden insertar comentarios"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios comentarios"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios comentarios"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for auth_attempts (only service role can access)
CREATE POLICY "Solo el servicio puede acceder a los intentos de autenticación"
  ON auth_attempts FOR ALL
  USING (false);

-- Policies for email_verifications (only service role can access)
CREATE POLICY "Solo el servicio puede acceder a las verificaciones de correo"
  ON email_verifications FOR ALL
  USING (false);

-- ==========================================
-- Triggers and Functions
-- ==========================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to set email_verified flag
CREATE OR REPLACE FUNCTION set_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email_verified = TRUE
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update email_verified when verification happens
CREATE TRIGGER on_email_verified
AFTER UPDATE OF verified_at ON email_verifications
FOR EACH ROW
WHEN (NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL)
EXECUTE FUNCTION set_email_verified();