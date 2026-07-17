<!-- NADF-GUIDE
Propósito: Documenta Security Audit — Stabilization RC.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Security Audit — Stabilization RC

**Fecha:** 2026-07-15  
**Alcance:** Secretos, credenciales, superficies Intake

## Hallazgos

| ID | Severidad | Hallazgo | Acción |
|----|-----------|----------|--------|
| SEC-S-001 | High (local) | `prototypes/m6-cloud-agent/.env` con CURSOR_API_KEY en disco | Confirmar gitignore; secret scan en CI; no empaquetar en release |
| SEC-S-002 | Info | CredentialReference paths `secret://` en YAML — correcto | Mantener |
| SEC-S-003 | Medium | Sin script genérico de secret scan en tools/ | Crear `tools/nadf-validator/secret_scan.py` |
| SEC-S-004 | Info | Policies Intake: human approval default true | Mantener |
| SEC-S-005 | Info | Auto-deploy prod prohibido en project-context | Mantener |

## Controles requeridos para RC

- [ ] `.gitignore` cubre `.env`, `node_modules`, `dist`, `__pycache__`
- [ ] Secret scan pass en validador
- [ ] No API keys en artifacts/
- [ ] Production deploy requires human approval (documentado)

## Veredicto preliminar

**NO bloquea RC documental** si `.env` no se versiona y el scan pasa.  
**Bloquea distribución binaria** si se incluye `.env` en tarball.
