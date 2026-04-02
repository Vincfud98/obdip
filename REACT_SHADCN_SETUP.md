# Integracao React + shadcn/ui neste projeto

## Diagnostico atual

O projeto atual e uma aplicacao estatica com:

- `index.html`
- `css/`
- `js/`

Ele **nao possui**:

- `package.json`
- React
- TypeScript
- Tailwind CSS
- configuracao do `shadcn/ui`
- alias `@/`

Por isso, os arquivos abaixo foram adicionados apenas como base de integracao:

- `components/ui/animated-hero-section-1.tsx`
- `components/ui/button.tsx`
- `components/ui/demo.tsx`
- `lib/utils.ts`

## Pasta padrao de componentes

Para `shadcn/ui`, o caminho mais comum e:

- `components/ui`

ou, em projetos com `src`:

- `src/components/ui`

Manter a pasta `components/ui` e importante porque:

- centraliza componentes reutilizaveis do design system
- segue a convencao da maioria dos exemplos do `shadcn/ui`
- evita imports espalhados e inconsistentes
- facilita upgrades e manutencao futura

## Dependencias necessarias

Instale estas dependencias:

```bash
npm install framer-motion @radix-ui/react-slot class-variance-authority lucide-react clsx tailwind-merge
```

## Como preparar a base com React + TypeScript + Tailwind + shadcn

### Opcao recomendada: Vite + React + TypeScript

```bash
npm create vite@latest obdip-react -- --template react-ts
cd obdip-react
npm install
```

### Instalar Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

No `tailwind.config.js` ou `tailwind.config.ts`, configure:

```ts
content: [
  "./index.html",
  "./src/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
],
```

No CSS global:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Inicializar shadcn/ui

```bash
npx shadcn@latest init
```

Sugestao de respostas:

- framework: `Vite`
- TypeScript: `Yes`
- components path: `src/components` ou `components`
- utils path: `src/lib/utils` ou `lib/utils`
- global css: `src/index.css`
- alias: `@/*`

## Alias necessario

No `tsconfig.json`, configure:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*", "./*"]
    }
  }
}
```

## Onde usar o demo

Depois da migracao para React:

- mova `components/ui/demo.tsx` para uma rota ou pagina, como `src/App.tsx`
- importe `AnimatedHeroDemo`

Exemplo:

```tsx
import AnimatedHeroDemo from "@/components/ui/demo";

export default function App() {
  return <AnimatedHeroDemo />;
}
```

## Observacoes

- O componente usa layout responsivo com menu desktop e hero full-screen
- A imagem usada no demo ja aponta para um asset publico do Unsplash
- O logo do demo usa `lucide-react`
