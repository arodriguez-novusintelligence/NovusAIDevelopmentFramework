# Aprobaciones y responsabilidades

Este es el **único capítulo normativo** de Human Approval en la documentación
Enterprise. La fuente ejecutable es
`enterprise-governance/human-approval-model.yml`.

## Nueve gates

1. Requirement: Product Owner acepta la necesidad.
2. Scope: Product Owner confirma alcance y repos permitidos.
3. Architecture: Architect aprueba cambios estructurales.
4. Plan: Technical Lead acepta secuencia, riesgos y rollback.
5. Security: Security Owner acepta accesos o datos sensibles.
6. Budget: Budget Owner autoriza excedentes.
7. Merge: Code Owner revisa evidencia y PR.
8. Deploy DEV: Environment Owner aprueba cuando la policy lo exija.
9. Deploy PROD: Change Authority siempre aprueba; nunca es automático.

## MVP de evidencia

- Label GitHub `nadf:approved` o comentario `/nadf approve <gate>`.
- Artifact YAML en
  `.nadf/projects/<project>/artifacts/approvals/<gate>.yml`.
- Un agente puede recomendar, pero **nunca autoaprobarse**.

## Fallo a mitad

Se preservan artifacts completados, se escribe
`execution-failure-report`, no se hace merge parcial inconsistente y el
usuario corrige antes de relanzar.

RACI ejecutable: `enterprise-governance/raci.yml`.
