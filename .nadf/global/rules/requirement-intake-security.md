# Reglas de seguridad — Requirement Intake Layer

**Autoridad:** ADR-0007  
**Aplica a:** Fuentes opt-in en `.nadf/projects/*/requirement-sources/`  
**Complementa:** `security-rules.md` (no la debilita)

---

## 1. Validación de firma

- Webhooks **deben** validar firma cuando el proveedor lo soporte.
- Firma inválida → `RawRequirementEvent.processing_status = REJECTED` y evento `RawRequirementRejected`.

## 2. Replay protection

- Rechazar eventos con timestamp fuera de ventana configurada.
- Reutilizar `idempotency_key` / `deduplication_key` registrados → no reprocesar como nuevo.

## 3. Idempotencia

Clave normativa:

```text
provider | external_id | event_type | payload_hash
```

## 4. Rate limiting

- Aplicar `RequirementPolicy.rate_limit`.
- Exceso → `REJECTED` o `QUARANTINED` según política; nunca ejecución.

## 5. Allowlists

- Email: remitentes/dominios allowlist.
- Slack/Teams: canal/comando/reacción/rol autorizado.
- Project: `allowed_projects` en RequirementPolicy.

## 6. Sanitización

- Sanitizar HTML y Markdown antes de persistir en Requirement.
- No ejecutar scripts, macros ni código embebido en adjuntos.

## 7. Attachment quarantine

- Validar tipo, tamaño (`max_attachment_size`) y estado de seguridad.
- Adjuntos no limpios → `security_status: quarantined|rejected`; no procesar contenido ejecutable.

## 8. Secret references

- Solo `CredentialReference` (`secret_manager` + `secret_path`).
- Prohibido valor de secreto en YAML, logs, métricas o artefactos.

## 9. Redacción de PII

- Logs y métricas redactan emails/nombres completos cuando la política lo exige.
- Preferir IDs y referencias.

## 10. Tenant / project isolation

- Una `RequirementSourceInstance` solo opera en su `project_id` / `workspace_id`.
- Validar que la fuente está autorizada para el proyecto.

## 11. Least privilege

- Credenciales de integración con permisos mínimos.
- Agentes no ven secretos crudos; solo el adapter/MCP runtime.

## 12. Audit trail

- Registrar eventos de intake y decisiones de aprobación con `correlation_id`.
- Actor humano obligatorio en `RequirementApproved` salvo `auto_approval` explícito no crítico.

## 13. Payload size limit

- Rechazar payloads sobre el límite de política → `REJECTED` o `QUARANTINED`.

## 14. Timeout y retry

- Timeouts por operación de conector.
- Reintentos con backoff exponencial; poison messages a dead-letter (`QUARANTINED`).

## 15. Dead-letter

- Estado `QUARANTINED` + evento `RequirementQuarantined`.
- Intervención humana para liberar.

## 16. Manual approval for critical ops

- Cambios de código, infraestructura y producción **requieren** aprobación humana.
- `auto_approval: true` nunca habilita deploy productivo ni ejecución de código desde contenido externo.

## 17. Nunca auto-ejecutar

- Contenido de Slack, email, webhook, issue o archivo **no** dispara Execution de código.
- Solo puede llegar a Intent tras `Requirement` aprobado.

## Acciones ante violación

| Violación | Acción |
|-----------|--------|
| Firma inválida | REJECTED |
| Secreto en artefacto | Bloquear + purge |
| Fuente no autorizada | REJECTED |
| Adjunto peligroso | QUARANTINED |
| Intento de auto-deploy | Ignorar + reportar |

## Referencias

- [docs/requirement-security.md](../../../docs/requirement-security.md)
- [security-rules.md](security-rules.md)
- ADR-0007
