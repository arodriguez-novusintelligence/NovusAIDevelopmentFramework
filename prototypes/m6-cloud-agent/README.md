<!-- NADF-GUIDE
Propósito: Documenta Prototipo M6 — Cursor Cloud Agent × NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Prototipo M6 — Cursor Cloud Agent × NADF

Invoca el **paso 1** del workflow `lovable-to-web` (`lovable-analyzer-agent`) usando Cursor Cloud Agent a través del contrato `AgentRuntime`.

> Esto **no** es el orquestador completo (M5). Solo demuestra el puente runtime (M6).

## Requisitos

- Node.js ≥ 20
- Cuenta Cursor con Cloud Agents habilitados
- `CURSOR_API_KEY` ([Dashboard → Integrations](https://cursor.com/dashboard/integrations))
- Acceso GitHub de esa cuenta a:
  - `NovusAIDevelopmentFramework`
  - `novus-nexus` (si lo usas en el análisis)

## Cómo funciona

```
invoke-lovable-analyzer.ts
  → NadfAgentRuntime.invoke()
      → assertPatternGuards (Planner/Analyzer no escribe código productivo)
      → CursorCloudAdapter.execute()
          → Agent.create({ cloud: { repos } })
          → agent.send(prompt NADF)
          → run.wait()
```

## Setup

```bash
cd prototypes/m6-cloud-agent
cp .env.example .env
# Editar CURSOR_API_KEY y URLs/refs de repos
npm install
npm run invoke:lovable-analyzer
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `CURSOR_API_KEY` | API key Cursor (obligatoria) |
| `NADF_MODEL` | Modelo (default `composer-2.5`) |
| `NADF_PROJECT_ID` | Proyecto NADF (default `novus-intelligence`) |
| `NADF_REPO_FRAMEWORK` | URL del repo NADF |
| `NADF_REPO_LOVABLE` | URL de novus-nexus |
| `NADF_REF_FRAMEWORK` | Branch/ref opcional |
| `NADF_REF_LOVABLE` | Branch/ref opcional |
| `NADF_AUTO_CREATE_PR` | `true`/`false` — PR automático |

## Exit codes

| Code | Significado |
|------|-------------|
| 0 | `finished` |
| 1 | Fallo de arranque (auth/config) |
| 2 | Run falló en el motor |
| 3 | Bloqueado por guardas NADF |

## Documentación

- Guía operativa: [`docs/cloud-agent-integration.md`](../../docs/cloud-agent-integration.md)
- Contrato: [`docs/runtime/agent-runtime-contract.md`](../../docs/runtime/agent-runtime-contract.md)
- ADR: [`ADR-0005`](../../.nadf/global/decision-history/adr/ADR-0005-agent-runtime-bridge.md)

## Seguridad

- Nunca commits de `.env`
- No pongas secretos AWS/GitHub en el prompt; usa MCP / secret stores en fases posteriores
