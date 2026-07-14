/**
 * Checker de paridad visual exacta (MVP).
 * Captura screenshots de referencia Lovable vs candidato productivo y compara píxeles.
 *
 * Env:
 *   NADF_LOVABLE_REFERENCE_URL  (requerida)
 *   NADF_DEV_FRONTEND_URL       (default CloudFront DEV)
 *   NADF_VISUAL_PARITY_MAX_DIFF_RATIO (default 0.002)
 *   NADF_VISUAL_PARITY_OUT      (dir artifacts, opcional)
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium, type Browser } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const ROUTES = ["/", "/about", "/services", "/contact"];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

type RouteResult = {
  path: string;
  viewport: string;
  diffRatio: number;
  diffPixels: number;
  totalPixels: number;
  pass: boolean;
  diffImage?: string;
};

function numEnv(name: string, fallback: number): number {
  const v = process.env[name]?.trim();
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

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

async function shot(
  browser: Browser,
  url: string,
  width: number,
  height: number,
): Promise<Buffer> {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
  await page.waitForTimeout(400);
  const buf = await page.screenshot({ fullPage: true, type: "png" });
  await page.close();
  return buf;
}

function alignAndDiff(
  aBuf: Buffer,
  bBuf: Buffer,
): { diffRatio: number; diffPixels: number; totalPixels: number; diffPng: PNG } {
  const imgA = PNG.sync.read(aBuf);
  const imgB = PNG.sync.read(bBuf);
  const width = Math.min(imgA.width, imgB.width);
  const height = Math.min(imgA.height, imgB.height);
  const crop = (img: PNG) => {
    const out = new PNG({ width, height });
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const si = (y * img.width + x) << 2;
        const di = (y * width + x) << 2;
        out.data[di] = img.data[si];
        out.data[di + 1] = img.data[si + 1];
        out.data[di + 2] = img.data[si + 2];
        out.data[di + 3] = img.data[si + 3];
      }
    }
    return out;
  };
  const A = crop(imgA);
  const B = crop(imgB);
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(A.data, B.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
  });
  const totalPixels = width * height;
  return {
    diffPixels,
    totalPixels,
    diffRatio: totalPixels ? diffPixels / totalPixels : 1,
    diffPng: diff,
  };
}

async function main(): Promise<void> {
  loadDotEnv();
  const reference =
    process.env.NADF_LOVABLE_REFERENCE_URL?.trim() ||
    process.env.NADF_LOVABLE_PREVIEW_URL?.trim();
  if (!reference) {
    throw new Error(
      "Falta NADF_LOVABLE_REFERENCE_URL (URL preview/build de Lovable/novus-nexus)",
    );
  }
  const candidate =
    process.env.NADF_DEV_FRONTEND_URL?.trim() ||
    "https://d1bfu6klutpp8m.cloudfront.net";
  const threshold = numEnv("NADF_VISUAL_PARITY_MAX_DIFF_RATIO", 0.002);

  const outDir =
    process.env.NADF_VISUAL_PARITY_OUT?.trim() ||
    resolve(process.cwd(), "../../.nadf/projects/novus-intelligence/artifacts");
  const shotDir = join(outDir, "visual-parity-shots");
  mkdirSync(shotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const routes: RouteResult[] = [];

  try {
    for (const vp of VIEWPORTS) {
      for (const path of ROUTES) {
        const refUrl = new URL(path, reference).toString();
        const candUrl = new URL(path, candidate).toString();
        const label = `${vp.name}${path === "/" ? "-home" : path.replace(/\//g, "-")}`;
        console.log(`[visual-parity] ${label} …`);

        const refBuf = await shot(browser, refUrl, vp.width, vp.height);
        const candBuf = await shot(browser, candUrl, vp.width, vp.height);
        writeFileSync(join(shotDir, `${label}-reference.png`), refBuf);
        writeFileSync(join(shotDir, `${label}-candidate.png`), candBuf);

        const { diffRatio, diffPixels, totalPixels, diffPng } = alignAndDiff(
          refBuf,
          candBuf,
        );
        const diffPath = join(shotDir, `${label}-diff.png`);
        writeFileSync(diffPath, PNG.sync.write(diffPng));

        const pass = diffRatio <= threshold;
        routes.push({
          path,
          viewport: `${vp.width}x${vp.height}`,
          diffRatio: Number(diffRatio.toFixed(6)),
          diffPixels,
          totalPixels,
          pass,
          diffImage: diffPath,
        });
        console.log(
          `[visual-parity] ${label} diffRatio=${diffRatio.toFixed(6)} pass=${pass}`,
        );
      }
    }
  } finally {
    await browser.close();
  }

  const status = routes.every((r) => r.pass) ? "PASS" : "FAIL";
  const result = {
    status,
    gate: "visual_exact_parity",
    thresholdMaxDiffRatio: threshold,
    referenceUrl: reference,
    candidateUrl: candidate,
    routes,
    summary:
      status === "PASS"
        ? "Paridad visual exacta verificada en todas las rutas/viewports"
        : "Paridad visual FAIL — remediación frontend requerida",
    remediationRequired: status !== "PASS",
    generatedAt: new Date().toISOString(),
  };

  const resultPath = join(outDir, "visual-parity-result.json");
  writeFileSync(resultPath, JSON.stringify(result, null, 2), "utf8");

  const gaps = routes
    .filter((r) => !r.pass)
    .map((r, i) => ({
      id: `VP-${i + 1}`,
      priority: r.diffRatio > 0.05 ? "P0" : "P1",
      path: r.path,
      viewport: r.viewport,
      diffRatio: r.diffRatio,
      action:
        "Ajustar código productivo (layout/tipografía/color/espaciado) hasta igualar referencia Lovable sin copiar código",
    }));
  writeFileSync(
    join(outDir, "gaps-paridad.json"),
    JSON.stringify({ status, gaps }, null, 2),
    "utf8",
  );

  const md = [
    `# Informe de paridad visual`,
    ``,
    `- **Status:** ${status}`,
    `- **Gate:** visual_exact_parity`,
    `- **Umbral maxDiffRatio:** ${threshold}`,
    `- **Referencia:** ${reference}`,
    `- **Candidato:** ${candidate}`,
    ``,
    `## Rutas`,
    ``,
    `| Ruta | Viewport | Diff ratio | Pass |`,
    `|---|---|---|---|`,
    ...routes.map(
      (r) =>
        `| ${r.path} | ${r.viewport} | ${r.diffRatio} | ${r.pass ? "yes" : "NO"} |`,
    ),
    ``,
    status === "FAIL"
      ? `## Remediación\nRe-ejecutar frontend-integration-agent con gaps-paridad.json hasta PASS.`
      : `## OK\nListo para merge + deploy DEV.`,
    ``,
  ].join("\n");
  writeFileSync(join(outDir, "informe-paridad-visual.md"), md, "utf8");

  console.log(JSON.stringify({ event: "visual_parity_done", status, resultPath }));
  if (status !== "PASS") process.exit(4);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
