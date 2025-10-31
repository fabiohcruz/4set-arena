# 📋 SISTEMA 4SET ARENA - DOCUMENTAÇÃO COMPLETA

---

## 🌐 LINKS DE ACESSO

### **Backend (API)**
- **URL:** https://4set-arena-production.up.railway.app
- **Health Check:** https://4set-arena-production.up.railway.app/api/health
- **Plataforma:** Railway
- **Banco de Dados:** PostgreSQL (Railway)

### **Frontend Administrativo**
- **URL:** https://4set-arena-production.up.railway.app *(servido pelo backend)*
- **Alternativa Local:** http://localhost:3000

### **Frontend Membros**
- **URL:** https://4set-arena-t7z4.vercel.app
- **Plataforma:** Vercel
- **Login:** https://4set-arena-t7z4.vercel.app/member/login

---

## 🔐 CREDENCIAIS DE ACESSO

### **👨‍💼 ADMINISTRADOR**
```
Usuário: admin
Senha: password
URL: https://4set-arena-production.up.railway.app/login
```

### **👤 MEMBRO (Exemplo)**
```
Código: MEM0001
Senha: member123
Nome: João Silva Atualizado
Tipo: Premium
URL: https://4set-arena-t7z4.vercel.app/member/login
```

---

## 🛠️ FUNCIONALIDADES DO ADMINISTRATIVO

### **📊 Dashboard**
- Visão geral do sistema
- Estatísticas de reservas
- Estatísticas de vendas
- Gráficos e métricas

### **📅 Reservas**
- Visualizar todas as reservas
- Criar novas reservas
- Editar reservas existentes
- Cancelar reservas
- Filtrar por status, data, quadra

### **👥 Clientes/Membros**
- Listar todos os membros
- Cadastrar novos membros
- Editar informações de membros
- Ativar/desativar membros
- Visualizar histórico de cada membro
- Gerenciar tipos de associação (Regular, Premium, VIP)

### **🏟️ Quadras**
- Listar todas as quadras
- Cadastrar novas quadras
- Editar informações das quadras
- Ativar/desativar quadras
- Definir preços por hora
- Tipos: Tênis, Futebol Society, Basquete, Vôlei

### **🍔 Produtos (Lanchonete/PDV)**
- Listar produtos
- Cadastrar novos produtos
- Editar produtos
- Controlar estoque
- Definir preços
- Categorias: Lanches, Pizzas, Bebidas, Acompanhamentos

### **💰 Vendas (PDV)**
- Registrar vendas
- Visualizar histórico de vendas
- Métodos de pagamento
- Relatórios de vendas
- Controle de caixa

### **📦 Estoque**
- Controle de entrada/saída
- Movimentações de estoque
- Alertas de estoque baixo
- Histórico de movimentações

### **💵 Tarifas**
- Gerenciar tarifas de quadras
- Definir preços por duração
- Tarifas especiais

### **⚙️ Configurações**
- **Gestão do Menu:** Ativar/desativar itens do menu
- **Gestão de Quadras:** Configurações avançadas
- **Usuários:** Gerenciar usuários administrativos
- **Perfil:** Editar perfil do administrador

---

## 👤 FUNCIONALIDADES DA ÁREA DO MEMBRO

### **🏠 Dashboard do Membro**
- **Estatísticas Pessoais:**
  - Total de reservas
  - Reservas ativas
  - Total de pedidos
  - Pedidos pendentes

- **Ações Rápidas:**
  - 🎾 **Nova Reserva:** Reservar quadra
  - 🛒 **Fazer Pedido:** Pedir da lanchonete
  - 👤 **Meu Perfil:** Editar informações
  - 📊 **Histórico:** Ver atividades

- **Reservas Recentes:** Últimas 3 reservas
- **Pedidos Recentes:** Últimos 3 pedidos

### **📅 Reservas**
- **Visualizar Quadras Disponíveis:**
  - Grade de horários
  - Status em tempo real (Disponível, Reservado, Ocupado)
  - Preços por quadra

- **Fazer Reservas:**
  - Selecionar quadra
  - Escolher horário
  - Escolher duração (60min, 90min, 120min)
  - Confirmar reserva

- **Minhas Reservas:**
  - Ver reservas ativas
  - Ver histórico
  - Cancelar reservas (se permitido)

### **🛒 Pedidos (Lanchonete)**
- **Fazer Pedidos:**
  - Ver cardápio completo
  - Adicionar itens ao carrinho
  - Escolher quantidade
  - Escolher tipo de entrega:
    - 🏪 **Retirar no balcão**
    - 🚚 **Entrega** (com endereço)

- **Meus Pedidos:**
  - Ver pedidos ativos
  - Ver histórico de pedidos
  - Status dos pedidos:
    - 🟡 **Pendente** (destaque especial + botão de pagamento)
    - 🔵 **Em preparo**
    - 🟢 **Pronto**
    - ✅ **Entregue**
    - ❌ **Cancelado**
  - Detalhes de cada pedido
  - Total e forma de pagamento
  - **💳 Pagamento Online:** Botão para pagar pedidos pendentes

