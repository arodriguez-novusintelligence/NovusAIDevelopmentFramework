<!-- NADF-GUIDE
Propósito: Documenta Implementation Plan — Requirement Intake Layer.
Configuración: Actualizar contenido, enlaces y ejemplos cuando cambien los contratos relacionados.
-->
# Implementation Plan — Requirement Intake Layer

**Fecha:** 2026-07-14  
**Orden normativo (prompt §24)**

---

## Fases

| # | Fase | Entregables |
|---|------|-------------|
| 1 | Inspección | Impact analysis (hecho) |
| 2 | Propuesta MM | meta-model-change-proposal + compatibility |
| 3 | ADR-0007 | Decisión formal |
| 4 | Meta Model v1.1 | requirement-model + updates |
| 5 | Contratos | connector-contract + artifact contracts |
| 6 | Agentes | 7 definiciones + skill registries |
| 7 | Workflow | requirement-intake.yml (9 fases) |
| 8 | Catálogo fuentes | 15 definitions YAML |
| 9 | Proyecto ejemplo | novus-intelligence/requirement-sources/ |
| 10 | Validadores | tools/validators/requirement_intake_validator.py |
| 11 | Fixtures/tests | tests/requirement-intake/ |
| 12 | Docs | architecture, security, connectors, README, CLAUDE |
| 13 | Validación | ejecutar validator + reportes finales |

---

## Mapeo de pasos intake → 9 fases NADF

| Fase NADF | Pasos intake |
|-----------|--------------|
| event_trigger | Trigger, load config, auth/validate, persist raw |
| planning | Normalize, deduplicate, classify, validate completeness |
| plan_review | Human approval / clarification |
| execution | Assemble context, create Intent, select downstream (no código) |
| validation | Validar conversión y trazabilidad |
| documentation | Documentar intake |
| metrics | Métricas |
| reflection | Reflexión |
| knowledge_base_update | Actualizar KB |

---

## Agentes nuevos

1. requirement-intake-agent  
2. requirement-normalization-agent  
3. requirement-classification-agent  
4. requirement-deduplication-agent  
5. requirement-validation-agent  
6. requirement-approval-agent  
7. requirement-traceability-agent  

---

## Criterio de done

Los 26 criterios de aceptación del prompt deben cumplirse a nivel documental/contractual; runtime real de MCP queda como capacidad prevista (MCP First + fallback).
