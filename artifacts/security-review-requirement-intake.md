<!-- NADF-GUIDE
Propósito: Documenta Security Review — Requirement Intake Layer.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Security Review — Requirement Intake Layer

**Fecha:** 2026-07-14  
**Autoridad:** ADR-0007  
**Alcance:** Contratos, políticas, reglas y artefactos de intake (no runtime productivo)

---

## Hallazgos

| ID | Severidad | Hallazgo | Estado |
|----|-----------|----------|--------|
| SEC-RI-01 | Info | Credenciales solo por referencia (`secret://`) | Mitigado en modelo |
| SEC-RI-02 | Info | Regla `never_auto_execute` en conector y security rules | Documentado |
| SEC-RI-03 | Info | Quarantine/REJECTED para firma inválida y adjuntos | Modelado + fixtures |
| SEC-RI-04 | Low | MCP servers Slack/Teams/etc. aún no runtime | Pendiente implementación |
| SEC-RI-05 | Low | Dedup semántica no ejecutable sin store | Contractual only |
| SEC-RI-06 | Info | Fuentes remotas en novus-intelligence disabled | Seguro por defecto |

## Controles verificados

- [x] No hay secretos reales en el repo
- [x] `requirement-intake-security.md` no debilita `security-rules.md`
- [x] Aprobación humana por defecto (`auto_approval: false`)
- [x] Allowlists / authorization gates en Slack y email
- [x] Attachment type allowlist
- [x] Redacción PII en política de proyecto
- [x] Intent no nace sin Requirement aprobado en fixtures 13–14

## Conclusión

**PASS** a nivel de diseño/contratos. Riesgos residuales son de runtime MCP pendiente, no de debilidad del Meta Model.
