-- Sistema de Gestão de Clube de Esporte 4Set
-- Schema inicial do banco de dados

-- Tabela de usuários (administradores, funcionários)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin',
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sócios/membros do clube
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    member_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    membership_type VARCHAR(50) DEFAULT 'regular', -- regular, premium, vip
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de modalidades esportivas
CREATE TABLE IF NOT EXISTS sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de instrutores/professores
CREATE TABLE IF NOT EXISTS instructors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    specialties TEXT[], -- array de modalidades
    hire_date DATE DEFAULT CURRENT_DATE,
    salary DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de turmas/aulas
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport_id INTEGER REFERENCES sports(id),
    instructor_id INTEGER REFERENCES instructors(id),
    max_capacity INTEGER DEFAULT 20,
    current_enrollment INTEGER DEFAULT 0,
    schedule_days VARCHAR(20)[], -- ['monday', 'wednesday', 'friday']
    start_time TIME,
    end_time TIME,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inscrições (membros em turmas)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    class_id INTEGER REFERENCES classes(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, class_id)
);

-- Tabela de mensalidades
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method VARCHAR(50), -- cash, card, pix, bank_transfer
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
    reference_month VARCHAR(7), -- '2024-01'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50), -- tournament, social, training, competition
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    max_participants INTEGER,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de inscrições em eventos
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    member_id INTEGER REFERENCES members(id),
    registration_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'registered', -- registered, confirmed, cancelled
    payment_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, member_id)
);

-- Inserir usuário admin padrão
INSERT INTO users (username, password, email, full_name, role, preferences) 
VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@4set.com', 'Administrador do Sistema', 'admin', '{"theme": "dark", "language": "pt-BR", "notifications": true}')
ON CONFLICT (username) DO NOTHING;

-- Inserir modalidades esportivas padrão
INSERT INTO sports (name, description, icon, color) VALUES
('Natação', 'Aulas de natação para todas as idades', 'swimming', 'blue'),
('Futebol', 'Treinos e jogos de futebol', 'soccer', 'green'),
('Tênis', 'Aulas de tênis em quadras', 'tennis', 'yellow'),
('Basquete', 'Treinos de basquete', 'basketball', 'orange'),
('Vôlei', 'Aulas de vôlei', 'volleyball', 'red'),
('Musculação', 'Academia e musculação', 'gym', 'purple'),
('Pilates', 'Aulas de pilates', 'pilates', 'pink'),
('Crossfit', 'Treinos de crossfit', 'crossfit', 'gray')
ON CONFLICT DO NOTHING;

-- Tabela de configuração do menu principal
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL, -- identificador único do item
    label VARCHAR(100) NOT NULL, -- texto exibido no menu
    icon VARCHAR(50), -- ícone do item
    path VARCHAR(200), -- rota do item
    order_index INTEGER DEFAULT 0, -- ordem de exibição
    is_enabled BOOLEAN DEFAULT true, -- se o item está habilitado
    requires_admin BOOLEAN DEFAULT false, -- se requer permissão de admin
    parent_key VARCHAR(50), -- chave do item pai (para submenus)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir itens padrão do menu
INSERT INTO menu_items (key, label, icon, path, order_index, is_enabled, requires_admin) VALUES
('dashboard', 'Dashboard', 'LayoutDashboard', '/dashboard', 1, true, false),
('reservas', 'Reservas', 'Calendar', '/reservas', 2, true, false),
('clientes', 'Clientes', 'Users', '/clientes', 3, true, false),
('configuracoes', 'Configurações', 'Settings', '/configuracoes', 4, true, true),
('quadras', 'Quadras', 'MapPin', '/configuracoes/quadras', 5, true, true),
('menu-management', 'Gestão do Menu', 'Menu', '/configuracoes/menu', 6, true, true)
ON CONFLICT (key) DO UPDATE SET
    label = EXCLUDED.label,
    icon = EXCLUDED.icon,
    path = EXCLUDED.path,
    order_index = EXCLUDED.order_index,
    is_enabled = EXCLUDED.is_enabled,
    requires_admin = EXCLUDED.requires_admin;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_enabled ON menu_items(is_enabled);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(order_index);
CREATE INDEX IF NOT EXISTS idx_members_membership_type ON members(membership_type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_enrollments_member_id ON enrollments(member_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);