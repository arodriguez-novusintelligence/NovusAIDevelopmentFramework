# Riesgos — Análisis Lovable (paso-01)

**Proyecto:** novus-intelligence  
**Fuente:** novus-nexus @ `974dc61` (delta último commit)  
**Fecha:** 2026-07-17  
**Agente:** lovable-analyzer-agent  
**Estado:** Sin blockers — repositorio accesible y delta analizado

---

## Resumen de riesgos (delta `974dc61`)

| ID | Riesgo | Severidad | Probabilidad | Mitigación |
|----|--------|-----------|--------------|------------|
| R-D001 | Discrepancia mode=visual-fast vs delta structural CI | **Media** | Alta | Validar SHA y contenido real antes de ejecutar ruta visual-fast |
| R-D002 | Pipeline apunta a rama feature del framework | **Media** | Media | Confirmar que `feature/novus-intelligence` es el target correcto y estable |
| R-D003 | Cambios funcionales previos no incluidos en delta | **Alta** | Alta | Si se esperaba sync de registro empresas (`e2aa094`), re-analizar con SHA adecuado |
| R-D004 | auto_merge + auto_deploy_dev sin cambios UI | **Baja** | Media | Gates de paridad visual y build deben bloquear deploy vacío o redundante |

---

## R-D001: Discrepancia mode vs contenido del commit

**Descripción:** El commit `974dc61` declara `mode=visual-fast` en el dispatch CI, pero su delta real es exclusivamente un cambio **structural** en `.github/workflows/notify-nadf.yml`. No hay cambios visuales, de contenido ni funcionales de sitio.

**Impacto:** El pipeline NADF podría ejecutar ruta acelerada visual sin cambios UI que traducir, generando ruido operativo o falsa sensación de sincronización completada.

**Mitigación:**
- Planner-agent verifica `source_sha` y contenido del diff antes de planificar tareas frontend.
- Si no hay delta UI, considerar skip o análisis del commit funcional previo.
- Clasificar `summary.route` como **full** (presencia de cambio structural).

**Responsable downstream:** planner-agent, workflow-agent

---

## R-D002: Target branch feature/novus-intelligence

**Descripción:** El workflow dispatch usa `--ref feature/novus-intelligence` en NovusAIDevelopmentFramework, no `main`.

**Impacto:** Sincronizaciones dependen de una rama de feature activa; cambios en main del framework no se usarían automáticamente.

**Mitigación:**
- Confirmar que la rama existe y contiene el workflow "Lovable sync DEV" actualizado.
- Documentar en plan si se debe migrar a main tras estabilización.

**Responsable downstream:** workflow-agent, devops-agent

---

## R-D003: Cambios funcionales previos fuera del delta

**Descripción:** El commit padre `e2aa094` ("Añadió registro empresas") introduce `/register-company`, `/auth`, integración Supabase completa y migración SQL — cambios **functional/structural** con backend requerido. Este delta no los incluye.

**Impacto:** Si el equipo esperaba sincronizar registro de empresas, el análisis del último commit no cubre esa funcionalidad. Riesgo de desfase entre Lovable y producción.

**Mitigación:**
- Ejecutar análisis dedicado sobre SHA `e2aa094` o posterior con cambios UI si aplica.
- Usar ruta **full** para commits con Supabase/auth/registro.
- No asumir que `visual-fast` cubre registro empresas.

**Responsable downstream:** planner-agent, backend-impact-agent

---

## R-D004: Auto merge/deploy sin delta UI

**Descripción:** El CI pasa `auto_merge=true` y `auto_deploy_dev=true` aunque este commit no modifica el sitio.

**Impacto:** Posible deploy redundante o ejecución de pipeline completo sin cambios productivos derivados de Lovable.

**Mitigación:**
- Quality gates (build, paridad visual) deben detectar ausencia de cambios.
- Planner puede recomendar no-op si no hay tareas derivadas.

**Responsable downstream:** workflow-agent, qa-agent

---

## Riesgos históricos (referencia, no delta actual)

Los siguientes riesgos permanecen válidos para el sitio Lovable en general pero **no fueron reintroducidos** por el commit `974dc61`:

| ID histórico | Riesgo | Estado |
|--------------|--------|--------|
| R-001 | Modo demo en formulario contacto | Vigente en codebase Lovable (commit anterior) |
| R-002 | Copia directa código Lovable | Vigente como policy |
| R-008 | Sin captcha en contacto | Vigente como gap |

Ver análisis previo para detalle completo.

---

## Blockers

**Ninguno.** El repositorio `novus-nexus` está accesible en `/agent/repos/novus-nexus`, branch `main`, commit `974dc61`.

---

## Checklist pre-planificación

- [x] Repositorio Lovable accesible
- [x] Delta del último commit analizado (no reclasificación completa)
- [x] Cambios clasificados: structural (CI)
- [x] `summary.route` = full (contiene structural)
- [x] `summary.latestDelta.backendRequired` = false
- [x] Discrepancia visual-fast documentada

---

## Próximo agente

**planner-agent** debe decidir si continuar el workflow con delta vacío de UI o re-analizar commit funcional previo (`e2aa094`) con ruta `full`.
