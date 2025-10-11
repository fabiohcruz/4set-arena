# 4Set Sports - Sistema Esportivo

Sistema completo para gestão esportiva com design moderno e tecnologia de ponta.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Banco de Dados**: PostgreSQL
- **Orquestração**: Docker Compose

## 🎨 Características

- Design glassmorphism com animações suaves
- Interface responsiva e moderna
- Autenticação JWT segura
- Menu lateral inovador com micro-interações
- Tema esportivo com cores vibrantes

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

## 🛠️ Instalação e Execução

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd 4set_1
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

### 3. Execute com Docker Compose
```bash
docker-compose up --build
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

## 🔐 Login Padrão

- **Usuário**: admin
- **Senha**: admin

## 📁 Estrutura do Projeto

```
4set_1/
├── docker-compose.yml          # Orquestração dos serviços
├── .env.example               # Variáveis de ambiente
├── backend/                   # API Node.js + Express
│   ├── src/
│   │   ├── config/           # Configuração do banco
│   │   ├── controllers/      # Lógica de negócio
│   │   ├── middleware/       # Middlewares (auth, etc)
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   └── scripts/         # Scripts utilitários
│   └── init.sql             # Schema inicial do banco
└── frontend/                 # Aplicação Next.js
    └── src/
        ├── app/             # Páginas (App Router)
        ├── components/      # Componentes React
        ├── context/         # Contextos (Auth)
        └── lib/            # Utilitários
```

## 🔧 Desenvolvimento

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Funcionalidades Implementadas

### ✅ Autenticação
- Login com JWT
- Middleware de autenticação
- Contexto de autenticação no frontend
- Proteção de rotas

### ✅ Interface
- Página de login com design glassmorphism
- Dashboard com estatísticas
- Menu lateral responsivo
- Animações com Framer Motion

### ✅ Módulos do Sistema
- Dashboard (home)
- Atletas
- Competições
- Treinos
- Estatísticas
- Configurações

## 🎯 Próximos Passos

- [ ] Implementar CRUD completo para atletas
- [ ] Sistema de competições
- [ ] Módulo de treinos
- [ ] Relatórios e estatísticas
- [ ] Sistema de notificações
- [ ] Upload de imagens
- [ ] API de relatórios

## 🐛 Solução de Problemas

### Erro de conexão com banco
```bash
docker-compose down
docker-compose up --build
```

### Limpar volumes do Docker
```bash
docker-compose down -v
docker-compose up --build
```

## 📝 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para o sistema esportivo 4Set**
