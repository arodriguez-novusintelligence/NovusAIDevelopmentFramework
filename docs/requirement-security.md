# Requirement Intake Security

**Autoridad:** ADR-0007  
**Reglas operativas:** `.nadf/global/rules/requirement-intake-security.md`

---

## Controles obligatorios

1. Validación de firma (webhooks)
2. Replay protection
3. Idempotencia
4. Rate limiting
5. Allowlists (email, canales, proyectos)
6. Sanitización HTML/Markdown
7. Attachment quarantine
8. CredentialReference only
9. Redacción PII en logs
10. Tenant/project isolation
11. Least privilege
12. Audit trail (`correlation_id`)
13. Payload size limit
14. Timeout + retry backoff
15. Dead-letter / QUARANTINED
16. Manual approval para código, infra y producción

## Prohibiciones

- Ejecutar código desde Slack, email, webhook o archivo.
- Auto-deploy productivo.
- Guardar payloads sensibles completos en logs.
- Incluir secretos en artefactos.

## Estados de seguridad del evento crudo

`REJECTED` · `QUARANTINED` · `FAILED` tras fallos de autenticación/validación.
