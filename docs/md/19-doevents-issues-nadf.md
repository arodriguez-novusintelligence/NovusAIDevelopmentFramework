<!-- NADF-GUIDE
Propósito: Guía DoEvents Issues → NADF → DEV.
Configuración: Ver .nadf/projects/doevents/ y workflows en DoEventsWEB.
-->
# DoEvents — Issues NADF → DEV

## Resumen

Los requerimientos entran por [DoEventsWEB Issues](https://github.com/arodriguez-novusintelligence/DoEventsWEB/issues).
Con label `nadf`, NADF:

1. Clasifica complejidad (Complexity Routing).
2. Elige WEB, Back o ambos.
3. Invoca Cloud Agent **solo** para ese issue (aislamiento).
4. Versiona en `feature/NovusAIDevelopmentFramework`.
5. Valida build y despliega WEB DEV cuando AWS OIDC está configurado.

## Secrets / vars (DoEventsWEB)

| Nombre | Uso |
|--------|-----|
| `CURSOR_API_KEY` | Cloud Agent |
| `GH_PAT` | Checkout cross-repo + comentarios |
| `AWS_ROLE_ARN` (var) | OIDC deploy DEV |
| `CLOUDFRONT_DISTRIBUTION_ID` | Invalidación CloudFront |
| `DOEVENTS_WEB_DEV_BUCKET` | Bucket S3 DEV |

## Proyecto framework

`.nadf/projects/doevents/`
