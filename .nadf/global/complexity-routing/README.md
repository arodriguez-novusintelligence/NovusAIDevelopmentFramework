# NADF-GUIDE
# Propósito: Documenta Complexity Routing (perfiles mínimos según complejidad).
# Configuración: Ver execution-profiles.yml y enterprise-governance/complexity-routing.yml.
# Complexity Routing — Minimum Sufficient Execution

NADF no debe ejecutar el pipeline multiagente completo para cambios sencillos
(color, texto, banner, tipografía). Tras el intake, el **Complexity Routing**
elige un perfil y solo corre desarrollo + pruebas + deploy cuando basta.

## Principio

> La cantidad de agentes debe ser proporcional a complejidad, riesgo e impacto.

Fail-safe: ante duda → `FULL` (nunca ahorrar tokens a costa de seguridad).

## Perfiles

| Perfil | Uso típico | Qué corre |
|--------|------------|-----------|
| `TRIVIAL_VISUAL` | Color, copy, banner | FE + QA lite + deploy WEB |
| `LIGHTWEIGHT_FRONTEND` | Página estática, nav | FE + QA + deploy WEB |
| `LIGHTWEIGHT_BACKEND` | Query / API lectura | BE + QA + deploy Back |
| `STANDARD` | 1–2 capas | Planner + FE/BE + QA + security |
| `FULL` | Cross-layer / duda | Pipeline completo |
| `BLOCKED` | Ambiguo / sin datos | No ejecuta |

Alias legacy: `visual-fast` ≡ `TRIVIAL_VISUAL` (y FE-only ligero).

## Artefacto

`routing-decision.json` (también en artifacts del proyecto):

- `profile`, `route` (legacy), `lightweight`
- `selectedAgents` / `excludedDomains`
- `confidence`, `rationale`, `escalationOn`

## Runtime

- Motor: `prototypes/m6-cloud-agent/src/complexity-routing/`
- CLI Lovable: `npm run route:lovable-change`
- CLI genérico: `npm run route:complexity -- --input signals.json`
- Corpus: `npm run test:complexity-routing`

## Escalamiento

Si durante la ejecución aparecen backend, contratos, auth, migración o falla el
build, **reevaluar** y subir de perfil. No continuar en silencio con el perfil bajo.
