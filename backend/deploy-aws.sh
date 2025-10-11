#!/bin/bash

# Script de Deploy para AWS Elastic Beanstalk
echo "🚀 Iniciando deploy do 4SET ARENA Backend..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório do backend"
    exit 1
fi

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não encontrado. Instale primeiro:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Verificar se EB CLI está instalado
if ! command -v eb &> /dev/null; then
    echo "❌ Elastic Beanstalk CLI não encontrado. Instale primeiro:"
    echo "   pip install awsebcli"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --production

# Inicializar EB (se não existir)
if [ ! -d ".elasticbeanstalk" ]; then
    echo "🔧 Inicializando Elastic Beanstalk..."
    eb init 4set-arena-backend --platform node.js --region us-east-1
fi

# Criar ambiente (se não existir)
echo "🌍 Verificando ambiente..."
eb status || eb create 4set-arena-prod --single

# Deploy
echo "🚀 Fazendo deploy..."
eb deploy

if [ $? -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 URL do backend:"
    eb status | grep "CNAME"
else
    echo "❌ Erro no deploy. Verifique os logs:"
    echo "   eb logs"
fi
