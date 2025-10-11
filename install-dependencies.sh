#!/bin/bash

echo "🚀 Instalando dependências do Sistema Esportivo 4Set..."

# Verificar se estamos no macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detectado macOS"
    
    # Verificar se Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        echo "📦 Instalando Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Instalar Node.js
    if ! command -v node &> /dev/null; then
        echo "📦 Instalando Node.js..."
        brew install node
    else
        echo "✅ Node.js já está instalado"
    fi
    
    # Instalar PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo "📦 Instalando PostgreSQL..."
        brew install postgresql
        brew services start postgresql
    else
        echo "✅ PostgreSQL já está instalado"
    fi
    
else
    echo "❌ Este script é para macOS. Para outros sistemas:"
    echo "   - Instale Node.js: https://nodejs.org/"
    echo "   - Instale PostgreSQL: https://www.postgresql.org/download/"
fi

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: ./start.sh"
echo "2. Ou siga o guia em INSTALACAO.md"
