# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `e2aa094`  
**Fecha:** 2026-07-16  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers críticos — repositorio accesible y analizado

---

## Resumen de riesgos

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-001 | Modo demo en formulario de contacto | **Alta** | Alta | No replicar fallback demo; exigir API real |
| R-002 | Copia directa de código Lovable | **Alta** | Media | Quality gate no_lovable_code_copy |
| R-003 | Incompatibilidad routing TanStack → React Router | **Alta** | Alta | Extender port-map.yml con /auth y /register-company |
| R-004 | Complejidad MultiAgentDemo | **Media** | Media | Componente aislado; prefers-reduced-motion |
| R-005 | Design tokens oklch no portados | **Media** | Media | Traducir a tokens del design system WEB |
| R-006 | Contenido Lovable vs memoria de marca | **Media** | Baja | Validar en planificación |
| R-007 | Logo JPEG vs SVG | **Baja** | Alta | Usar asset actual; planificar SVG |
| R-008 | Sin captcha en formularios | **Media** | Alta | Captcha en contacto, signup y registro |
| R-009 | Datos de contacto públicos en código | **Baja** | Alta | No son secrets; OK |
| R-011 | **Supabase en Lovable vs AWS en producción** | **Alta** | **Alta** | ADR + traducción Cognito/Lambda; prohibir imports supabase |
| R-012 | **Secretos Supabase en .env Lovable** | **Alta** | Alta | No copiar .env; usar SSM/Secrets Manager en AWS |
| R-013 | **Expansión de alcance: portal empresas** | **Alta** | Alta | Validar con stakeholder; fuera de initial_scope |
| R-014 | **Auth débil (password ≥6 chars)** | **Media** | Alta | Política Cognito más estricta en producción |
| R-015 | **Complejidad NovusDevFrameworkDemo** | **Media** | Media | Lazy-load; reduced-motion; componente aislado |
| R-016 | **port-map.yml incompleto** | **Media** | Alta | Añadir rutas auth y register-company |

---

## R-011: Supabase en Lovable vs AWS en producción

**Descripción:** El commit `e2aa094` integra `@supabase/supabase-js` con auth, RLS y tabla `companies`. Las reglas de empalme (`port-map.yml`, `port-lovable-to-aws.md`) prohíben Supabase en producción.

**Impacto:** Copiar la integración tal cual contaminaría el stack productivo y violaría gobernanza NADF.

**Mitigación:**
- Traducir intención a Cognito (auth) + Lambda (companies CRUD) + DynamoDB/RDS.
- Generar ADR para decisión auth/storage.
- backend-impact-agent especifica contratos OpenAPI nuevos.
- Reviewer valida ausencia de imports `@supabase/*` en WEB/BACK.

**Responsable downstream:** architect-agent, backend-impact-agent, backend-agent

---

## R-012: Secretos Supabase en .env Lovable

**Descripción:** El commit añade variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env` del prototipo Lovable.

**Impacto:** Riesgo de filtración si se copian al repo productivo o a artefactos versionados.

**Mitigación:**
- **Nunca** commitear secretos en NovusIntelligenceWEB/Back.
- Usar AWS SSM Parameter Store o Secrets Manager.
- Security-agent valida en fase de validación.
- Este análisis no documenta valores de claves.

**Responsable downstream:** cloud-agent, security-agent, devops-agent

---

## R-013: Expansión de alcance — portal empresas

**Descripción:** `project-context.yml` define `initial_scope` sin portal de registro empresas ni autenticación. Lovable añade `/auth`, `/register-company` y nav dedicado.

**Impacto:** Esfuerzo no planificado; retraso en MVP si se incluye sin aprobación; posible desalineación con expectativas de producto.

**Mitigación:**
- Planner-agent marca como épica opcional o fase 2.
- Architect-agent evalúa en Plan Review si entra en alcance actual.
- Stakeholder aprueba expansión antes de ejecución.

**Responsable downstream:** planner-agent, architect-agent

---

## R-014: Política de contraseña débil

**Descripción:** Lovable valida mínimo 6 caracteres en signup. No hay confirmación de contraseña ni requisitos de complejidad.

**Impacto:** Cuentas vulnerables en portal empresas productivo.

**Mitigación:**
- Cognito User Pool con política ≥8 caracteres, mayúsculas, números.
- Frontend productivo con validación alineada.
- Considerar MFA para cuentas empresariales.

**Responsable downstream:** backend-agent, security-agent

---

## R-015: Complejidad NovusDevFrameworkDemo

**Descripción:** Nuevo componente (~467 líneas) con Dialog, 4 columnas, 9 pasos animados, múltiples iconos y estado de simulación.

**Impacto:** Esfuerzo de traducción alto; posibles problemas de accesibilidad y rendimiento.

**Mitigación:**
- Lazy-load en landing.
- `prefers-reduced-motion`.
- Simplificar animaciones preservando intención educativa.

**Responsable downstream:** frontend-integration-agent, qa-agent

---

## R-016: port-map.yml incompleto

**Descripción:** El mapeo de rutas no incluye `/auth` ni `/register-company`. Tampoco hay equivalencia para `src/integrations/supabase/` (correctamente en forbidden).

**Impacto:** Planner y frontend-integration pueden omitir rutas nuevas o mapearlas incorrectamente.

**Mitigación:**
- Extender port-map en planificación.
- Documentar rutas sugeridas: `/auth`, `/register-company` (o equivalentes en español).

**Responsable downstream:** planner-agent, workflow-agent

---

## Riesgos previos (mantienen vigencia)

Los riesgos R-001 a R-009 del análisis `2026-07-14` siguen aplicando sin cambios en severidad. Destacados:

- **R-001:** Modo demo en contacto — no replicar en producción.
- **R-002:** Prohibición de copia directa de código Lovable.
- **R-003:** Traducción routing TanStack → React Router (ahora +2 rutas).
- **R-008:** Captcha pendiente — aplica también a signup/registro.

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible en `/agent/repos/novus-nexus`, branch `main`, commit `e2aa094`.

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Cambios clasificados (visual, functional, content, structural)
- [x] Delta e2aa094 analizado (portal empresas + Supabase)
- [x] Supabase marcado como prototipo-only; traducción AWS documentada
- [x] Expansión de alcance identificada (portal empresas)
- [x] Secretos .env documentados como riesgo sin exponer valores
- [x] Backend requirement ampliado (contact + auth + companies)
- [x] port-map gap documentado

---

## Próximo agente

**planner-agent** debe incorporar mitigaciones R-011, R-013 y R-016 como tareas explícitas, y decidir si el portal empresas entra en el plan actual o fase posterior.
