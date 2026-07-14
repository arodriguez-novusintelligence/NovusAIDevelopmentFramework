# Patrón: Referencia Lovable estandarizada para paridad visual

## Contexto

Ejecuciones de `visual-parity-agent` en Cloud Agent (M6) donde la referencia Lovable no está definida de forma reproducible. Aplica cuando `NADF_LOVABLE_REFERENCE_URL` no está configurada y se recurre a builds locales ad-hoc.

## Solución

1. **Preferir URL estable.** Definir `NADF_LOVABLE_REFERENCE_URL` en entorno Cloud Agent apuntando a preview Lovable o build servido de forma persistente.
2. **Fallback documentado.** Si la variable no está disponible, usar `novus-nexus` @ commit específico (p. ej. `746c129`) con build local y documentar en artefactos.
3. **Registrar en cada corrida.** Incluir en `visual-parity-result.json`:
   - `referenceUrl`
   - `referenceCommit`
   - `candidateUrl` y `candidateCommit`
4. **Sincronizar candidato.** Cuando `NO_DEPLOY` impide actualizar CloudFront, usar build local del candidato (`npm run build && npm run preview`) en lugar de URL DEV desactualizada.

## Ejemplo

Corrida novus-intelligence (2026-07-14):
- Referencia: build local `http://127.0.0.1:4173` (novus-nexus @ `746c129`).
- Candidato: CloudFront `d1bfu6klutpp8m.cloudfront.net` — posiblemente desalineado con `main` @ `cdd9f95`.
- Evidencia: `artifacts/informe-paridad-visual.md`, `artifacts/gaps-paridad.json`.

## Proyectos donde se usa

- novus-intelligence

## Referencias

- `project-context.yml` → `visual_parity.reference_url_env: NADF_LOVABLE_REFERENCE_URL`
- ADR-0006

## Metadatos

| Campo | Valor |
|-------|-------|
| IDs reflexión | KB-003, ANTI-003, ANTI-004 |
| Workflow origen | novus-intelligence-lovable-to-web |
| Reusabilidad | high |
| Fecha | 2026-07-14 |
