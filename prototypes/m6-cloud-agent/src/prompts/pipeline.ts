/**
 * Prompts for remaining pipeline agents (Execution → Validation → Knowledge).
 */
import type { AgentInvocation } from "../types.js";

const ART = (p: string) => `.nadf/projects/${p}/artifacts`;

export function buildPipelinePrompt(inv: AgentInvocation): string {
  const a = ART(inv.projectId);
  const common = `
Eres el agente NADF: ${inv.agentId}.
ANTES DE ACTUAR LEE: CLAUDE.md → docs/meta-model/meta-model-overview.md →
.nadf/projects/${inv.projectId}/project-context.yml → .claude/agents/${inv.agentId}.md

PROYECTO: ${inv.projectId}
WORKFLOW: ${inv.workflowId}
PASO: ${inv.stepId}
RUNTIME: Cursor Cloud Agent (M6)
TARGET_ENV: DEV AWS sa-east-1
PLAN: ${a}/plan-implementacion.md (debe estar approved)
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
      return `${common}
DEBES implementar el sitio productivo en NovusIntelligenceWEB según plan aprobado y
${a}/frontend-impact.md, ${a}/cambios-lovable.json, ${a}/impacto-arquitectonico.md.
Stack: React + TypeScript + Tailwind + Vite + React Router.
Traducir intención Lovable SIN copiar código. Scaffold desde repo vacío si hace falta.
Incluye rutas, layout, landing, about, services, contact UI (API real cuando exista; sin mocks de prod).
MultiAgentDemo como UI animada front-only.
NO desplegar. Escribe ${a}/resumen-frontend.md en el repo FRAMEWORK (checkout/push artifacts allí).
Commit/PR en NovusIntelligenceWEB con la app.
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
