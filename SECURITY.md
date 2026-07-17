<!-- NADF-GUIDE
Propósito: Documenta SECURITY — NADF.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# SECURITY — NADF

## Principles

- Secrets never in git, artifacts, or logs.
- Use `CredentialReference` (`secret://...`) only.
- Production deploy requires human approval.
- Intake: signature validation, allowlists, quarantine, no auto-execute from payloads.

## Scanning

```bash
python tools/nadf-validator/__main__.py security
```

## Report secrets

Rotate immediately and open an incident if a real credential is found.
