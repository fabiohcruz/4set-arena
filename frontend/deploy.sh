#!/bin/bash

# Script de Deploy para AWS Amplify
echo "🚀 Iniciando deploy do 4SET ARENA Frontend..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório do frontend"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Executar testes (se existirem)
echo "🧪 Executando testes..."
npm run test --if-present

# Build para produção
echo "🔨 Fazendo build para produção..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos prontos para deploy em: .next/"
    echo ""
    echo "🎯 Próximos passos:"
    echo "1. Faça commit e push para o GitHub"
    echo "2. Configure o AWS Amplify"
    echo "3. Conecte o repositório"
    echo "4. Deploy automático será executado"
else
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi
