# Reglas frontend — Novus Intelligence Solutions

Reglas específicas para implementación en `NovusIntelligenceWEB`.

## Stack

| Tecnología | Versión/Uso |
|------------|-------------|
| React | Componentes funcionales con hooks |
| TypeScript | Strict mode |
| Tailwind CSS | Utility-first, design tokens del proyecto |
| React Router | Routing declarativo |
| Vite | Build tool |

## Convenciones de código

### Estructura de archivos

```
src/
├── components/       # Componentes reutilizables
│   ├── ui/           # Componentes base (Button, Card, Input)
│   └── layout/       # Header, Footer, Layout
├── pages/            # Páginas/rutas
├── hooks/            # Custom hooks
├── services/         # Llamadas a API
├── types/            # Tipos TypeScript
├── utils/            # Utilidades
└── assets/           # Imágenes, fuentes, iconos
```

### Naming

- Componentes: PascalCase (`HeroSection.tsx`)
- Hooks: camelCase con prefijo `use` (`useContactForm.ts`)
- Utilidades: camelCase (`formatDate.ts`)
- Tipos/Interfaces: PascalCase con prefijo descriptivo (`ContactFormData`)

### Componentes

- Un componente por archivo
- Props tipadas con interface
- Export named (no default export salvo pages)
- Preferir composición sobre herencia

### Styling

- Usar clases Tailwind; evitar CSS modules salvo casos excepcionales
- Responsive: mobile-first (`sm:`, `md:`, `lg:`, `xl:`)
- Colores y tipografía del design system del proyecto, no de Lovable
- Breakpoints estándar: 375px (mobile), 768px (tablet), 1280px (desktop)

## Prohibiciones

- No copiar código de Lovable
- No usar mock data en componentes de producción
- No hardcodear URLs de API (usar variables de entorno)
- No añadir dependencias sin justificación
- No usar `any` en TypeScript

## SEO

- Cada página debe tener `<title>` y `<meta description>` únicos
- Un solo `<h1>` por página
- Jerarquía de headings correcta (h1 → h2 → h3)
- Atributos `alt` en todas las imágenes
- URLs semánticas y amigables

## Accesibilidad básica

- Elementos interactivos accesibles por teclado
- Contraste de color suficiente
- Labels en formularios
- ARIA attributes cuando sea necesario

## Referencias

- Agente: `.claude/agents/frontend-integration-agent.md`
- Contexto técnico: `memory/technical-context.md`
- Contexto de marca: `memory/brand-context.md`
