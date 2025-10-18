# 🔧 CONFIGURAÇÃO DO SISTEMA DE PAGAMENTOS E NOTIFICAÇÕES

## 📋 VARIÁVEIS DE AMBIENTE - RAILWAY

Acesse o Railway e adicione as seguintes variáveis de ambiente no seu projeto backend:

### 🔐 Credenciais já fornecidas:

```env
# Twilio (SMS)
TWILIO_ACCOUNT_SID=AC085138d9d7b6783a892b4056e2a207ff
TWILIO_AUTH_TOKEN=e87422ff64ad0aedd0134c5d427e418f
TWILIO_PHONE_NUMBER=5547999810017

# SendGrid (Email)
SENDGRID_API_KEY=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
FROM_EMAIL=4set@4set.com.br
FROM_NAME=4SET ARENA

# URLs
FRONTEND_URL=https://4set-arena-t7z4.vercel.app
BACKEND_URL=https://4set-arena-production.up.railway.app
```

### ⚠️ FALTA CONFIGURAR:

```env
# Mercado Pago (VOCÊ PRECISA CRIAR UMA CONTA)
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
```

---

## 💳 COMO OBTER O ACCESS TOKEN DO MERCADO PAGO

### Opção 1: Modo Teste (Sandbox) - Para testar sem dinheiro real

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login ou crie uma conta
3. Vá em **"Suas integrações"** > **"Criar aplicação"**
4. Dê um nome (ex: "4SET Arena")
5. Selecione o modelo de integração: **"Pagamentos online"**
6. Copie o **"Access Token de Teste"**
7. Cole no Railway como `MERCADOPAGO_ACCESS_TOKEN`

### Opção 2: Modo Produção - Para pagamentos reais

1. Complete o cadastro da sua conta Mercado Pago
2. Ative sua conta para receber pagamentos
3. Vá em **"Credenciais de produção"**
4. Copie o **"Access Token de Produção"**
5. Cole no Railway como `MERCADOPAGO_ACCESS_TOKEN`

---

## 🗄️ CRIAR TABELAS NO BANCO DE DADOS

Após configurar as variáveis de ambiente no Railway, execute:

```bash
# O Railway vai fazer o deploy automaticamente
# As tabelas serão criadas quando o servidor iniciar
```

Ou execute manualmente via Railway CLI:

```bash
railway run npm run build && node dist/scripts/createPaymentTables.js
```

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Verificar logs do Railway
- Procure por: `✅ Tabelas de pagamento criadas com sucesso!`

### 2. Testar API de pagamento
```bash
curl https://4set-arena-production.up.railway.app/api/health
```

### 3. Testar no frontend
- Acesse: https://4set-arena-t7z4.vercel.app/member/login
- Faça login com: `MEM0001` / `member123`
- Tente fazer uma reserva e pagar

---

## 📊 TABELAS CRIADAS

O sistema criou as seguintes tabelas:

1. **payments** - Armazena todos os pagamentos
2. **notifications** - Histórico de emails/SMS enviados
3. **orders** - Pedidos da lanchonete
4. **order_items** - Itens dos pedidos

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Sistema de Pagamento (Mercado Pago)
- [x] Criar preferência de pagamento para reservas
- [x] Criar preferência de pagamento para pedidos
- [x] Processar webhooks do Mercado Pago
- [x] Atualizar status de pagamento automaticamente
- [x] Páginas de retorno (sucesso, falha, pendente)

### ✅ Notificações por Email (SendGrid)
- [x] Email de confirmação de reserva
- [x] Email de confirmação de pedido
- [x] Templates HTML responsivos
- [x] Histórico de emails enviados

### ✅ Notificações por SMS (Twilio)
- [x] SMS de confirmação de reserva
- [x] SMS de lembrete (1 hora antes)
- [x] SMS de pedido pronto
- [x] Histórico de SMS enviados

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ Configurar variáveis de ambiente no Railway
2. ✅ Obter Access Token do Mercado Pago
3. ⏳ Aguardar deploy automático do Railway
4. ⏳ Testar pagamento no frontend
5. ⏳ Verificar recebimento de emails
6. ⏳ Verificar recebimento de SMS

---

## 🆘 TROUBLESHOOTING

### Erro: "Mercado Pago não configurado"
- Verifique se `MERCADOPAGO_ACCESS_TOKEN` está configurado no Railway

### Erro: "SendGrid não configurado"
- Verifique se `SENDGRID_API_KEY` está configurado no Railway
- Verifique se o email remetente está verificado no SendGrid

### Erro: "Twilio não configurado"
- Verifique se as 3 variáveis do Twilio estão configuradas
- Verifique se o número está no formato correto: `5547999810017`

### SMS não está sendo enviado
- Contas Twilio trial só enviam SMS para números verificados
- Você precisa adicionar créditos ou verificar os números destinatários

---

## 📞 CONTATOS

- **Desenvolvedor:** Fabio Cruz
- **Email:** 4set@4set.com.br
- **Telefone:** (47) 99981-0017

---

**Data de criação:** 18/10/2025
**Versão:** 1.0.0

