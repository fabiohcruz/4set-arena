# 🚀 Guia de Deploy - 4SET ARENA na AWS

## 📋 Pré-requisitos

### 1. Conta AWS
- Criar conta em [aws.amazon.com](https://aws.amazon.com)
- Ativar Free Tier (12 meses gratuitos)
- Configurar billing alerts

### 2. Ferramentas Necessárias
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Elastic Beanstalk CLI
pip install awsebcli

# Git (já instalado)
```

## 🎯 Deploy do Frontend (AWS Amplify)

### Passo 1: Preparar o Frontend
```bash
cd frontend
chmod +x deploy.sh
./deploy.sh
```

### Passo 2: Subir para GitHub
```bash
git add .
git commit -m "feat: prepare for AWS deployment"
git push origin main
```

### Passo 3: Configurar Amplify
1. Acesse [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Clique em "New app" → "Host web app"
3. Conecte seu repositório GitHub
4. Selecione o branch `main`
5. Configure o build:
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
   - **Base directory**: `frontend`

### Passo 4: Variáveis de Ambiente no Amplify
```
NEXT_PUBLIC_API_URL=https://4set-arena-backend.elasticbeanstalk.com
NEXT_PUBLIC_APP_NAME=4SET ARENA
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🏗️ Deploy do Backend (Elastic Beanstalk)

### Passo 1: Configurar AWS CLI
```bash
aws configure
# AWS Access Key ID: [sua-chave]
# AWS Secret Access Key: [sua-chave-secreta]
# Default region: us-east-1
# Default output format: json
```

### Passo 2: Preparar o Backend
```bash
cd backend
chmod +x deploy-aws.sh
./deploy-aws.sh
```

### Passo 3: Configurar Variáveis de Ambiente
```bash
eb setenv NODE_ENV=production
eb setenv DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/4set_arena
eb setenv JWT_SECRET=sua-chave-super-secreta
```

## 🗄️ Configurar Banco de Dados (RDS)

### Passo 1: Criar Instância RDS
1. Acesse [RDS Console](https://console.aws.amazon.com/rds/)
2. Clique em "Create database"
3. Configurações:
   - **Engine**: PostgreSQL
   - **Template**: Free tier
   - **DB instance identifier**: 4set-arena-db
   - **Master username**: admin
   - **Master password**: [senha-forte]
   - **DB name**: 4set_arena

### Passo 2: Configurar Security Group
1. Acesse [EC2 Security Groups](https://console.aws.amazon.com/ec2/v2/home#SecurityGroups:)
2. Encontre o security group do RDS
3. Adicione regra:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Security group do Elastic Beanstalk

## 🔧 Configurações Finais

### 1. Atualizar URL do Backend no Frontend
```bash
# No Amplify Console, atualize a variável:
NEXT_PUBLIC_API_URL=https://seu-backend.elasticbeanstalk.com
```

### 2. Configurar CORS no Backend
```javascript
// No seu backend, adicione:
app.use(cors({
  origin: ['https://seu-frontend.amplifyapp.com'],
  credentials: true
}));
```

### 3. Testar Deploy
1. Acesse a URL do Amplify
2. Teste todas as funcionalidades
3. Verifique logs no CloudWatch

## 📊 Monitoramento

### CloudWatch Logs
- **Frontend**: Amplify → App → Build logs
- **Backend**: Elastic Beanstalk → Environment → Logs

### Custos
- **Free Tier**: 12 meses gratuitos
- **Após Free Tier**: ~$20-25/mês
- **Monitoramento**: Cost Explorer

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Build Falha no Amplify
```bash
# Verificar logs no Amplify Console
# Verificar se todas as dependências estão no package.json
```

#### 2. Backend não conecta ao RDS
```bash
# Verificar Security Groups
# Verificar variáveis de ambiente
eb logs
```

#### 3. CORS Errors
```bash
# Verificar configuração CORS no backend
# Verificar URLs nas variáveis de ambiente
```

## 🎉 URLs Finais

Após o deploy, você terá:
- **Frontend**: `https://main.d1234567890.amplifyapp.com`
- **Backend**: `https://4set-arena-backend.elasticbeanstalk.com`
- **Banco**: `4set-arena-db.xxxxx.us-east-1.rds.amazonaws.com`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no CloudWatch
2. Consulte a documentação AWS
3. Verifique as configurações de Security Groups
4. Teste localmente primeiro

---

**🎯 Deploy concluído com sucesso!** Seu sistema 4SET ARENA estará rodando na nuvem AWS! 🚀
