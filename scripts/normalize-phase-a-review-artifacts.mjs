import fs from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const ROOT_DIR = process.cwd();
const EVIDENCE_ROOT = path.join(ROOT_DIR, "docs", "evidence", "PRD-029", "2026-04-25", "phase-a");
const BASE_URL = process.env.PRD029_BASE_URL || "https://sawa.xapis.com";
const AUTH_URL = process.env.PRD029_AUTH_URL || "https://xapsawa.xapis.com/jwt_auth";
const APP_ID = process.env.PRD029_APP_ID || "mada";
const BRAND_SLUG = process.env.PRD029_BRAND_SLUG || "sensation";
const QA_SLUG = process.env.PRD029_QA_SLUG || "prd029-phasea-qa";
const AUTH_PROVIDER = process.env.PRD029_AUTH_PROVIDER || "password";
const AUTH_TOKEN_PAIR = process.env.PRD029_AUTH_TOKEN_PAIR || "";

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 2200 },
];

const LIVE_LANGUAGES = [
  { code: "en", dir: "ltr" },
  { code: "ar", dir: "rtl" },
];

const REQUIRED_DIRS = [
  "axe",
  "lighthouse",
  "snapshots",
  "states/authed",
  "states/unauthed",
  "states/populated",
  "browser",
  "design-review",
  "qa",
];

const QA_SCENARIOS = [
  { scenario: "merchant-submit", globPrefix: "merchant-submit-" },
  { scenario: "admin-approve", globPrefix: "admin-approve-" },
  { scenario: "admin-publish", globPrefix: "admin-publish-" },
  { scenario: "admin-publish-replay", globPrefix: "admin-publish-replay-" },
];

const routeUrl = (lang) => `${BASE_URL}/brands/${BRAND_SLUG}?lang=${lang}`;

const toAbsolute = (relativePath) => path.join(EVIDENCE_ROOT, relativePath);

const ensureDirs = async () => {
  await Promise.all(REQUIRED_DIRS.map((dir) => fs.mkdir(toAbsolute(dir), { recursive: true })));
};

const readJson = async (relativePath) => JSON.parse(await fs.readFile(toAbsolute(relativePath), "utf8"));

const writeJson = async (relativePath, value) => {
  const targetPath = toAbsolute(relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return targetPath;
};

const writeText = async (relativePath, value) => {
  const targetPath = toAbsolute(relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, value, "utf8");
  return targetPath;
};

const exists = async (absolutePath) => {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
};

const copyRelative = async (sourceRelativePath, targetRelativePath) => {
  const sourcePath = toAbsolute(sourceRelativePath);
  const targetPath = toAbsolute(targetRelativePath);
  if (!(await exists(sourcePath))) {
    throw new Error(`Missing source artifact: ${sourceRelativePath}`);
  }
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
  return { sourceRelativePath, targetRelativePath };
};

const findLatestRemediationRoot = async () => {
  const entries = await fs.readdir(EVIDENCE_ROOT, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("remediation-backend-"))
    .map((entry) => entry.name)
    .sort();

  if (!candidates.length) {
    throw new Error("No remediation-backend-* evidence root found under phase-a.");
  }

  return candidates[candidates.length - 1];
};

const findFirstFile = async (directoryPath, prefix) => {
  const entries = await fs.readdir(directoryPath);
  const match = entries
    .filter((entry) => entry.startsWith(prefix) && entry.endsWith(".json"))
    .sort()[0];

  if (!match) {
    throw new Error(`Unable to find ${prefix}*.json under ${directoryPath}`);
  }

  return match;
};

const setupContext = async (browser, viewport, language, extraHTTPHeaders = undefined) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    locale: language.code === "ar" ? "ar-JO" : "en-US",
    colorScheme: "dark",
    extraHTTPHeaders,
  });

  await context.addInitScript(({ lang, dir }) => {
    localStorage.setItem("isVisit", "true");
    localStorage.setItem("i18nextLng", lang);

    const applyDocumentLanguage = () => {
      if (!document.documentElement) {
        return;
      }
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyDocumentLanguage, { once: true });
    }

    applyDocumentLanguage();
  }, { lang: language.code, dir: language.dir });

  return context;
};

const freezeMotion = async (page) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
  });
};

const stabilizePage = async (page) => {
  await page.waitForLoadState("domcontentloaded", { timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  await page.waitForSelector('[data-brand-market-header="true"], .brand-market__state', { timeout: 45000 });
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 200));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
};

const acquireJwt = async () => {
  if (!AUTH_TOKEN_PAIR) {
    return null;
  }

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: AUTH_PROVIDER,
      appid: APP_ID,
      token: AUTH_TOKEN_PAIR,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`JWT auth failed with HTTP ${response.status}`);
  }

  const token = payload?.jwt?.access_token;
  if (!token) {
    throw new Error("JWT auth response did not contain jwt.access_token");
  }

  return token;
};

