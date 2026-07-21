/* NADF-GUIDE
 * Propósito: Modelo de execution-report NADF (JSON + markdown para issue/consola).
 * Configuración: Generado por report-doevents-execution; consumido por Actions y Control Plane.
 */
import {
  ERROR_FIX_HINTS,
  type NadfErrorCode,
} from "./error-codes.js";

export type StepStatus = "PASS" | "FAIL" | "SKIP" | "WARN";

export interface ExecutionStep {
  id: string;
  label: string;
  status: StepStatus;
  code?: NadfErrorCode;
  detail?: string;
}

export interface ExecutionReport {
  schemaVersion: "1.0";
  projectId: string;
  issueNumber: string;
  runUrl?: string;
  overall: "PASS" | "FAIL";
  primaryCode: NadfErrorCode;
  why: string;
  fixHint: string;
  steps: ExecutionStep[];
  postconditions: {
    agentPass: boolean;
    prOpened: boolean;
    merged: boolean;
    deployed: boolean;
    gatesPass: boolean;
  };
  agent?: {
    status: string;
    results: Array<Record<string, unknown>>;
  };
  generatedAt: string;
}

export function firstFailCode(steps: ExecutionStep[]): NadfErrorCode {
  const fail = steps.find((s) => s.status === "FAIL" && s.code);
  return fail?.code ?? "OK";
}

export function buildExecutionReport(input: {
  projectId?: string;
  issueNumber: string;
  runUrl?: string;
  steps: ExecutionStep[];
  agent?: ExecutionReport["agent"];
  postconditions: ExecutionReport["postconditions"];
}): ExecutionReport {
  const failed = input.steps.filter((s) => s.status === "FAIL");
  const primaryCode = firstFailCode(input.steps);
  const overall: "PASS" | "FAIL" = failed.length ? "FAIL" : "PASS";
  const why =
    failed.length === 0
      ? "Pipeline NADF completado sin fallos tipados."
      : failed
          .map((s) => `${s.id}: ${s.code ?? "FAIL"} — ${s.detail ?? s.label}`)
          .join(" | ");
  const code =
    overall === "PASS"
      ? "OK"
      : primaryCode === "OK"
        ? "POSTCONDITION_NOT_MET"
        : primaryCode;

  return {
    schemaVersion: "1.0",
    projectId: input.projectId ?? "doevents",
    issueNumber: input.issueNumber,
    runUrl: input.runUrl,
    overall,
    primaryCode: code,
    why,
    fixHint: ERROR_FIX_HINTS[code],
    steps: input.steps,
    postconditions: input.postconditions,
    agent: input.agent,
    generatedAt: new Date().toISOString(),
  };
}

export function renderExecutionReportMarkdown(report: ExecutionReport): string {
  const icon = (s: StepStatus) =>
    s === "PASS" ? "✅" : s === "FAIL" ? "❌" : s === "WARN" ? "⚠️" : "➖";

  const rows = report.steps
    .map(
      (s) =>
        `| ${icon(s.status)} \`${s.id}\` | ${s.label} | \`${s.code ?? s.status}\` | ${s.detail ?? "—"} |`,
    )
    .join("\n");

  return [
    `## NADF ejecución \`${report.overall}\``,
    "",
    report.runUrl ? `- Action: ${report.runUrl}` : null,
    `- Código: **\`${report.primaryCode}\`**`,
    `- Por qué: ${report.why}`,
    `- Cómo corregir: ${report.fixHint}`,
    "",
    "### Pasos",
    "",
    "| | Paso | Código | Detalle |",
    "|---|------|--------|---------|",
    rows,
    "",
    "### Postcondiciones",
    "",
    `- Agente: \`${report.postconditions.agentPass}\``,
    `- PR abierto: \`${report.postconditions.prOpened}\``,
    `- Merge DEV: \`${report.postconditions.merged}\``,
    `- Deploy DEV: \`${report.postconditions.deployed}\``,
    `- Gates: \`${report.postconditions.gatesPass}\``,
    "",
    "> **Éxito ≠ merge.** Éxito = postcondiciones + gates PASS. No declarar el issue resuelto si `overall=FAIL`.",
    "",
    "```json",
    `NADF_RUN_REPORT=${JSON.stringify({
      overall: report.overall,
      primaryCode: report.primaryCode,
      why: report.why,
      fixHint: report.fixHint,
    })}`,
    "```",
  ]
    .filter((line) => line !== null)
    .join("\n");
}
