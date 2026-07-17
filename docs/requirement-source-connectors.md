# Requirement Source Connectors

**Autoridad:** ADR-0007  
**Contrato:** `.nadf/global/requirement-sources/connector-contract.yml`

---

## Contrato

Todas las fuentes implementan `RequirementSourceConnector` (YAML normativo; TypeScript solo ilustrativo).

Operaciones: `validateConfiguration`, `testConnection`, `receiveEvent`, y opcionales `poll`, `fetchDetails`, `fetchAttachments`, `acknowledge`, `updateExternalStatus`, `addExternalComment`.

## Modos de ingesta

`WEBHOOK` · `POLLING` · `MANUAL` · `SCHEDULED` · `API_PUSH` · `DATABASE_CDC` · `FILE_UPLOAD` · `EMAIL_INBOUND`

## Catálogo inicial (15)

| ID | MCP recomendado | Fallback |
|----|-----------------|----------|
| manual | — | UI/form |
| jira | jira | REST Jira API |
| slack | slack | Slack Events API |
| microsoft-teams | microsoft-teams | Bot Framework / Graph |
| github-issue | github | GitHub REST |
| gitlab-issue | gitlab | GitLab REST |
| bitbucket | bitbucket | Bitbucket REST |
| email | email | IMAP/Graph Mail |
| generic-webhook | generic-webhook | HTTP listener |
| rest-api | rest-api | NADF Intake HTTP API |
| file-upload | — | upload gateway |
| servicenow | servicenow | Table API |
| enterprise-form | — | form webhook |
| database | database-events | authorized view polling |
| scheduled-event | scheduler | cron runner |

Definiciones: `.nadf/global/requirement-sources/definitions/*.yml`

## Reglas

- Webhooks: validar firma cuando exista.
- Polling: cursor/checkpoint.
- Idempotencia: `provider|external_id|event_type|payload_hash`.
- Retry con backoff; dead-letter → `QUARANTINED`.
- El agente **no** conoce secretos; solo `CredentialReference`.

## UI futura

Listar / crear / probar / habilitar / deshabilitar conectores usando Definition + Instance + Connector contract.
