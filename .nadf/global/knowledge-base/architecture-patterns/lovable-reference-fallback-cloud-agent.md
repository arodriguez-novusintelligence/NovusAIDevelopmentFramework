# Patrón: Fallback referencia Lovable en Cloud Agent

## Contexto

Ejecución de `visual-parity-agent` en Cursor Cloud Agent (M6) cuando la variable de entorno `NADF_LOVABLE_REFERENCE_URL` no está definida o la URL remota no es accesible desde el runtime.

## Solución

1. **Levantar referencia local.** En el repositorio `novus-nexus` (Lovable source):
   ```bash
   npm run dev -- --port 4173
   ```
2. **Usar como URL de referencia** `http://localhost:4173` (o la URL expuesta por el runtime si aplica port-forward).
3. **Congelar animaciones** antes de capturar para evitar diff por estados transitorios (hover, fade-in, contadores).
4. **Documentar en informe** qué referencia se usó (`informe-paridad-visual.md` → campo `referenceUrl` / notas).
5. **Registrar fallback** en `project-context.yml` o runbook del proyecto para corridas futuras.

### Alternativa preferida

Definir `NADF_LOVABLE_REFERENCE_URL` en el entorno del Cloud Agent cuando el despliegue Lovable preview esté disponible — evita dependencia de build local.

## Ejemplo

Corrida **novus-intelligence-lovable-to-web** (2026-07-15):
- `NADF_LOVABLE_REFERENCE_URL` no definida; referencia `novus-nexus` local @ puerto 4173.
- 12 capturas ejecutadas con referencia local estable.
- Evidencia: `artifacts/informe-paridad-visual.md`, `artifacts/metricas-ejecucion.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `docs/cloud-agent-integration.md`
- ADR-0005 (Agent Runtime Bridge)
- ADR-0006 (paridad visual)

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-015 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | medium |
| Fecha | 2026-07-15 |