const promoteAxeArtifacts = async () => {
  const outputs = [];
  for (const language of LIVE_LANGUAGES) {
    outputs.push(await copyRelative(`a11y/axe-${language.code}.json`, `axe/${BRAND_SLUG}-${language.code}.json`));
  }
  return outputs;
};

const promoteLighthouseArtifacts = async () => {
  const outputs = [];
  for (const language of LIVE_LANGUAGES) {
    const mobileSource = `perf/lighthouse-${language.code}-mobile.json`;
    const desktopSource = `perf/lighthouse-${language.code}-desktop.json`;
    outputs.push(await copyRelative(mobileSource, `lighthouse/${BRAND_SLUG}-${language.code}-mobile.json`));
    outputs.push(await copyRelative(desktopSource, `lighthouse/${BRAND_SLUG}-${language.code}-desktop.json`));
    outputs.push(await copyRelative(mobileSource, `lighthouse/${BRAND_SLUG}-${language.code}-375.json`));
    outputs.push(await copyRelative(desktopSource, `lighthouse/${BRAND_SLUG}-${language.code}-1440.json`));
  }
  return outputs;
};

const promoteSnapshotAndStateArtifacts = async () => {
  const outputs = [];
  for (const language of LIVE_LANGUAGES) {
    for (const viewport of VIEWPORTS) {
      const baselineSource = `visual-diff/${BRAND_SLUG}-${language.code}-${viewport.name}-baseline.png`;
      outputs.push(await copyRelative(baselineSource, `snapshots/${BRAND_SLUG}-${language.code}-${viewport.name}.png`));
      outputs.push(await copyRelative(baselineSource, `states/populated/${BRAND_SLUG}-${language.code}-${viewport.name}.png`));
      outputs.push(await copyRelative(baselineSource, `states/unauthed/${BRAND_SLUG}-${language.code}-${viewport.name}.png`));
    }
  }
  return outputs;
};

const promoteContrastArtifacts = async () => {
  const contrastGrid = await readJson("contrast/contrast-grid.json");
  const outputs = [];

  for (const language of LIVE_LANGUAGES) {
    const filtered = contrastGrid.filter((entry) => entry.lang === language.code);
    await writeJson(`a11y/${BRAND_SLUG}-${language.code}-contrast.json`, {
      brandSlug: BRAND_SLUG,
      lang: language.code,
      generatedFrom: "contrast/contrast-grid.json",
      viewports: filtered,
    });
    outputs.push(`a11y/${BRAND_SLUG}-${language.code}-contrast.json`);
  }

  return outputs;
};

const promoteTokenArtifacts = async () => {
  const tokenSweep = await readJson("tokens/design-token-sweep.json");
  const outputs = [];

  for (const language of LIVE_LANGUAGES) {
    const filtered = tokenSweep.filter((entry) => entry.lang === language.code);
    await writeJson(`design-review/${BRAND_SLUG}-${language.code}-tokens.json`, {
      brandSlug: BRAND_SLUG,
      lang: language.code,
      generatedFrom: "tokens/design-token-sweep.json",
      entries: filtered,
    });
    outputs.push(`design-review/${BRAND_SLUG}-${language.code}-tokens.json`);
  }

  return outputs;
};

const promoteAnatomyArtifacts = async () => {
  const outputs = [];
  for (const language of LIVE_LANGUAGES) {
    const sourceRelativePath = `design-review/anatomy-rendered-${BRAND_SLUG}-${language.code}.json`;
    await copyRelative(sourceRelativePath, `design-review/${BRAND_SLUG}-${language.code}-anatomy.json`);
    outputs.push(`design-review/${BRAND_SLUG}-${language.code}-anatomy.json`);
  }
  return outputs;
};

const promoteI18nArtifacts = async () => {
  const i18nDirectory = toAbsolute("i18n");
  const files = (await fs.readdir(i18nDirectory))
    .filter((entry) => entry.endsWith(".json") && !entry.startsWith(`${BRAND_SLUG}-`))
    .sort();

  const outputs = [];
  for (const fileName of files) {
    const targetName = `${BRAND_SLUG}-${fileName}`;
    await copyRelative(`i18n/${fileName}`, `i18n/${targetName}`);
    outputs.push(`i18n/${targetName}`);
  }
  return outputs;
};