### **💳 Sistema de Pagamentos**
- **Integração com Mercado Pago:**
  - Pagamento de reservas
  - Pagamento de pedidos
  - Cartão de crédito/débito
  - Pix
  - Boleto bancário

- **Locais com Botão de Pagamento:**
  - 🏠 **Dashboard:** Reservas e pedidos pendentes
  - 📦 **Lista de Pedidos:** Cada pedido pendente
  - 🔍 **Detalhes do Pedido:** Modal com destaque para pagamento
  - 📅 **Reservas:** Reservas com pagamento pendente

- **Fluxo de Pagamento:**
  1. Clica no botão "💳 Pagar R$ XX,XX"
  2. Redireciona para Mercado Pago
  3. Completa o pagamento
  4. Retorna para página de sucesso/falha/pendente
  5. Webhook atualiza status automaticamente
  6. Recebe confirmação por email e SMS

- **Páginas de Retorno:**
  - ✅ **Sucesso:** Pagamento aprovado com animação
  - ❌ **Falha:** Pagamento recusado com opção de tentar novamente
  - ⏳ **Pendente:** Aguardando confirmação (boleto/pix)

### **📧 Sistema de Notificações**
- **Email Automático (SendGrid):**
  - ✅ Confirmação de reserva (template HTML responsivo)
  - ✅ Confirmação de pedido (com lista de itens)
  - ✅ Confirmação de pagamento
  - ✅ Templates profissionais com logo e cores da marca
  - ✅ Histórico de emails enviados no banco

- **SMS Automático (Twilio):**
  - ✅ Confirmação de reserva
  - ✅ Lembrete 1 hora antes da reserva
  - ✅ Pedido pronto para retirada
  - ✅ Confirmação de pagamento
  - ✅ Histórico de SMS enviados no banco

- **Quando são Enviadas:**
  - 🎯 **Imediatamente** após pagamento aprovado
  - ⏰ **1 hora antes** da reserva (lembrete)
  - 🍔 **Quando pedido** estiver pronto
  - 💳 **Após confirmação** de pagamento pelo webhook

### **👤 Meu Perfil**
- **Informações Pessoais:**
  - Nome completo
  - Email
  - Telefone
  - Data de nascimento
  - Endereço completo

- **Informações de Associação:**
  - Código de membro
  - Tipo de associação (Regular/Premium/VIP)
  - Status (Ativo/Inativo)
  - Data de adesão

- **Editar Perfil:**
  - Atualizar informações pessoais
  - Alterar endereço
  - Atualizar contatos

---

## 🎨 CARACTERÍSTICAS DO DESIGN

### **Interface Moderna:**
- ✨ Glassmorphism (efeito de vidro)
- 🌈 Gradientes vibrantes (azul → roxo)
- 🎭 Animações suaves (Framer Motion)
- 📱 Totalmente responsivo (mobile-first)
- 🌙 Tema escuro elegante

### **Experiência do Usuário:**
- 🚀 Navegação intuitiva
- 📊 Cards informativos
- 🔔 Notificações visuais
- ⚡ Carregamento rápido
- 🎯 Ações rápidas destacadas

---

## 🗄️ BANCO DE DADOS

### **Tabelas Principais:**
1. **users** - Usuários administrativos
2. **members** - Membros/clientes (com coluna `password` para login)
3. **courts** - Quadras esportivas
4. **reservations** - Reservas de quadras (com `payment_status` e `payment_id`)
5. **products** - Produtos da lanchonete
6. **sales** - Vendas realizadas
7. **sale_items** - Itens das vendas
8. **stock_movements** - Movimentações de estoque
9. **menu_items** - Itens do menu administrativo
10. **tariffs** - Tarifas e preços

### **Tabelas de Pagamento e Notificações:**
11. **payments** - Pagamentos (Mercado Pago)
    - `payment_id` - ID do Mercado Pago
    - `external_reference` - Referência única
    - `status` - Status do pagamento (pending/approved/rejected)
    - `amount` - Valor
    - `member_id` - Membro que pagou
    - `reservation_id` - Reserva relacionada (se aplicável)
    - `order_id` - Pedido relacionado (se aplicável)
    - `metadata` - Dados completos do Mercado Pago

12. **notifications** - Histórico de notificações
    - `type` - Tipo (email/sms)
    - `recipient_type` - Destinatário (member/admin)
    - `recipient_email` - Email do destinatário
    - `recipient_phone` - Telefone do destinatário
    - `subject` - Assunto
    - `message` - Mensagem enviada
    - `status` - Status (sent/failed)
    - `sent_at` - Data/hora de envio

13. **orders** - Pedidos da lanchonete
    - `order_number` - Número do pedido
    - `member_id` - Membro que fez o pedido
    - `total` - Valor total
    - `status` - Status do pedido
    - `payment_status` - Status do pagamento
    - `payment_id` - Pagamento relacionado
    - `delivery_type` - Tipo de entrega (pickup/delivery)

