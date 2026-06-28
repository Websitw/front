import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:4173";
const defaultRouteSpecs = [
  { path: "/", role: null },
  { path: "/search", role: null },
  { path: "/search-brand", role: null },
  { path: "/search-category-brand", role: null },
  { path: "/SegmentCategories", role: null },
  { path: "/BrandTemplate", role: null },
  { path: "/brand-stores", role: null },
  { path: "/cart", role: null },
  { path: "/Signin", role: null },
  { path: "/admin", role: null },
  { path: "/create-merchant", role: null },
  { path: "/account-settings", role: "user" },
  { path: "/business-account-settings", role: "user" },
  { path: "/MyOrder", role: "user" },
  { path: "/dashboard", role: "admin" },
  { path: "/dashboard/users", role: "admin" },
  { path: "/dashboard/BrandManagement", role: "admin" },
  { path: "/dashboard/CategoriesManagement", role: "admin" },
  { path: "/dashboard/SegmentsMangement", role: "admin" },
  { path: "/dashboard/ManageAgreements", role: "admin" },
  { path: "/dashboard/Merchants", role: "admin" },
  { path: "/dashboard/PlatformSetting", role: "admin" },
  { path: "/merchant/dashboard/home", role: "merchant" },
  { path: "/merchant/dashboard/products", role: "merchant" },
  { path: "/merchant/dashboard/my-brands", role: "merchant" },
];
const routes = process.env.RESPONSIVE_ROUTES
  ? process.env.RESPONSIVE_ROUTES.split(",")
      .map((route) => route.trim())
      .filter(Boolean)
      .map((route) => ({ path: route, role: null }))
  : defaultRouteSpecs;
const failOnConsole = process.env.RESPONSIVE_FAIL_ON_CONSOLE === "1";
const screenshotDir = process.env.RESPONSIVE_SCREENSHOT_DIR
  ? path.resolve(process.env.RESPONSIVE_SCREENSHOT_DIR)
  : null;

const viewports = [
  { name: "mobile-small", width: 360, height: 740 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

const overflowAllowance = 2;
const failures = [];
const browser = await chromium.launch();
const authUsers = {
  admin: {
    id: "responsive-admin",
    email: "responsive-admin@example.invalid",
    name: "Responsive Admin",
    programCode: "superadmin",
  },
  merchant: {
    id: "responsive-merchant",
    email: "responsive-merchant@example.invalid",
    name: "Responsive Merchant",
    programCode: "M",
  },
  user: {
    id: "responsive-user",
    email: "responsive-user@example.invalid",
    name: "Responsive User",
    programCode: "U",
  },
};

if (screenshotDir) {
  await mkdir(screenshotDir, { recursive: true });
}

const routeSlug = (route) =>
  route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(
        ({ role, authUsers: users }) => {
          localStorage.clear();
          localStorage.setItem("isVisit", "true");
          if (!role) return;

          localStorage.setItem("token", "responsive-smoke-token");
          localStorage.setItem("userData", JSON.stringify(users[role]));
          localStorage.setItem("lastTokenRefresh", String(Date.now()));
        },
        { role: route.role, authUsers },
      );

      const page = await context.newPage();
      const consoleErrors = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      const url = new URL(route.path, baseUrl).toString();
      const response = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      if (!response || !response.ok()) {
        failures.push(`${viewport.name} ${route.path}: HTTP ${response?.status() || "no response"}`);
        await context.close();
        continue;
      }

      const metrics = await page.evaluate(() => ({
        bodyScrollWidth: document.body.scrollWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        maintenanceVisible: Boolean(document.querySelector(".maintenance-container")),
      }));

      const scrollWidth = Math.max(metrics.bodyScrollWidth, metrics.documentScrollWidth);

      if (metrics.maintenanceVisible) {
        failures.push(`${viewport.name} ${route.path}: mobile maintenance screen is visible`);
      }

      if (scrollWidth > metrics.viewportWidth + overflowAllowance) {
        failures.push(
          `${viewport.name} ${route.path}: horizontal overflow ${scrollWidth}px > viewport ${metrics.viewportWidth}px`,
        );
      }

      if (screenshotDir) {
        await page.screenshot({
          path: path.join(screenshotDir, `${viewport.name}-${routeSlug(route.path)}.png`),
          fullPage: true,
        });
      }

      if (consoleErrors.length && failOnConsole) {
        const uniqueErrors = [...new Set(consoleErrors)].slice(0, 5);
        failures.push(`${viewport.name} ${route.path}: console errors: ${uniqueErrors.join(" | ")}`);
      }

      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error("Responsive verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Responsive verification passed for ${routes.length} routes across ${viewports.length} viewport profiles.`);
