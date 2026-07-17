/* NADF-GUIDE
 * Propósito: Implementa o configura pipeline dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
/**
 * Prompts for remaining pipeline agents (Execution → Validation → Knowledge).
 */
import type { AgentInvocation } from "../types.js";

const ART = (p: string) => `.nadf/projects/${p}/artifacts`;

export function buildPipelinePrompt(inv: AgentInvocation): string {
  const a = ART(inv.projectId);
  const visualFast = inv.constraints.includes("VISUAL_CONTENT_ONLY");
  const common = `
Eres el agente NADF: ${inv.agentId}.
ANTES DE ACTUAR LEE: CLAUDE.md → docs/meta-model/meta-model-overview.md →
.nadf/projects/${inv.projectId}/project-context.yml → .claude/agents/${inv.agentId}.md

PROYECTO: ${inv.projectId}
WORKFLOW: ${inv.workflowId}
PASO: ${inv.stepId}
RUNTIME: Cursor Cloud Agent (M6)
TARGET_ENV: DEV AWS sa-east-1
PROFILE: ${visualFast ? "visual-fast (cambio visual/content simple, sin backend)" : "full"}
PLAN: ${
    visualFast
      ? "fast path auto-aprobado; usar cambios-lovable.json + frontend-impact.md"
      : `${a}/plan-implementacion.md (debe estar approved)`
  }
CONSTRAINTS:
${inv.constraints.map((c) => `- ${c}`).join("\n")}
EXPECTED OUTPUTS:
${inv.expectedOutputs.map((o) => `- ${o}`).join("\n")}
`;

  const footer = `
AL TERMINAR:
\`\`\`nadf-result
status: finished|error|blocked
filesChanged: <lista>
artifactsProduced: <lista>
blockers: <lista o none>
summary: <una frase>
nextAgentSuggested: <id o none>
\`\`\`
`;

  switch (inv.agentId) {
    case "frontend-integration-agent":
      if (visualFast) {
        return `${common}
DEBES aplicar ÚNICAMENTE el delta visual/content del último commit de novus-nexus
en NovusIntelligenceWEB: colores, tipografía, texto/título, spacing o estilos.
Lee ${a}/cambios-lovable.json y ${a}/frontend-impact.md desde el PR fresco del analyzer.

REGLAS ESTRICTAS:
- Reimplementa la intención; NO copies código Lovable.
- No cambies rutas, APIs, formularios, estado, dependencias, backend ni infraestructura.
- Si detectas cambio functional/structural o backend, BLOQUEA y recomienda profile full.
- Stack productivo: React + TypeScript + Tailwind + Vite.
- Ejecuta build/lint si están disponibles.
- Crea PR SOLO en NovusIntelligenceWEB y ${a}/resumen-frontend.md en Framework.
- NO desplegar; el post-pipeline hará merge y Deploy DEV.
${footer}`;
      }
      return `${common}
DEBES implementar el sitio productivo en NovusIntelligenceWEB según plan aprobado y
${a}/frontend-impact.md, ${a}/cambios-lovable.json, ${a}/impacto-arquitectonico.md.
Si existe ${a}/gaps-paridad.json o ${a}/informe-paridad-visual.md, REMEDIA esos gaps primero.

Stack: React + TypeScript + Tailwind + Vite + React Router.
Traducir intención Lovable SIN copiar código (no_lovable_code_copy).
OBLIGATORIO: paridad visual EXACTA con Lovable (layout, tipografía, color, espaciado, hero, CTAs, footer)
en rutas /, /about, /services, /contact y viewports desktop/tablet/móvil.
Inspecciona novus-nexus solo como referencia visual/funcional; reimplementa en código propio.
Incluye formularios con API real (sin mocks de prod).
NO desplegar. Escribe ${a}/resumen-frontend.md en el repo FRAMEWORK.
Commit/PR en NovusIntelligenceWEB.
${footer}`;

    case "visual-parity-agent":
      return `${common}
Eres visual-parity-agent. Lee .claude/agents/visual-parity-agent.md y
.nadf/projects/${inv.projectId}/rules/visual-parity-rules.md.

Compara la intención visual de novus-nexus / referencia Lovable contra el frontend productivo
(y URL DEV si está disponible: ${process.env.NADF_DEV_FRONTEND_URL || "https://d1bfu6klutpp8m.cloudfront.net"}).
Umbral exacto: maxDiffRatio <= 0.002 por captura. Rutas: /, /about, /services, /contact.

DEBES generar:
- ${a}/visual-parity-result.json (status PASS|FAIL, routes[], thresholdMaxDiffRatio)
- ${a}/informe-paridad-visual.md
- ${a}/gaps-paridad.json (lista accionable P0/P1)

PROHIBIDO copiar código Lovable. PROHIBIDO aprobar con diferencias materiales.
Si FAIL → status blocked y nextAgentSuggested: frontend-integration-agent.
${footer}`;

    case "backend-agent":
      return `${common}
DEBES implementar POST /api/v1/contact en NovusIntelligenceBack según
${a}/especificacion-backend.md y ${a}/evaluacion-backend.md.
Stack: Serverless Framework + Node 20 + TypeScript. Región target DEV sa-east-1.
Sin BD. Email vía abstracción SES (config por env, sin secrets en código).
Prohibido modo demo / mock en producción (R-001).
NO desplegar. Actualiza serverless.yml. Escribe ${a}/resumen-backend.md en FRAMEWORK.
PR en NovusIntelligenceBack.
${footer}`;

    case "cloud-agent":
      return `${common}
Eres el cloud-agent NADF (IaC/propuesta), NO confundir con Cursor Cloud runtime.
Genera ${a}/propuesta-infra.md y ${a}/resumen-cloud.md para DEV sa-east-1:
API Gateway/Lambda, SES, buckets frontend si aplica, secrets env names, stack names
según environments/dev.yml (reconciliar región a sa-east-1).
NO desplegar. Solo propuesta IaC / checklist de deploy humano.
${footer}`;

    case "qa-agent":
      if (visualFast) {
        return `${common}
QA LITE para cambio visual/content:
- Revisa SOLO el PR fresco de NovusIntelligenceWEB.
- Verifica que el diff no toca backend, APIs, rutas, package dependencies ni infraestructura.
- Ejecuta npm ci, npm run lint --if-present y npm run build.
- Verifica ausencia de secretos y que el cambio corresponde al delta visual/content.
- Genera ${a}/informe-qa.md y ${a}/qa-result.json con status PASS|FAIL.
- NO modifiques lógica productiva ni NovusIntelligenceBack.
${footer}`;
      }
      return `${common}
Valida calidad del trabajo en repos productivos + artifacts.
Criterios: build/lint si posible, no mocks prod, no secrets, responsive/SEO básico documentado,
alineación al plan approved. Genera ${a}/informe-qa.md y ${a}/qa-result.json
(status pass|fail). NO modificar lógica productiva salvo fixes triviales autorizados.
Incluye Framework + WEB + Back en el análisis.
${footer}`;

    case "security-agent":
      return `${common}
Revisa seguridad: secrets, dependencias, CORS, validación contacto, permisos IAM propuestos.
Genera ${a}/informe-seguridad.md y ${a}/security-result.json (pass|fail).
NO desplegar. NO guardar secretos.
${footer}`;

    case "documentation-agent":
      return `${common}
Documenta la ejecución: ${a}/resumen-ejecucion.md y actualiza memory/decision-log.md
con entrada de esta corrida Lovable→Web. Resume PRs y agents ejecutados.
${footer}`;

    case "metrics-agent":
      return `${common}
Registra métricas en ${a}/metricas-ejecucion.json y ${a}/resumen-metricas.md
según .nadf/global/metrics/metrics-schema.json (workflowId, agents, status, qualityScore estimado).
${footer}`;

    case "reflection-agent":
      return `${common}
Genera ${a}/reflexion-ejecucion.md y ${a}/recomendaciones-kb.json
(qué funcionó, fallos, aprendizajes, patrones para KB). Pattern Reflection.
${footer}`;

    case "knowledge-base-agent":
      return `${common}
A partir de reflexión, actualiza/crea entradas en
.nadf/global/knowledge-base/ (architecture-patterns o common-errors) y
${a}/actualizacion-kb.md. Sin secrets.
${footer}`;

    case "adr-agent":
      return `${common}
Evalúa si hay decisión arquitectónica que requiera ADR nuevo.
Si sí, crea ADR-0006-* en .nadf/global/decision-history/adr/ y ${a}/registro-adr.md.
Si no, documenta "no ADR required" en ${a}/registro-adr.md con justificación.
${footer}`;

    default:
      return `${common}\nEjecuta según .claude/agents/${inv.agentId}.md\n${footer}`;
  }
}
