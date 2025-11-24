/*
  # Create Initial Schema for QuickMeal Platform

  1. New Tables
    - `users`
      - `id` (serial, primary key)
      - `username` (varchar 50, unique, not null)
      - `email` (varchar 100, unique, not null)
      - `password` (text, not null) - stores bcrypt hashed password
      - `role` (varchar 20, not null, default 'customer') - customer, merchant, or admin
      - `approved` (boolean, not null, default true) - for merchant approval workflow
      - `created_at` (timestamp, not null, default now)

    - `sessions`
      - `id` (serial, primary key)
      - `token` (uuid, unique, not null, default random)
      - `user_id` (integer, not null, references users.id)
      - `created_at` (timestamp, not null, default now)
      - `expires_at` (timestamp, not null)
      - `remember_me` (boolean, not null, default false)

    - `menu_items`
      - `id` (serial, primary key)
      - `merchant_id` (integer, not null, references users.id, cascade on delete)
      - `name` (text, not null)
      - `price` (numeric 10,2, not null)
      - `category` (text, not null) - main meal, curry, gravy
      - `portion` (text, not null) - Regular, Large, etc
      - `created_at` (timestamp, default now)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for merchants to manage their menu items
    - Add policies for sessions management
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  remember_me BOOLEAN NOT NULL DEFAULT false
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  portion TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Sessions policies
CREATE POLICY "Users can read their own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Menu items policies
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Merchants can create their own menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = merchant_id::text);

CREATE POLICY "Merchants can update their own menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = merchant_id::text)
  WITH CHECK (auth.uid()::text = merchant_id::text);

CREATE POLICY "Merchants can delete their own menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (auth.uid()::text = merchant_id::text);