/* NADF-GUIDE
 * Propósito: Construye el prompt normativo DoEvents a partir del issue + routing.
 * Configuración: Usado por el workflow; escribe agent-prompt.txt.
 */
import { readFileSync, writeFileSync } from "node:fs";

type Route = {
  profile?: string;
  target?: string;
  workBranch?: string;
  isolation?: string;
  rationale?: string[];
  issue?: { number?: number; title?: string; url?: string | null };
};

const routePath = process.argv[2] || "route-decision.json";
const issuePath = process.argv[3] || "issue.json";
const outPath = process.argv[4] || "agent-prompt.txt";

const route = JSON.parse(readFileSync(routePath, "utf8")) as Route;
const issue = JSON.parse(readFileSync(issuePath, "utf8")) as {
  number: number;
  title: string;
  body?: string;
};

const prompt = `Eres un agente NADF para DoEvents (DEV only).

## Issue #${issue.number}
Título: ${issue.title}
URL: ${route.issue?.url || "(n/a)"}

## Cuerpo del issue
${issue.body || "(sin cuerpo)"}

## Complexity Routing
- profile: ${route.profile}
- target: ${route.target}
- workBranch: ${route.workBranch || "feature/NovusAIDevelopmentFramework"}
- rationale: ${(route.rationale || []).join("; ")}

## REGLAS OBLIGATORIAS (aislamiento)
1. Implementa ÚNICAMENTE lo pedido en este issue.
2. NO elimines, renombres masivamente ni desactives otras funcionalidades.
3. NO hagas refactors amplios ni “limpiezas” no solicitadas.
4. NO despliegues a producción; solo deja código listo para DEV.
5. Trabaja sobre la rama \`${route.workBranch || "feature/NovusAIDevelopmentFramework"}\` (crea commits/PR hacia esa base).
6. Si el target es web: cambia solo DoEventsWEB (microfrontends shell/mfe según aplique).
7. Si el target es back: cambia solo las lambdas/servicios estrictamente necesarios en DoEventsBack.
8. Si detectas que el cambio requiere otra capa no prevista, DOCUMÉNTALO y no inventes alcance.
9. Añade o actualiza tests mínimos si el repo ya tiene patrones de test para esa zona.
10. Resume al final: archivos tocados, cómo probar en DEV, riesgos residuales.

## Entorno
- AWS DEV / sa-east-1 cuando aplique
- PROD prohibido

Al terminar, deja el código compilable (build) en el repo afectado.
`;

writeFileSync(outPath, prompt, "utf8");
console.log(`Wrote ${outPath}`);
