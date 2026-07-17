/* NADF-GUIDE
 * Propósito: Implementa o configura invoke full pipeline dentro de NADF.
 * Configuración: Revisar valores por entorno y mantener secretos fuera del repositorio.
 */
/**
 * Orquestador MVP: lovable.commit → pipeline completo → visual parity → post DEV.
 *
 * npm run invoke:full-pipeline
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(path = ".env"): void {
  const full = resolve(process.cwd(), path);
  if (!existsSync(full)) return;
  for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function run(script: string): void {
  console.log(`\n[nadf:full] >>> npm run ${script}`);
  const r = spawnSync("npm", ["run", script], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (r.status !== 0) {
    throw new Error(`Step failed: ${script} (exit ${r.status})`);
  }
}

async function main(): Promise<void> {
  loadDotEnv();
  const skipAgents = process.env.NADF_SKIP_AGENTS === "true";
  const skipVisual = process.env.NADF_SKIP_VISUAL_PARITY === "true";
  const skipPost = process.env.NADF_SKIP_POST_PIPELINE === "true";

  if (!skipAgents) {
    run("invoke:lovable-analyzer");
    run("invoke:planner");
    run("invoke:backend-impact");
    run("invoke:architect");
    run("invoke:remaining-pipeline");
  }

  if (!skipVisual) {
    if (!process.env.NADF_LOVABLE_REFERENCE_URL?.trim()) {
      console.warn(
        "[nadf:full] NADF_LOVABLE_REFERENCE_URL no definida — se ejecuta visual-parity-agent vía Cloud; el checker local se omite.",
      );
      run("invoke:visual-parity");
    } else {
      run("visual-parity-check");
      // Si falla el checker local, intentar remediación cloud una vez
      // (el check ya hace exit 4; solo llegamos si PASS o si se desactiva fail)
    }
  }

  if (!skipPost) {
    run("post-pipeline-dev");
  }

  console.log("\n[nadf:full] COMPLETE — automación DEV OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
