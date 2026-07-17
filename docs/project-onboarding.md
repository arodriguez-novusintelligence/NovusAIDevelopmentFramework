# Onboarding de proyectos

## Crear una instancia

1. Crear `.nadf/projects/<project-id>/project-context.yml`.
2. Declarar repositorios y `allowed_paths`.
3. Elegir adapters en `requirement-sources/`.
4. Copiar `budget-policy.yml` y `agent-selection.yml`.
5. Asignar propietarios RACI y Human Gates.
6. Configurar environments; PROD debe requerir aprobación.
7. Referenciar credenciales, nunca copiar valores.
8. Ejecutar validator, smoke y una corrida documentada.

Los proyectos sample1 y sample2 son referencias seguras. Una instancia de
cliente no copia memoria, artifacts ni URLs de otra organización.

## Criterio de alta

- Validator PASS.
- Scope y repos verificados.
- Budget y kill switch probados.
- QA/Security BLOCKING.
- OIDC configurado para deploy DEV.
- Reporter produce evidencia en `output/`.