14. **order_items** - Itens dos pedidos
    - `order_id` - Pedido relacionado
    - `product_id` - Produto
    - `product_name` - Nome do produto
    - `quantity` - Quantidade
    - `unit_price` - Preço unitário
    - `total_price` - Preço total

### **Dados de Exemplo:**
- ✅ 4 quadras cadastradas
- ✅ 3 membros de exemplo (com senha configurada)
- ✅ Produtos da lanchonete
- ✅ Menu administrativo configurado
- ✅ Tabelas de pagamento prontas
- ✅ Sistema de notificações ativo

---

## 🔒 SEGURANÇA

- 🔐 Autenticação JWT (JSON Web Tokens)
- 🔑 Senhas criptografadas (bcrypt)
- 🛡️ Middleware de autenticação
- 🚫 CORS configurado
- 👮 Controle de acesso por role (admin/member)
- 🔒 Rotas protegidas

---

## 📱 TECNOLOGIAS UTILIZADAS

### **Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL (direct queries via `pg`)
- JWT (autenticação)
- bcrypt (criptografia)
- CORS & Helmet (segurança)
- **Mercado Pago SDK** (pagamentos online)
- **SendGrid** (emails transacionais)
- **Twilio** (SMS/notificações)

### **Frontend:**
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Framer Motion (animações)
- Lucide React (ícones)

### **Deploy:**
- Backend: Railway
- Frontend Membros: Vercel
- Banco de Dados: PostgreSQL (Railway)

---

## 🚀 PRÓXIMOS PASSOS SUGERIDOS

### **Funcionalidades Implementadas:** ✅
1. ✅ **Sistema de pagamento online** (Mercado Pago)
2. ✅ **Notificações por email** (SendGrid)
3. ✅ **Notificações por SMS** (Twilio)
4. ✅ **Webhooks automáticos** (atualização de status)
5. ✅ **Histórico de pagamentos**
6. ✅ **Histórico de notificações**

### **Funcionalidades Futuras:**
1. Chat de suporte em tempo real
2. Programa de fidelidade com pontos
3. Cupons de desconto
4. Relatórios financeiros avançados
5. Dashboard de analytics
6. App mobile (iOS/Android)
7. Assinaturas/planos mensais
8. Split de pagamento (dividir conta)
9. Integração com calendários (Google, Apple)
10. Sistema de avaliações e reviews

### **Melhorias Técnicas:**
1. Backup automático do banco
2. Monitoramento de performance (APM)
3. Logs de auditoria detalhados
4. Testes automatizados (Jest/Cypress)
5. Domínio personalizado
6. CDN para assets
7. Cache Redis
8. Rate limiting
9. Documentação da API (Swagger)
10. CI/CD pipeline

---

## 📞 SUPORTE

Para suporte técnico ou dúvidas sobre o sistema, consulte a documentação técnica em:
- README.md
- INSTALACAO.md
- DEPLOY_AWS.md
- **GUIA_FINAL_PAGAMENTOS.md** - Guia completo de pagamentos
- **CONFIGURACAO_PAGAMENTOS.md** - Configuração técnica

---

## 🔑 CREDENCIAIS DAS APIS (Configuradas no Railway)

### **Mercado Pago:**
- Access Token: `APP_USR-c9410f1f-9b77-4950-a04e-c31c017debe2`
- Ambiente: Produção
- Métodos: Cartão, Pix, Boleto

### **SendGrid (Email):**
- API Key: `SG.PGvPvmBcSYGmxv7o-Kz9sA...` (configurada)
- From Email: `4set@4set.com.br`
- From Name: `4SET ARENA`
- Templates: HTML responsivos

### **Twilio (SMS):**
- Account SID: `AC085138d9d7b6783a892b4056e2a207ff`
- Auth Token: Configurado
- Phone Number: `5547999810017`
- Região: Brasil

---

## 📊 ENDPOINTS DA API DE PAGAMENTO

### **Pagamentos:**
- `POST /api/payments/reservation` - Criar pagamento de reserva
- `POST /api/payments/order` - Criar pagamento de pedido
- `POST /api/payments/webhook` - Webhook do Mercado Pago
- `GET /api/payments/my-payments` - Listar meus pagamentos
- `GET /api/payments/status/:ref` - Status de um pagamento

### **Setup:**
- `GET /api/setup-payments` - Criar tabelas de pagamento
- `GET /api/health` - Health check da API

---

## 🎯 CARTÕES DE TESTE (Mercado Pago)

### ✅ **Aprovado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: APRO
```

### ❌ **Recusado:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: OTHE
```

### ⏳ **Pendente:**
```
Número: 5031 4332 1540 6351
CVV: 123
Validade: 11/25
Nome: PEND
```

---

**🎉 Sistema totalmente funcional e pronto para uso!**

*Última atualização: 19 de Outubro de 2025*

