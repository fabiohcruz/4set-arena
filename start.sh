#!/bin/bash

echo "🚀 Iniciando Sistema Esportivo 4Set..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ primeiro."
    echo "📥 Download: https://nodejs.org/"
    exit 1
fi

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não está instalado. Por favor, instale o PostgreSQL primeiro."
    echo "📥 Download: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ Node.js e PostgreSQL encontrados!"

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend
npm install

echo "🎉 Instalação concluída!"
echo ""
echo "📋 Para executar o projeto:"
echo "1. Configure o PostgreSQL com:"
echo "   - Database: 4set_sports"
echo "   - User: postgres"
echo "   - Password: postgres123"
echo ""
echo "2. Execute o backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Execute o frontend (em outro terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Acesse: http://localhost:3000"
echo "   Login: admin / admin"
