# Sample 1 — GitHub Issues

1. Crear un issue con label `sample1`.
2. Usar la plantilla `issue-seed.md`.
3. El adapter genera un Requirement, pero **nunca autoejecuta** el body.
4. Product Owner aprueba con label `nadf:approved`.
5. NADF modifica únicamente `examples/sample1-app/`.
6. QA y Security deben pasar antes del merge.
7. CI despliega a AWS DEV mediante OIDC.

`sample-run.json` es una corrida simulada reproducible para validar reporter y
estructura sin secretos ni costes.
