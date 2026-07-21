/* NADF-GUIDE
 * Propósito: Consolida pasos del workflow en execution-report.json + markdown de issue.
 * Configuración: Env NADF_*_STATUS / archivos agent-result.json + agent-verify.json.
 */
import { readFile, writeFile } from "node:fs/promises";
import {
  buildExecutionReport,
  renderExecutionReportMarkdown,
  type ExecutionStep,
  type StepStatus,
} from "./doevents/execution-report.js";
import type { NadfErrorCode } from "./doevents/error-codes.js";

function envStatus(name: string, fallback: StepStatus = "SKIP"): StepStatus {
  const v = (process.env[name] || "").trim().toUpperCase();
  if (v === "PASS" || v === "SUCCESS" || v === "TRUE") return "PASS";
  if (v === "FAIL" || v === "FAILURE" || v === "FALSE") return "FAIL";
  if (v === "WARN" || v === "WARNING") return "WARN";
  if (v === "SKIP" || v === "SKIPPED" || v === "") return fallback;
  return fallback;
}

function envCode(name: string): NadfErrorCode | undefined {
  const v = (process.env[name] || "").trim() as NadfErrorCode;
  return v || undefined;
}

async function readJsonSafe(path: string): Promise<Record<string, unknown> | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const issueNumber = process.env.NADF_ISSUE_NUMBER?.trim() || "0";
  const runUrl = process.env.NADF_RUN_URL?.trim();
  const reportPath =
    process.env.NADF_EXECUTION_REPORT_FILE?.trim() || "execution-report.json";
  const mdPath =
    process.env.NADF_EXECUTION_COMMENT_FILE?.trim() || "execution-comment.md";

  const agent = await readJsonSafe(
    process.env.NADF_AGENT_RESULT_FILE?.trim() || "agent-result.json",
  );
  const verify = await readJsonSafe(
    process.env.NADF_AGENT_VERIFY_FILE?.trim() || "agent-verify.json",
  );

  const steps: ExecutionStep[] = [];

  const agentStepStatus: StepStatus =
    verify?.status === "FAIL"
      ? "FAIL"
      : agent?.status === "FAILED"
        ? "FAIL"
        : agent
          ? "PASS"
          : envStatus("NADF_STEP_AGENT", "SKIP");

  steps.push({
    id: "agent",
    label: "Cloud Agent",
    status: agentStepStatus,
    code:
      (verify?.code as NadfErrorCode | undefined) ||
      (agentStepStatus === "FAIL" ? "AGENT_RUN_ERROR" : "OK"),
    detail: (verify?.why as string) || undefined,
  });

  steps.push({
    id: "pr",
    label: "PR abierto / verificable",
    status:
      verify?.prOpened === true
        ? "PASS"
        : verify?.status === "FAIL"
          ? "FAIL"
          : envStatus("NADF_STEP_PR", "SKIP"),
    code: (verify?.code as NadfErrorCode | undefined) || envCode("NADF_STEP_PR_CODE"),
    detail: verify?.prOpened === true ? "PR(s) encontrados para el issue" : (verify?.why as string),
  });

  steps.push({
    id: "merge",
    label: "Auto-merge → rama DEV",
    status: envStatus("NADF_STEP_MERGE"),
    code: envCode("NADF_STEP_MERGE_CODE"),
    detail: process.env.NADF_STEP_MERGE_DETAIL?.trim(),
  });

  steps.push({
    id: "build",
    label: "Build WEB (qa + devaws)",
    status: envStatus("NADF_STEP_BUILD"),
    code: envCode("NADF_STEP_BUILD_CODE"),
    detail: process.env.NADF_STEP_BUILD_DETAIL?.trim(),
  });

  steps.push({
    id: "deploy",
    label: "Deploy WEB DEV",
    status: envStatus("NADF_STEP_DEPLOY"),
    code: envCode("NADF_STEP_DEPLOY_CODE"),
    detail: process.env.NADF_STEP_DEPLOY_DETAIL?.trim(),
  });

  steps.push({
    id: "gates",
    label: "Gate Descubre (wiring + smoke)",
    status: envStatus("NADF_STEP_GATES"),
    code: envCode("NADF_STEP_GATES_CODE"),
    detail: process.env.NADF_STEP_GATES_DETAIL?.trim(),
  });

  const report = buildExecutionReport({
    issueNumber,
    runUrl,
    steps,
    agent: agent
      ? {
          status: String(agent.status || ""),
          results: (agent.results as Array<Record<string, unknown>>) || [],
        }
      : undefined,
    postconditions: {
      agentPass: agentStepStatus === "PASS" || agentStepStatus === "SKIP",
      prOpened: verify?.prOpened === true,
      merged: envStatus("NADF_STEP_MERGE", "SKIP") === "PASS",
      deployed: envStatus("NADF_STEP_DEPLOY", "SKIP") === "PASS",
      gatesPass: envStatus("NADF_STEP_GATES", "SKIP") === "PASS",
    },
  });

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const md = renderExecutionReportMarkdown(report);
  await writeFile(mdPath, `${md}\n`, "utf8");

  console.log(`NADF_RUN_REPORT=${JSON.stringify({
    overall: report.overall,
    primaryCode: report.primaryCode,
    why: report.why,
    fixHint: report.fixHint,
  })}`);
  console.log(md);

  if (report.overall === "FAIL") {
    console.error(`::error::${report.primaryCode}: ${report.why}`);
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error("[nadf:doevents] report execution:", err);
  process.exit(1);
});
