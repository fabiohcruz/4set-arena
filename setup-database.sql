-- Script para configurar o banco de dados localmente
-- Execute este script no PostgreSQL

-- Criar banco de dados
CREATE DATABASE 4set_sports;

-- Conectar ao banco
\c 4set_sports;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100),
  phone VARCHAR(20),
  cpf VARCHAR(14),
  avatar_url VARCHAR(255),
  birth_date DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  bio TEXT,
  role VARCHAR(20) DEFAULT 'admin',
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin (senha: admin)
INSERT INTO users (username, password, email, full_name, role, preferences) 
VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@4set.com', 'Administrador do Sistema', 'admin', '{"theme": "dark", "language": "pt-BR", "notifications": true}')
ON CONFLICT (username) DO NOTHING;

-- Verificar se o usuário foi criado
SELECT * FROM users WHERE username = 'admin';

-- Criar tabela de quadras
CREATE TABLE IF NOT EXISTS courts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Quadra', 'Campo', 'Piscina', 'Academia')),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir quadras iniciais
INSERT INTO courts (name, type, capacity, price, description, is_active) VALUES
('Quadra 1 - Tênis', 'Quadra', 4, 80.00, 'Quadra de tênis com piso sintético', true),
('Quadra 2 - Futebol', 'Campo', 22, 120.00, 'Campo de futebol society com grama sintética', true),
('Quadra 3 - Basquete', 'Quadra', 10, 100.00, 'Quadra de basquete coberta', true),
('Piscina - Natação', 'Piscina', 8, 60.00, 'Piscina semiolímpica para natação', true),
('Academia - Musculação', 'Academia', 20, 40.00, 'Academia com equipamentos de musculação', false)
ON CONFLICT DO NOTHING;
