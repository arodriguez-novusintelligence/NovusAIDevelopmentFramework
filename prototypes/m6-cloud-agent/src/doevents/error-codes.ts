/* NADF-GUIDE
 * Propósito: Taxonomía estable de errores NADF DoEvents (multi-app reutilizable).
 * Configuración: Usar estos códigos en execution-report, comentarios de issue y ::error::.
 */

export const NADF_ERROR_CODES = [
  "OK",
  "AGENT_STARTUP_ERROR",
  "AGENT_RUN_ERROR",
  "REPO_PUSH_DENIED",
  "PR_NOT_CREATED",
  "SCOPE_VIOLATION",
  "UI_INVARIANT_BREAK",
  "PR_MERGE_FAILED",
  "BUILD_FAILED",
  "BUILD_ENV_MISMATCH",
  "DEPLOY_OIDC_FAILED",
  "DEPLOY_FAILED",
  "DEPLOY_SKIPPED",
  "SMOKE_FAILED",
  "GATE_WIRING_FAILED",
  "POSTCONDITION_NOT_MET",
] as const;

export type NadfErrorCode = (typeof NADF_ERROR_CODES)[number];

export const ERROR_FIX_HINTS: Record<NadfErrorCode, string> = {
  OK: "Sin acción.",
  AGENT_STARTUP_ERROR:
    "Revisar CURSOR_API_KEY / cuota_CODING_RUNTIME y reintentar el workflow.",
  AGENT_RUN_ERROR:
    "Abrir el run del Cloud Agent (runId) y revisar el resumen; reintentar o acotar el issue.",
  REPO_PUSH_DENIED:
    "Dar write al bot/PAT en el repo target, o aplicar el parche NADF manualmente desde Back/patches.",
  PR_NOT_CREATED:
    "Verificar que el agente pudo pushear y abrir PR; si no hay cambios, documentar no-op y saltar merge.",
  SCOPE_VIOLATION:
    "El PR toca entidades FORBIDDEN; reducir el diff o corregir el domain scope del issue.",
  UI_INVARIANT_BREAK:
    "El PR rompe cableado/secciones de Descubre; revertir o restaurar fetchNearbyVenues/Services.",
  PR_MERGE_FAILED:
    "Resolver conflictos o checks bloqueantes en el PR y re-lanzar con skip_deploy según necesidad.",
  BUILD_FAILED: "Reproducir npm run build:qa / build:devaws localmente y corregir errores de TypeScript/Vite.",
  BUILD_ENV_MISMATCH:
    "Asegurar mode=devaws → VITE_DOEVENTS_ENV=devaws (api-dev) en vite.config antes del deploy.",
  DEPLOY_OIDC_FAILED:
    "Configurar vars.AWS_ROLE_ARN y trust OIDC del repo; el job debe fallar si auto_deploy=true.",
  DEPLOY_FAILED: "Revisar logs de deploy-dev.sh / S3 / CloudFront y permisos IAM.",
  DEPLOY_SKIPPED:
    "Deploy omitido (skip_deploy o auto_deploy=false). No declarar el issue resuelto en DEV.",
  SMOKE_FAILED:
    "Corregir API/datos o el smoke; no cerrar el issue hasta PASS en marketplace/nearby.",
  GATE_WIRING_FAILED:
    "Restaurar cableado Descubre (scripts/check-discover-wiring.mjs) antes de redeploy.",
  POSTCONDITION_NOT_MET:
    "Éxito requiere PR+merge+deploy+gates. Completar el paso fallido; no marcar OK solo por merge.",
};

export function classifyAgentBlockers(
  blockers: string[],
  summary: string,
): NadfErrorCode {
  const text = `${blockers.join(" ")} ${summary}`.toLowerCase();
  if (
    /push|permisos de push|write access|permission denied|can't push|cannot push|no pudo push/.test(
      text,
    )
  ) {
    return "REPO_PUSH_DENIED";
  }
  if (blockers.includes("cursor_startup_error")) return "AGENT_STARTUP_ERROR";
  if (blockers.includes("cursor_run_error")) return "AGENT_RUN_ERROR";
  if (blockers.some((b) => b.includes("CODING_RUNTIME"))) return "AGENT_STARTUP_ERROR";
  return blockers.length ? "AGENT_RUN_ERROR" : "OK";
}
