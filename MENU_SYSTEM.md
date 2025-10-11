# 🎛️ Sistema de Menu Flexível - 4Set Sports

## 📋 Visão Geral

O sistema agora possui um menu completamente flexível que permite alternar entre diferentes posições:

- **Menu Superior**: Menu horizontal no topo da página
- **Menu Lateral Esquerdo**: Menu vertical na lateral esquerda
- **Menu Lateral Direito**: Menu vertical na lateral direita

## 🎯 Funcionalidades

### ✅ **Configuração Dinâmica**
- Botão de configuração no header (ícone de layout)
- Painel de configuração com 3 opções
- Preferência salva automaticamente no localStorage
- Transições suaves entre posições

### ✅ **Menu Superior**
- Menu horizontal com dropdowns
- Barra de pesquisa integrada
- Botões de ação rápida (adicionar, notificações)
- Submenus organizados por categoria

### ✅ **Menu Lateral (Esquerda/Direita)**
- Menu vertical com navegação completa
- Informações do usuário
- Barra de pesquisa
- Ações rápidas e logout
- Animações de entrada/saída

## 🎨 **Características Visuais**

### **Design Glassmorphism**
- Background com transparência e blur
- Bordas sutis com gradientes
- Animações suaves com Framer Motion
- Tema esportivo com cores vibrantes

### **Responsividade**
- Menu lateral oculto em mobile
- Overlay para mobile
- Botão hambúrguer para alternar
- Layout adaptativo

## 🚀 **Como Usar**

### **1. Acessar Configuração**
- Clique no ícone de layout (⚙️) no header
- Escolha entre as 3 posições disponíveis
- A preferência é salva automaticamente

### **2. Navegação**
- **Menu Superior**: Clique nos itens ou use dropdowns
- **Menu Lateral**: Clique nos itens para navegar
- **Mobile**: Use o botão hambúrguer para abrir/fechar

### **3. Funcionalidades Especiais**
- **Busca**: Campo de pesquisa em todas as posições
- **Notificações**: Ícone com indicador de notificação
- **Ações Rápidas**: Botão "+" para adicionar conteúdo
- **Perfil**: Acesso rápido ao perfil do usuário

## 📱 **Posições Disponíveis**

### **🏠 Menu Superior**
```
┌─────────────────────────────────────┐
│ [Logo] [Menu Items] [Search] [⚙️]   │
│ [Dashboard] [Atletas] [Competições] │
└─────────────────────────────────────┘
│                                     │
│           Conteúdo Principal        │
│                                     │
```

### **⬅️ Menu Lateral Esquerdo**
```
┌─────┬───────────────────────────────┐
│ [🏠] │ [Logo] [Search] [⚙️]          │
│ [👥] │                               │
│ [🏆] │     Conteúdo Principal        │
│ [🎯] │                               │
│ [📊] │                               │
└─────┴───────────────────────────────┘
```

### **➡️ Menu Lateral Direito**
```
┌───────────────────────────────┬─────┐
│ [Logo] [Search] [⚙️]          │ [🏠] │
│                               │ [👥] │
│     Conteúdo Principal        │ [🏆] │
│                               │ [🎯] │
│                               │ [📊] │
└───────────────────────────────┴─────┘
```

## 🔧 **Arquivos Principais**

- `components/Layout.tsx` - Layout principal
- `components/TopMenu.tsx` - Menu horizontal
- `components/SideMenu.tsx` - Menu lateral
- `components/MenuConfig.tsx` - Configuração
- `hooks/useMenuPosition.ts` - Hook de posição

## 🎯 **Próximas Melhorias**

- [ ] Personalização de cores do menu
- [ ] Tamanho customizável do menu lateral
- [ ] Temas adicionais
- [ ] Atalhos de teclado
- [ ] Menu colapsável
- [ ] Favoritos personalizados

---

**Sistema desenvolvido com ❤️ para máxima flexibilidade e experiência do usuário!**