const summarizeQaScenario = (scenario, payload, sourceRelativePath) => {
  const httpStatus = payload?.httpStatus ?? "unknown";
  const body = payload?.body || {};
  const publicationStatus = body?.publicationStatus || body?.status || "unknown";
  const storefrontId = body?.id || "unknown";
  const brandId = body?.brandId || "unknown";

  return [
    `# ${QA_SLUG} — ${scenario}`,
    "",
    `- Source JSON: \`${sourceRelativePath}\``,
    `- HTTP status: ${httpStatus}`,
    `- Storefront id: ${storefrontId}`,
    `- Brand id: ${brandId}`,
    `- Publication status: ${publicationStatus}`,
    "",
    "This markdown summary is derived from the live remediation packet and exists so the reviewer-facing `qa/` tree has stable, scenario-named entry points alongside the raw JSON transcripts.",
    "",
  ].join("\n");
};

const promoteQaArtifacts = async () => {
  const remediationRootName = await findLatestRemediationRoot();
  const remediationQaDirectory = path.join(EVIDENCE_ROOT, remediationRootName, "qa");
  const outputs = [];

  for (const qaScenario of QA_SCENARIOS) {
    const sourceFileName = await findFirstFile(remediationQaDirectory, qaScenario.globPrefix);
    const sourceRelativePath = `${remediationRootName}/qa/${sourceFileName}`;
    const targetJson = `qa/${QA_SLUG}-${qaScenario.scenario}.json`;
    const targetMarkdown = `qa/${QA_SLUG}-${qaScenario.scenario}.md`;
    await copyRelative(sourceRelativePath, targetJson);
    const payload = JSON.parse(await fs.readFile(path.join(remediationQaDirectory, sourceFileName), "utf8"));
    await writeText(targetMarkdown, summarizeQaScenario(qaScenario.scenario, payload, sourceRelativePath));
    outputs.push(targetJson, targetMarkdown);
  }

  for (const identityFile of ["admin-identity.json", "merchant-identity.json", "merchant-admin-loop-summary.json"]) {
    const sourceRelativePath = `${remediationRootName}/qa/${identityFile}`;
    const targetRelativePath = `qa/${QA_SLUG}-${identityFile}`;
    await copyRelative(sourceRelativePath, targetRelativePath);
    outputs.push(targetRelativePath);
  }

  return outputs;
};

const promoteBackendMatrixArtifacts = async () => {
  const remediationRootName = await findLatestRemediationRoot();
  const outputs = [];
  const filesToPromote = [
    "storefront-state-machine.json",
    "admin-with-merchant-token-negative.json",
    "merchant-cross-tenant-negative.json",
    "guest-permission-matrix.json",
    "backend-remediation-manifest.json",
    "deprecated-template-new-draft.json",
  ];

  for (const fileName of filesToPromote) {
    const sourceRelativePath = `${remediationRootName}/api-curls/${fileName}`;
    const targetRelativePath = `api-curls/${fileName}`;
    await copyRelative(sourceRelativePath, targetRelativePath);
    outputs.push(targetRelativePath);
  }

  return outputs;
};

const captureAuthedStateArtifacts = async () => {
  const jwt = await acquireJwt();
  if (!jwt) {
    await writeJson("states/authed/_skipped.json", {
      skipped: true,
      reason: "PRD029_AUTH_TOKEN_PAIR was not supplied, so authenticated state screenshots were not refreshed by the normalizer.",
    });
    return ["states/authed/_skipped.json"];
  }

  const browser = await chromium.launch({ headless: true });
  const outputs = [];
  try {
    for (const viewport of VIEWPORTS) {
      for (const language of LIVE_LANGUAGES) {
        const context = await setupContext(browser, viewport, language, {
          Authorization: `Bearer ${jwt}`,
        });
        const page = await context.newPage();
        await page.goto(routeUrl(language.code), { waitUntil: "domcontentloaded", timeout: 60000 });
        await freezeMotion(page);
        await stabilizePage(page);
        const targetRelativePath = `states/authed/${BRAND_SLUG}-${language.code}-${viewport.name}.png`;
        await page.screenshot({ path: toAbsolute(targetRelativePath), fullPage: true });
        outputs.push(targetRelativePath);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  return outputs;
};

const writeManifest = async (manifest) => writeJson("browser/reviewer-path-manifest.json", manifest);

const main = async () => {
  await ensureDirs();

  const promoted = {
    generatedAt: new Date().toISOString(),
    brandSlug: BRAND_SLUG,
    qaSlug: QA_SLUG,
    axes: await promoteAxeArtifacts(),
    lighthouse: await promoteLighthouseArtifacts(),
    snapshotsAndStates: await promoteSnapshotAndStateArtifacts(),
    contrast: await promoteContrastArtifacts(),
    tokens: await promoteTokenArtifacts(),
    anatomy: await promoteAnatomyArtifacts(),
    i18n: await promoteI18nArtifacts(),
    qa: await promoteQaArtifacts(),
    backend: await promoteBackendMatrixArtifacts(),
    authedStates: await captureAuthedStateArtifacts(),
  };

  await writeManifest(promoted);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
