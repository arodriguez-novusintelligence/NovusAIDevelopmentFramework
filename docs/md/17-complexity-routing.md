<!-- NADF-GUIDE
Propósito: Explica Complexity Routing — perfiles mínimos según complejidad.
Configuración: Ver .nadf/global/complexity-routing/ y enterprise-governance/complexity-routing.yml.
-->
# Complexity Routing — Minimum Sufficient Execution

Los cambios sencillos (color, texto, banner) **no** deben ejecutar arquitectura,
backend, database ni security-full. NADF elige un perfil y aplica solo las reglas
necesarias: **desarrollo → pruebas → deploy**.

## Perfiles

| Perfil | Ejemplo | Agentes |
|--------|---------|---------|
| `TRIVIAL_VISUAL` (`visual-fast`) | Color, copy, imagen | FE + QA lite + deploy WEB |
| `LIGHTWEIGHT_FRONTEND` | Página estática | FE + QA + deploy WEB |
| `LIGHTWEIGHT_BACKEND` | Query / API lectura | BE + QA |
| `STANDARD` | FE+BE acotado | Planner + FE/BE + QA + security |
| `FULL` | Cross-layer / duda | Pipeline completo |
| `BLOCKED` | Ambiguo | No ejecuta |

Fail-safe: ante duda → `FULL`. Override crítico (auth, pagos, migración) → `FULL` aunque el cambio “parezca” pequeño.

## Dónde vive

- Catálogo: `.nadf/global/complexity-routing/`
- Política: `enterprise-governance/complexity-routing.yml`
- Motor: `prototypes/m6-cloud-agent/src/complexity-routing/`
- Tests: `npm run test:complexity-routing` (en `prototypes/m6-cloud-agent`)

## Uso

```bash
# Señales genéricas (Issues / initiative / Lovable)
npm run route:complexity -- --input signals.json

# Lovable (lee artifact del analyzer)
npm run route:lovable-change
```

Salida: `routing-decision.json` / `route-decision.json` con `profile`, `lightweight`, `selectedAgents`, `rationale`.
