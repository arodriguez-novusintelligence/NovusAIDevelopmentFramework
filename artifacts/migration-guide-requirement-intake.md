# Migration Guide — Requirement Intake Layer (v1.1)

**Desde:** Meta Model v1.0  
**Hasta:** Meta Model v1.1 (ADR-0007)

---

## ¿Debo migrar?

**No es obligatorio.** Si no configuras `requirement-sources/`, nada cambia.

## Pasos para habilitar intake en un proyecto

1. Actualizar conocimiento del equipo: leer ADR-0007 y `docs/requirement-intake-architecture.md`.
2. Crear carpeta:

```text
.nadf/projects/<project>/requirement-sources/
  sources.yml
  mappings/
  policies/
```

3. Referenciar definiciones globales en `.nadf/global/requirement-sources/definitions/`.
4. Crear `CredentialReference` en el secret manager (nunca en git).
5. Ejecutar test de conexión → `source-connection-test.json`.
6. Empezar con `enabled: false`, luego habilitar una fuente.
7. Disparar evento de prueba / manual.
8. Verificar artefactos Blackboard y `TraceabilityLink` al convertir a Intent.
9. Seleccionar workflow downstream (p. ej. `modify-feature`, `lovable-to-web`).

## Compatibilidad Lovable

El flujo `lovable.commit` → `lovable-to-web` **no requiere** Requirement Intake. Puede coexistir.

## Rollback

Eliminar o renombrar `requirement-sources/` y deshabilitar triggers; el proyecto vuelve a semántica v1.0.

## Validación

```bash
python tools/validators/requirement_intake_validator.py
```
