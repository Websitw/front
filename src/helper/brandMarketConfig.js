export const BRAND_MARKET_TEMPLATE_KEYS = [
  "editorial-hero",
  "commerce-grid",
  "story-collection",
  "campaign-focus",
  "routine-solution",
  "deal-promo",
  "category-hub",
];

export const BRAND_MARKET_TEMPLATE_ALIASES = {
  dbmed: "editorial-hero",
  dbmco: "commerce-grid",
  dbmst: "story-collection",
  dbmcf: "campaign-focus",
  dbmrs: "routine-solution",
  dbmdp: "deal-promo",
  dbmch: "category-hub",
};

export const BRAND_MARKET_HERO_LAYOUTS = [
  "editorial",
  "commerce",
  "collection",
  "campaign",
  "routine",
  "deal",
  "hub",
];

export const BRAND_MARKET_MODULE_OPTIONS = [
  "campaign-highlight",
  "collection-navigation",
  "commerce-quick-jump",
  "editorial-story",
  "faq-strip",
  "deal-strip",
  "routine-steps",
  "category-hub",
];

export const BRAND_MARKET_DEFAULT_MODULES = {
  "editorial-hero": ["editorial-story", "collection-navigation", "faq-strip"],
  "commerce-grid": ["commerce-quick-jump", "collection-navigation"],
  "story-collection": ["editorial-story", "collection-navigation"],
  "campaign-focus": ["campaign-highlight", "deal-strip"],
  "routine-solution": ["routine-steps", "collection-navigation"],
  "deal-promo": ["deal-strip", "faq-strip"],
  "category-hub": ["category-hub", "collection-navigation"],
};

export const BRAND_MARKET_DEFAULT_HERO_LAYOUT = {
  "editorial-hero": "editorial",
  "commerce-grid": "commerce",
  "story-collection": "collection",
  "campaign-focus": "campaign",
  "routine-solution": "routine",
  "deal-promo": "deal",
  "category-hub": "hub",
};

const MODULE_DENSITY_VARIANTS = ["default", "compact", "expanded"];
const HERO_EXPERIMENT_VARIANTS = ["default", "copy-first", "media-first", "balanced"];

export const resolveBrandMarketTemplateKey = (templateKey) => {
  const normalizedKey = String(templateKey || "").trim();
  if (!normalizedKey) {
    return "editorial-hero";
  }

  if (BRAND_MARKET_TEMPLATE_KEYS.includes(normalizedKey)) {
    return normalizedKey;
  }

  return BRAND_MARKET_TEMPLATE_ALIASES[normalizedKey] || "editorial-hero";
};

const sanitizeTemplateKey = (templateKey) => resolveBrandMarketTemplateKey(templateKey);

const sanitizeModuleList = (modules = []) =>
  Array.isArray(modules)
    ? [...new Set(modules.filter((moduleKey) => BRAND_MARKET_MODULE_OPTIONS.includes(moduleKey)))]
    : [];

export const getDefaultBrandMarketModules = (templateKey) =>
  BRAND_MARKET_DEFAULT_MODULES[sanitizeTemplateKey(templateKey)] || [];

export const getDefaultHeroLayoutForTemplate = (templateKey) =>
  BRAND_MARKET_DEFAULT_HERO_LAYOUT[sanitizeTemplateKey(templateKey)] || "editorial";

export const resolveConfiguredBrandMarketModules = (templateKey, modules = []) => {
  const sanitizedModules = sanitizeModuleList(modules);
  return sanitizedModules.length ? sanitizedModules : getDefaultBrandMarketModules(templateKey);
};

const applyModuleDensity = (modules, moduleDensity) => {
  if (moduleDensity === "compact") {
    return modules.filter((moduleKey) => !["faq-strip", "collection-navigation"].includes(moduleKey));
  }

  if (moduleDensity === "expanded") {
    return [...new Set([...modules, "faq-strip"])];
  }

  return modules;
};

export const resolveBrandMarketExperimentState = ({
  searchString = "",
  templateKey,
  templateModules = [],
  heroLayout = "",
}) => {
  const query = new URLSearchParams(String(searchString || "").replace(/^\?/, ""));
  const requestedHeroExperiment = query.get("abHeroVariant");
  const requestedModuleDensity = query.get("abModuleDensity");
  const baseModules = resolveConfiguredBrandMarketModules(templateKey, templateModules);
  const moduleDensity = MODULE_DENSITY_VARIANTS.includes(requestedModuleDensity)
    ? requestedModuleDensity
    : "default";
  const heroExperiment = HERO_EXPERIMENT_VARIANTS.includes(requestedHeroExperiment)
    ? requestedHeroExperiment
    : "default";

  return {
    templateKey: sanitizeTemplateKey(templateKey),
    heroLayout:
      BRAND_MARKET_HERO_LAYOUTS.includes(heroLayout) ? heroLayout : getDefaultHeroLayoutForTemplate(templateKey),
    heroExperiment,
    moduleDensity,
    modules: applyModuleDensity(baseModules, moduleDensity),
    experimentActive: heroExperiment !== "default" || moduleDensity !== "default",
  };
};
