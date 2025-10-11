# Logo da 4SET ARENA

## ✅ Logo Implementada

A logo da **4SET ARENA** já está implementada e ativa no sistema!

### 📁 Arquivos da Logo

- `logo.svg` - Logo principal da 4SET ARENA (formato vetorial)
- `logo-placeholder.svg` - Logo de exemplo (backup)

### 🎨 Características da Logo

- **Formato**: SVG (vetorial, escalável)
- **Design**: Formato diamante com bordas pretas
- **Cores**: Preto, branco e verde limão (#00FF00)
- **Texto**: "4SET" em branco e "ARENA" em verde
- **Elementos**: Triângulos verdes nas partes superior e inferior

## 🎨 Personalizações Disponíveis

### Tamanhos Disponíveis
- `sm` - Pequeno (32x32px)
- `md` - Médio (40x40px) 
- `lg` - Grande (48x48px)
- `xl` - Extra Grande (64x64px)

### Variantes Disponíveis
- `default` - Logo + texto "4Set Sports"
- `full` - Logo + texto completo + subtítulo
- `minimal` - Apenas a logo (sem texto)

### Exemplos de Uso

```tsx
// Logo pequena sem texto
<Logo size="sm" variant="minimal" />

// Logo média com texto completo
<Logo size="md" variant="full" />

// Logo grande padrão
<Logo size="lg" variant="default" />
```

## 📝 Personalizar o Nome da Empresa

Para alterar o nome da empresa, edite o arquivo `/src/components/Logo.tsx` na linha 35:

```typescript
{variant === 'full' ? 'Nome da Sua Empresa' : '4Set Sports'}
```

Substitua `'Nome da Sua Empresa'` pelo nome real da sua empresa.

## 🎯 Onde a Logo Aparece

A logo será exibida automaticamente em:

1. **Sidebar/SideMenu** - Cabeçalho do menu lateral
2. **Página de Login** - Lado esquerdo da tela
3. **Header/Top Bar** - Cabeçalho principal (versão minimal)
4. **Tela de Loading** - Durante o carregamento

## 💡 Dicas

- Use formato PNG com fundo transparente
- Para melhor qualidade, use SVG
- Mantenha proporções quadradas (1:1)
- Teste em diferentes tamanhos para garantir legibilidade
- Considere criar versões para fundos claros e escuros
