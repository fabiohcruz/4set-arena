# 🚀 Guia de Instalação - Sistema Esportivo 4Set

## 📋 Pré-requisitos

Para executar o sistema, você precisa instalar:

### 1. Node.js (Obrigatório)
```bash
# No macOS, use o Homebrew:
brew install node

# Ou baixe diretamente do site:
# https://nodejs.org/
```

### 2. PostgreSQL (Obrigatório)
```bash
# No macOS, use o Homebrew:
brew install postgresql
brew services start postgresql

# Ou baixe do site:
# https://www.postgresql.org/download/
```

### 3. Docker (Opcional - para versão containerizada)
```bash
# No macOS:
brew install --cask docker

# Ou baixe do site:
# https://www.docker.com/products/docker-desktop/
```

## 🛠️ Instalação Passo a Passo

### Opção 1: Execução Local (Recomendada)

#### 1. Instalar dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Configurar PostgreSQL
```bash
# Criar banco de dados
createdb 4set_sports

# Executar script de setup
psql -d 4set_sports -f setup-database.sql
```

#### 3. Executar o projeto
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### 4. Acessar
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Login**: admin / admin

### Opção 2: Com Docker (Se instalado)

```bash
# Executar tudo com Docker
docker-compose up --build
```

## 🔧 Solução de Problemas

### Erro: "command not found: node"
```bash
# Instalar Node.js
brew install node
# ou baixar de https://nodejs.org/
```

### Erro: "command not found: psql"
```bash
# Instalar PostgreSQL
brew install postgresql
brew services start postgresql
```

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
brew services list | grep postgresql

# Iniciar PostgreSQL
brew services start postgresql
```

### Erro de porta em uso
```bash
# Verificar processos nas portas
lsof -i :3000
lsof -i :5000

# Matar processo se necessário
kill -9 <PID>
```

## 📱 Testando o Sistema

1. Acesse http://localhost:3000
2. Faça login com:
   - **Usuário**: admin
   - **Senha**: admin
3. Explore o dashboard e menu lateral

## 🎯 Próximos Passos

Após a instalação, você pode:
- Adicionar novos módulos
- Personalizar o design
- Implementar funcionalidades específicas
- Deploy em produção

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os pré-requisitos estão instalados
2. Confirme se as portas 3000 e 5000 estão livres
3. Verifique se o PostgreSQL está rodando
4. Execute os comandos de instalação na ordem correta
