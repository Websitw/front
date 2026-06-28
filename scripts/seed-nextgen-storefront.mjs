#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

import {
	BRAND_MARKET_TEMPLATE_KEYS,
	getDefaultBrandMarketModules,
	getDefaultHeroLayoutForTemplate,
	resolveBrandMarketTemplateKey,
} from "../src/helper/brandMarketConfig.js";

const ROOT_DIR = process.cwd();
const DOT_ENV_PATH = path.join(ROOT_DIR, ".env");

await loadEnvFile(DOT_ENV_PATH);

const argv = process.argv.slice(2);
const shouldApply = argv.includes("--apply");
const shouldForce = argv.includes("--force");
const shouldDumpPayload = argv.includes("--dump-payload");

const PUBLIC_APP_ID = readSetting("XAP_APP_ID", "mada");
const API_ORIGIN = normalizeOrigin(readSetting("XAP_API_ORIGIN", "https://xapsawa.xapis.com/v1/"));
const BRAND_APP_ORIGIN = readSetting("BRAND_APP_ORIGIN", "https://sawa.xapis.com");
const SOURCE_BRAND_REF = readArgument("source-brand") || readSetting("SOURCE_BRAND_REF", "sensation");
const TARGET_BRAND_REF = readArgument("target-brand") || readSetting("TARGET_BRAND_REF", SOURCE_BRAND_REF);
const TEMPLATE_OVERRIDE = readArgument("template") || readSetting("TARGET_TEMPLATE_KEY", "");
const BEARER_TOKEN = readSetting("XAP_TOKEN", "");

const TEMPLATE_METADATA = {
	"editorial-hero": {
		displayNameEn: "Editorial Hero",
		displayNameAr: "الواجهة التحريرية",
		descriptionEn: "Story-led branded storefront with editorial hero treatment and curated merchandising.",
		descriptionAr: "واجهة علامة تقودها القصة مع بطل تحريري وتنسيق بيع منسق.",
	},
	"commerce-grid": {
		displayNameEn: "Commerce Grid",
		displayNameAr: "شبكة التجارة",
		descriptionEn: "Browse-first branded storefront optimized for dense product discovery and quick conversion.",
		descriptionAr: "واجهة علامة تركز على التصفح أولاً مع اكتشاف كثيف للمنتجات وتحويل سريع.",
	},
	"story-collection": {
		displayNameEn: "Story Collection",
		displayNameAr: "قصة المجموعات",
		descriptionEn: "Collection-led branded storefront that blends editorial narrative with curated assortment paths.",
		descriptionAr: "واجهة علامة تقودها المجموعات وتمزج بين السرد التحريري ومسارات التشكيلة المنسقة.",
	},
	"campaign-focus": {
		displayNameEn: "Campaign Focus",
		displayNameAr: "تركيز الحملة",
		descriptionEn: "Campaign-centric branded storefront for launches, offer pushes, and branded promotional moments.",
		descriptionAr: "واجهة علامة تتمحور حول الحملة لإطلاقات المنتجات والعروض واللحظات الترويجية.",
	},
	"routine-solution": {
		displayNameEn: "Routine Solution",
		displayNameAr: "الحل الروتيني",
		descriptionEn: "Guided routine storefront that structures products into a step-based problem-solution journey.",
		descriptionAr: "واجهة روتين موجهة تنظم المنتجات ضمن رحلة حل تدريجية قائمة على الخطوات.",
	},
	"deal-promo": {
		displayNameEn: "Deal Promo",
		displayNameAr: "واجهة العروض",
		descriptionEn: "Promotional storefront focused on offer-led conversion and high-visibility merchandising.",
		descriptionAr: "واجهة ترويجية تركز على التحويل القائم على العرض وإبراز البيع بشكل واضح.",
	},
	"category-hub": {
		displayNameEn: "Category Hub",
		displayNameAr: "مركز الفئات",
		descriptionEn: "Category-first branded storefront that organizes discovery around taxonomy and collection navigation.",
		descriptionAr: "واجهة علامة تبدأ من الفئات وتنظم الاكتشاف حول التصنيف والتنقل بين المجموعات.",
	},
};

const usage = `
Usage:
	node scripts/seed-nextgen-storefront.mjs
	node scripts/seed-nextgen-storefront.mjs --source-brand sensation --target-brand sensation
	XAP_TOKEN=... node scripts/seed-nextgen-storefront.mjs --apply --target-brand sensation
	XAP_TOKEN=... node scripts/seed-nextgen-storefront.mjs --apply --target-brand sensation --template story-collection --force

Notes:
	- Dry run is the default; add --apply to write to the environment.
	- The script reads legacy published brand-landing content, converts it into the new
		mptemplatecatalog + mpstorefrontcontent model, and then submits/approves/publishes it.
	- A real admin bearer token is required for --apply.
`;

function readArgument(name) {
	const direct = argv.find((arg) => arg.startsWith(`--${name}=`));
	if (direct) {
		return direct.slice(name.length + 3).trim();
	}

	const index = argv.indexOf(`--${name}`);
	if (index >= 0 && argv[index + 1]) {
		return String(argv[index + 1]).trim();
	}

	return "";
}

function readSetting(key, fallback = "") {
	const raw = process.env[key];
	if (!raw) {
		return fallback;
	}

	const value = String(raw).trim();
	if (!value || /^__REPLACE_WITH_/i.test(value)) {
		return fallback;
	}

	return value;
}

async function loadEnvFile(filePath) {
	try {
		const raw = await readFile(filePath, "utf8");
		for (const line of raw.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) {
				continue;
			}

			const separatorIndex = trimmed.indexOf("=");
			if (separatorIndex <= 0) {
				continue;
			}

			const key = trimmed.slice(0, separatorIndex).trim();
			const value = trimmed.slice(separatorIndex + 1).trim();
			if (!(key in process.env)) {
				process.env[key] = value;
			}
		}
	} catch {
		// Optional local convenience file.
	}
}

function normalizeOrigin(origin) {
	return String(origin || "").endsWith("/") ? String(origin || "") : `${origin}/`;
}

function ensureArray(value) {
	return Array.isArray(value) ? value : [];
}

function normalizeText(value, fallback = "") {
	if (value === undefined || value === null) {
		return fallback;
	}

	return String(value).trim() || fallback;
}

function normalizeIdentifier(value) {
	if (value === undefined || value === null) {
		return "";
	}

	return String(value)
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "");
}

function withNormalizedKeys(value) {
	if (Array.isArray(value)) {
		return value.map((item) => withNormalizedKeys(item));
	}

	if (!value || typeof value !== "object") {
		return value;
	}

	const result = {};
	for (const [key, nestedValue] of Object.entries(value)) {
		const normalizedValue = withNormalizedKeys(nestedValue);
		result[key] = normalizedValue;

		const normalizedKey = normalizeIdentifier(key);
		if (normalizedKey && normalizedKey !== key && !(normalizedKey in result)) {
			result[normalizedKey] = normalizedValue;
		}
	}

	return result;
}

function escapeQueryValue(value) {
	return String(value || "").replace(/"/g, '\\"').trim();
}

function pickLocalizedText(value, i18nValue, locale, fallback = "") {
	if (i18nValue && typeof i18nValue === "object") {
		const localized = normalizeText(i18nValue[locale], "");
		if (localized) {
			return localized;
		}

		const english = normalizeText(i18nValue.en, "");
		if (english) {
			return english;
		}
	}

	return normalizeText(value, fallback);
}

function localizedValue(locale, enValue, arValue, fallback = "") {
	return locale === "ar"
		? normalizeText(arValue, normalizeText(enValue, fallback))
		: normalizeText(enValue, fallback);
}

function unwrapRecord(payload) {
	if (!payload || typeof payload !== "object") {
		return {};
	}

	if (payload.properties && typeof payload.properties === "object") {
		return {
			...payload.properties,
			id: payload.id || payload.properties.id || "",
			version: payload.version ?? payload.properties.version,
			publicationStatus: payload.publicationStatus || payload.properties.publicationStatus || "",
			status: payload.status || payload.properties.status || "",
		};
	}

	return payload;
}

async function requestJson(resourcePath, { method = "GET", auth = "public", params, body } = {}) {
	const url = new URL(resourcePath, API_ORIGIN);

	if (auth === "public" && !url.searchParams.has("accessKey")) {
		url.searchParams.set("accessKey", PUBLIC_APP_ID);
	}

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined || value === null || value === "") {
				continue;
			}
			url.searchParams.set(key, value);
		}
	}

	const headers = {
		"Content-Type": "application/json",
	};
	if (auth === "bearer") {
		headers.Authorization = `Bearer ${BEARER_TOKEN}`;
	}

	const response = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	const text = await response.text();
	let payload = null;
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = text;
		}
	}

	if (!response.ok) {
		const error = new Error(
			payload?.message || payload?.error || `${method} ${url.pathname} failed with status ${response.status}`,
		);
		error.status = response.status;
		error.payload = payload;
		throw error;
	}

	return payload;
}

async function resolveBrandByRef(brandRef, auth = "public") {
	const normalized = normalizeText(brandRef, "");
	if (!normalized) {
		throw new Error("Brand ref is required.");
	}

	if (/^\d{10,}$/.test(normalized)) {
		try {
			return unwrapRecord(await requestJson(`brands/${normalized}`, { auth }));
		} catch {
			// Fall through to query lookups.
		}
	}

	const queries = [
		`properties.key:${escapeQueryValue(normalized)}`,
		`properties.key:"${escapeQueryValue(normalized)}"`,
		`properties.slug:${escapeQueryValue(normalized)}`,
		`properties.slug:"${escapeQueryValue(normalized)}"`,
		`properties.brandName:"${escapeQueryValue(normalized).replace(/-/g, " ")}"`,
	];

	for (const query of queries) {
		const page = await requestJson("brands", {
			auth,
			params: {
				q: query,
				limit: 1,
			},
		});

		if (page?.items?.[0]) {
			return unwrapRecord(page.items[0]);
		}
	}

	throw new Error(`Unable to resolve brand '${brandRef}'.`);
}

async function fetchLegacyLandingByBrand(brandId) {
	const page = await requestJson("brand-landing", {
		auth: "public",
		params: {
			q: `properties.brandId:${brandId}`,
			limit: 1,
		},
	});

	if (!page?.items?.[0]) {
		throw new Error(`No published legacy brand-landing row found for brand ${brandId}.`);
	}

	return unwrapRecord(page.items[0]);
}

async function fetchBrandCollections(brandId) {
	const page = await requestJson(`brands/${brandId}/collections`, {
		auth: "public",
	});

	return ensureArray(page?.items).map(unwrapRecord);
}

async function lookupTemplateCatalog(templateKey) {
	try {
		return unwrapRecord(
			await requestJson(`brand-templates/${encodeURIComponent(templateKey)}`, {
				auth: "public",
			}),
		);
	} catch {
		return null;
	}
}

async function lookupAdminTemplateCatalog(templateKey) {
	const page = await requestJson("manage/brand-templates", {
		auth: "bearer",
		params: {
			q: `properties.templateKey:"${escapeQueryValue(templateKey)}"`,
			limit: 1,
		},
	});

	return page?.items?.[0] ? unwrapRecord(page.items[0]) : null;
}

async function resolveExistingTemplateCatalog(templateKey) {
	const adminRecord = await lookupAdminTemplateCatalog(templateKey);
	if (adminRecord?.id) {
		return adminRecord;
	}

	const publicRecord = await lookupTemplateCatalog(templateKey);
	return publicRecord?.id ? publicRecord : null;
}

async function lookupStorefrontRecordsByBrand(brandId) {
	const page = await requestJson("manage/brand-storefronts", {
		auth: "bearer",
		params: {
			q: `properties.brandId:${brandId}`,
			limit: 50,
		},
	});

	return ensureArray(page?.items).map(unwrapRecord);
}

function buildBrandRoute(brand) {
	const brandRef = brand?.slug || brand?.key || brand?.id || "";
	return brandRef ? `${BRAND_APP_ORIGIN}/brands/${encodeURIComponent(brandRef)}` : `${BRAND_APP_ORIGIN}/brand-stores`;
}

function getCollectionBySection(collections, sectionKeys = []) {
	const lowerKeys = sectionKeys.map((key) => String(key || "").toLowerCase());
	return ensureArray(collections).find((collection) =>
		lowerKeys.includes(String(collection?.sectionKey || "").toLowerCase()),
	);
}

function toProductIds(collection, limit = 8) {
	return ensureArray(collection?.items)
		.map((item) => item?.productId || item?.id || "")
		.filter(Boolean)
		.slice(0, limit);
}

function createGenericTemplateSchema(templateKey) {
	return {
		designSpec: {
			anatomy: {
				required: [
					"hero",
					"valueProps",
					"visualIdentity",
					"socialProof",
					"productHighlights",
					"story",
					"trust",
					"cta",
					"mobileFirst",
					"footerEssentials",
				],
				conditional: [],
				order: [
					"hero",
					"valueProps",
					"visualIdentity",
					"story",
					"trust",
					"productHighlights",
					"socialProof",
					"cta",
					"mobileFirst",
					"footerEssentials",
				],
				counts: {
					hero: { min: 1, max: 1 },
					valueprops: { min: 1, max: 1 },
					visualidentity: { min: 1, max: 1 },
					socialproof: { min: 1, max: 1 },
					producthighlights: { min: 1, max: 1 },
					story: { min: 1, max: 1 },
					trust: { min: 1, max: 1 },
					cta: { min: 1, max: 1 },
					mobilefirst: { min: 1, max: 1 },
					footeressentials: { min: 1, max: 1 },
					faq: { min: 0, max: 1 },
					bannerads: { min: 0, max: 2 },
					service: { min: 0, max: 1 },
				},
				extendedSupported: ["faq", "bannerAds", "service"],
			},
			defaults: {
				heroLayout: getDefaultHeroLayoutForTemplate(templateKey),
				templateModules: getDefaultBrandMarketModules(templateKey),
			},
		},
		sections: {
			hero: { requiredFields: ["title", "description", "primaryAction"] },
			valueprops: { requiredFields: ["items"] },
			visualidentity: { requiredFields: ["promise"] },
			socialproof: { requiredFields: ["items"] },
			producthighlights: { requiredFields: ["items"] },
			story: { requiredFields: ["title", "body"] },
			trust: { requiredFields: ["items"] },
			cta: { requiredFields: ["title", "primaryAction"] },
			mobilefirst: { requiredFields: ["heroLayout", "templateModules"] },
			footeressentials: { requiredFields: ["title", "navigationLinks"] },
			faq: { requiredFields: ["items"] },
			bannerads: { requiredFields: ["items"] },
			service: { requiredFields: ["title", "description"] },
		},
	};
}

function buildTemplateCatalogPayload(templateKey, previewAssetId = "") {
	const metadata = TEMPLATE_METADATA[templateKey] || TEMPLATE_METADATA["editorial-hero"];
	return {
		templateKey,
		displayNameEn: metadata.displayNameEn,
		displayNameAr: metadata.displayNameAr,
		descriptionEn: metadata.descriptionEn,
		descriptionAr: metadata.descriptionAr,
		classification: "GENERIC",
		categoryKey: "*",
		segmentIds: [],
		schemaVersion: 1,
		contentSchema: createGenericTemplateSchema(templateKey),
		previewAssetId,
		status: "ACTIVE",
		visibility: "PUBLIC",
		minTier: "STANDARD",
	};
}

async function upsertTemplateCatalog(templateKey, previewAssetId) {
	const payload = buildTemplateCatalogPayload(templateKey, previewAssetId);
	const existing = await resolveExistingTemplateCatalog(templateKey);

	if (!existing?.id) {
		try {
			return unwrapRecord(
				await requestJson("manage/brand-templates", {
					method: "POST",
					auth: "bearer",
					body: payload,
				}),
			);
		} catch (error) {
			const duplicateTemplateKey = ensureArray(error?.payload?.errors).includes("templateKey already exists.");
			if (!duplicateTemplateKey) {
				throw error;
			}

			const duplicateRecord = await resolveExistingTemplateCatalog(templateKey);
			if (!duplicateRecord?.id) {
				throw error;
			}

			return unwrapRecord(
				await requestJson(`manage/brand-templates/${duplicateRecord.id}`, {
					method: "PUT",
					auth: "bearer",
					body: payload,
				}),
			);
		}
	}

	return unwrapRecord(
		await requestJson(`manage/brand-templates/${existing.id}`, {
			method: "PUT",
			auth: "bearer",
			body: payload,
		}),
	);
}

function normalizeCardItems(items, locale) {
	return ensureArray(items)
		.map((item) => ({
			eyebrow: pickLocalizedText(item?.eyebrow, item?.eyebrow_i18n, locale, ""),
			title: pickLocalizedText(item?.title, item?.title_i18n, locale, ""),
			description: pickLocalizedText(item?.description, item?.description_i18n, locale, ""),
			mediaId: normalizeText(item?.mediaId, ""),
			icon: normalizeText(item?.icon, ""),
		}))
		.filter((item) => item.title || item.description || item.mediaId || item.icon);
}

function normalizeSocialProofItems(items, locale) {
	return ensureArray(items)
		.map((item) => ({
			headline: pickLocalizedText(item?.headline, item?.headline_i18n, locale, ""),
			value: normalizeText(item?.value, ""),
			label: pickLocalizedText(item?.label, item?.label_i18n, locale, ""),
			description: pickLocalizedText(item?.description, item?.description_i18n, locale, ""),
			mediaId: normalizeText(item?.mediaId, ""),
		}))
		.filter((item) => item.headline || item.value || item.label || item.description || item.mediaId);
}

function normalizeFaqItems(items, locale) {
	return ensureArray(items)
		.map((item) => ({
			question: pickLocalizedText(item?.question, item?.question_i18n, locale, ""),
			answer: pickLocalizedText(item?.answer, item?.answer_i18n, locale, ""),
		}))
		.filter((item) => item.question || item.answer);
}

function normalizeBannerItems(items, locale) {
	return ensureArray(items)
		.map((item) => ({
			title: pickLocalizedText(item?.title, item?.title_i18n, locale, ""),
			subTitle: pickLocalizedText(item?.subTitle, item?.subTitle_i18n, locale, ""),
			ctaLabel: pickLocalizedText(item?.ctaLabel, item?.ctaLabel_i18n, locale, ""),
			targetUrl: normalizeText(item?.targetUrl, ""),
			mediaId: normalizeText(item?.mediaId, ""),
			highlightValue: pickLocalizedText(item?.highlightValue, item?.highlightValue_i18n, locale, ""),
			highlightLabel: pickLocalizedText(item?.highlightLabel, item?.highlightLabel_i18n, locale, ""),
			placement: normalizeText(item?.placement, "promo"),
			backgroundColor: normalizeText(item?.backgroundColor, ""),
			priority: Number(item?.priority ?? 0),
		}))
		.filter((item) => item.title || item.subTitle || item.mediaId || item.targetUrl);
}

function normalizeLinks(items, locale) {
	return ensureArray(items)
		.map((item) => ({
			label: pickLocalizedText(item?.label, item?.label_i18n, locale, ""),
			url: normalizeText(item?.url, ""),
		}))
		.filter((item) => item.label || item.url);
}

function ensureNonEmpty(items, fallbackItems) {
	return items.length > 0 ? items : fallbackItems;
}

function buildFallbackValueProps(locale, brandName, mediaId) {
	return [
		{
			title: localizedValue(locale, "Curated assortment", "تشكيلة منسقة"),
			description: localizedValue(
				locale,
				`${brandName} presents a focused storefront with clear merchandising and faster discovery.`,
				`تقدم ${brandName} واجهة مركزة بتسويق واضح واكتشاف أسرع.`,
			),
			mediaId,
		},
		{
			title: localizedValue(locale, "Brand-first journey", "رحلة تقودها العلامة"),
			description: localizedValue(
				locale,
				`The experience keeps ${brandName} visible from the first hero moment to the final call to action.`,
				`تحافظ التجربة على حضور ${brandName} من أول لحظة في البطل حتى دعوة الإجراء النهائية.`,
			),
			mediaId,
		},
	];
}

function buildFallbackBrandPromise(locale, brandName) {
	return localizedValue(
		locale,
		`${brandName} delivers a curated brand journey with trusted merchandising, strong storytelling, and a direct path to purchase.`,
		`تقدم ${brandName} رحلة علامة منسقة تجمع بين التسويق الموثوق والسرد القوي ومسار شراء مباشر.`,
	);
}

function buildFallbackTrustItems(locale, mediaId) {
	return [
		{
			eyebrow: localizedValue(locale, "Trust", "الثقة"),
			title: localizedValue(locale, "Public storefront ready", "الواجهة العامة جاهزة"),
			description: localizedValue(
				locale,
				"The new storefront contract is published through the production route with reviewed content.",
				"يتم نشر عقد الواجهة الجديد عبر المسار الإنتاجي مع محتوى تمت مراجعته.",
			),
			mediaId,
		},
		{
			eyebrow: localizedValue(locale, "Support", "الدعم"),
			title: localizedValue(locale, "Operational support remains close", "الدعم التشغيلي قريب دائماً"),
			description: localizedValue(
				locale,
				"Service details, policies, and brand navigation remain accessible without breaking the shopping flow.",
				"تبقى تفاصيل الخدمة والسياسات وتنقل العلامة متاحة من دون قطع رحلة التسوق.",
			),
			mediaId,
		},
	];
}

function buildFallbackProductHighlights(locale, brandName, routeUrl, mediaId) {
	return [
		{
			eyebrow: localizedValue(locale, "Discovery", "الاكتشاف"),
			title: localizedValue(locale, `${brandName} highlights`, `أبرز ما يميز ${brandName}`),
			description: localizedValue(
				locale,
				"Use the curated collections and best-selling shelves to move from inspiration to purchase quickly.",
				"استخدم المجموعات المنسقة ورفوف الأكثر مبيعاً للانتقال بسرعة من الإلهام إلى الشراء.",
			),
			mediaId,
		},
		{
			eyebrow: localizedValue(locale, "Action", "الإجراء"),
			title: localizedValue(locale, "Direct path to the full storefront", "مسار مباشر إلى الواجهة الكاملة"),
			description: localizedValue(
				locale,
				`The primary route keeps shoppers moving directly into the live ${brandName} market experience.`,
				`يبقي المسار الأساسي المتسوقين في طريق مباشر إلى تجربة سوق ${brandName} الحية.`,
			),
			mediaId,
			targetUrl: routeUrl,
		},
	];
}

function buildFallbackSocialProof(locale, collectionCount, mediaId) {
	return [
		{
			headline: localizedValue(locale, "Storefront status", "حالة الواجهة"),
			value: "LIVE",
			label: localizedValue(locale, "Published next-gen storefront", "واجهة الجيل الجديد منشورة"),
			description: localizedValue(
				locale,
				`${collectionCount} supporting collections are available to reinforce discovery and merchandising.`,
				`توجد ${collectionCount} مجموعات داعمة لتعزيز الاكتشاف والتسويق.`,
			),
			mediaId,
		},
	];
}

function buildFallbackFaq(locale, brandName) {
	return [
		{
			question: localizedValue(locale, "What changed in this storefront?", "ما الذي تغير في هذه الواجهة؟"),
			answer: localizedValue(
				locale,
				`${brandName} is now published through the new storefront content model with explicit template, content, and publication workflow records.`,
				`يتم الآن نشر ${brandName} عبر نموذج محتوى الواجهة الجديد مع سجلات صريحة للقالب والمحتوى وسير عمل النشر.`,
			),
		},
		{
			question: localizedValue(locale, "Can shoppers browse products directly?", "هل يمكن للمتسوقين تصفح المنتجات مباشرة؟"),
			answer: localizedValue(
				locale,
				"Yes. The storefront links into live product discovery, curated collections, and direct purchase flows.",
				"نعم. تربط الواجهة بين اكتشاف المنتجات الحي والمجموعات المنسقة ومسارات الشراء المباشر.",
			),
		},
	];
}

function buildFallbackBannerAds(locale, brandName, routeUrl, mediaId) {
	return [
		{
			title: localizedValue(locale, `${brandName} storefront`, `واجهة ${brandName}`),
			subTitle: localizedValue(locale, "Published through the new platform model", "منشورة عبر نموذج المنصة الجديد"),
			ctaLabel: localizedValue(locale, "Open storefront", "افتح الواجهة"),
			targetUrl: routeUrl,
			mediaId,
			highlightValue: localizedValue(locale, "LIVE", "مباشر"),
			highlightLabel: localizedValue(locale, "Status", "الحالة"),
			placement: "promo",
			backgroundColor: "#111827",
			priority: 0,
		},
	];
}

function buildAssetRefs(legacy, brand) {
	const approvedAt = Date.now();
	const candidates = [
		[legacy?.heroMediaId, "hero-media"],
		[legacy?.mobileHeroMediaId, "hero-mobile-media"],
		[legacy?.heroPosterId, "hero-poster"],
		[legacy?.catalogId || brand?.catalogId, "brand-catalog"],
		[legacy?.logoId || brand?.logoId, "brand-logo"],
		[legacy?.finalCta?.mediaId, "final-cta-media"],
		...ensureArray(legacy?.bannerAds).map((banner, index) => [banner?.mediaId, `banner-ads-${index + 1}`]),
	];

	const seen = new Set();
	const refs = [];

	for (const [assetId, purpose] of candidates) {
		const normalizedAssetId = normalizeText(assetId, "");
		if (!normalizedAssetId) {
			continue;
		}

		const dedupeKey = `${purpose}:${normalizedAssetId}`;
		if (seen.has(dedupeKey)) {
			continue;
		}
		seen.add(dedupeKey);

		refs.push({
			assetId: normalizedAssetId,
			purpose,
			approvalStatus: "APPROVED",
			verificationStatus: "VERIFIED",
			approvedBy: "seed-nextgen-storefront",
			approvedAt,
			lastVerifiedAt: approvedAt,
		});
	}

	return refs;
}

function buildProductSelections(brandId, collections) {
	const fallbackQuery = `properties.brandId:${brandId}`;
	const rules = [
		{
			kind: "bestSellers",
			collection: getCollectionBySection(collections, ["best_sellers", "best-sellers", "bestsellers"]),
			limit: 8,
		},
		{
			kind: "newArrivals",
			collection: getCollectionBySection(collections, ["new_arrivals", "new-arrivals", "newarrivals"]),
			limit: 8,
		},
		{
			kind: "recommended",
			collection: getCollectionBySection(collections, ["recommended", "story_collection", "story-collection"]),
			limit: 8,
		},
		{
			kind: "featuredCollections",
			collection: getCollectionBySection(collections, ["featured", "featured_collection", "featured-collection", "spotlight"]),
			limit: 6,
		},
	];

	return rules.map(({ kind, collection, limit }) => ({
		ruleType: collection?.id ? "COLLECTION" : "QUERY",
		selectionMode: collection?.id ? "COLLECTION" : "QUERY",
		brandId,
		collectionId: collection?.id || null,
		query: collection?.id ? null : fallbackQuery,
		kind,
		limit,
		productIds: collection?.id ? toProductIds(collection, limit) : [],
	}));
}

function buildThemeTokens(legacy) {
	const theme = legacy?.theme && typeof legacy.theme === "object" ? legacy.theme : {};
	return {
		accentColor: normalizeText(legacy?.accentColor || theme?.accentColor, "#0EA5A8"),
		surfaceColor: normalizeText(legacy?.surfaceColor || theme?.surfaceColor, "#0F172A"),
		textColor: normalizeText(legacy?.textColor || theme?.textColor, "#F8FAFC"),
		borderColor: normalizeText(legacy?.borderColor || theme?.borderColor, "rgba(148, 163, 184, 0.18)"),
		mutedTextColor: normalizeText(legacy?.mutedTextColor || theme?.mutedTextColor, "#CBD5E1"),
		headingFont: normalizeText(legacy?.headingFont || theme?.headingFont, "\"Sora\", \"Montserrat\", sans-serif"),
		bodyFont: normalizeText(legacy?.bodyFont || theme?.bodyFont, "\"Manrope\", \"Segoe UI\", sans-serif"),
		typographyScale: normalizeText(legacy?.typographyScale || theme?.typographyScale, "balanced"),
		sectionSpacingScale: normalizeText(legacy?.sectionSpacingScale || theme?.sectionSpacingScale, "balanced"),
		layoutDensity: normalizeText(legacy?.layoutDensity || theme?.layoutDensity, "balanced"),
		buttonStyle: normalizeText(legacy?.buttonStyle || theme?.buttonStyle, "rounded"),
		heroOverlayStyle: normalizeText(legacy?.heroOverlayStyle || theme?.heroOverlayStyle, "rich"),
		cardTone: normalizeText(legacy?.cardTone || theme?.cardTone, "elevated"),
		imageryTone: normalizeText(legacy?.imageryTone || theme?.imageryTone, "editorial"),
	};
}

function buildLocaleContent({ legacy, brand, collections, locale, templateKey }) {
	const brandName = pickLocalizedText(brand?.brandName, brand?.name_i18n, locale, brand?.brandName || "Brand");
	const routeUrl = buildBrandRoute(brand);
	const catalogUrl = brand?.id
		? `${BRAND_APP_ORIGIN}/search-brand?brandId=${encodeURIComponent(brand.id)}`
		: routeUrl;
	const heroMediaId = normalizeText(legacy?.heroMediaId || brand?.catalogId || brand?.logoId, "");

	const values = ensureNonEmpty(
		normalizeCardItems(legacy?.values, locale),
		buildFallbackValueProps(locale, brandName, heroMediaId),
	);
	const trustItems = ensureNonEmpty(
		normalizeCardItems(legacy?.keyBenefits, locale),
		buildFallbackTrustItems(locale, heroMediaId),
	);
	const productHighlights = ensureNonEmpty(
		normalizeCardItems(legacy?.offerHighlights, locale),
		buildFallbackProductHighlights(locale, brandName, routeUrl, heroMediaId),
	);
	const socialProof = ensureNonEmpty(
		normalizeSocialProofItems(legacy?.socialProof, locale),
		buildFallbackSocialProof(locale, collections.length, heroMediaId),
	);
	const faqItems = ensureNonEmpty(
		normalizeFaqItems(legacy?.faqItems, locale),
		buildFallbackFaq(locale, brandName),
	);
	const bannerItems = ensureNonEmpty(
		normalizeBannerItems(legacy?.bannerAds, locale),
		buildFallbackBannerAds(locale, brandName, routeUrl, heroMediaId),
	);

	const primaryHeroAction = {
		label: pickLocalizedText(
			legacy?.heroPrimaryCtaLabel,
			legacy?.heroPrimaryCtaLabel_i18n,
			locale,
			localizedValue(locale, "View storefront", "عرض الواجهة"),
		),
		url: normalizeText(legacy?.heroPrimaryCtaUrl, routeUrl),
		style: "primary",
	};
	const secondaryHeroAction = {
		label: pickLocalizedText(
			legacy?.heroSecondaryCtaLabel,
			legacy?.heroSecondaryCtaLabel_i18n,
			locale,
			localizedValue(locale, "Browse products", "تصفح المنتجات"),
		),
		url: normalizeText(legacy?.heroSecondaryCtaUrl, catalogUrl),
		style: "secondary",
	};

	const finalCta = legacy?.finalCta || {};
	const footerNavigationLinks = ensureNonEmpty(
		normalizeLinks(legacy?.footerNavigationLinks, locale),
		[
			{
				label: localizedValue(locale, "Storefront", "الواجهة"),
				url: routeUrl,
			},
			{
				label: localizedValue(locale, "Browse products", "تصفح المنتجات"),
				url: catalogUrl,
			},
		],
	);
	const socialLinks = normalizeLinks(legacy?.socialLinks, locale);
	const visualPromise = pickLocalizedText(
		legacy?.brandPromise,
		legacy?.brandPromise_i18n,
		locale,
		buildFallbackBrandPromise(locale, brandName),
	);

	return withNormalizedKeys({
		hero: {
			eyebrow: pickLocalizedText(legacy?.heroEyebrow, legacy?.heroEyebrow_i18n, locale, ""),
			title: pickLocalizedText(legacy?.heroTitle, legacy?.heroTitle_i18n, locale, brandName),
			description: pickLocalizedText(legacy?.heroDescription, legacy?.heroDescription_i18n, locale, ""),
			mediaId: heroMediaId,
			mobileMediaId: normalizeText(legacy?.mobileHeroMediaId, heroMediaId),
			posterId: normalizeText(legacy?.heroPosterId, ""),
			primaryAction: primaryHeroAction,
			secondaryAction: secondaryHeroAction,
		},
		valueprops: {
			title: pickLocalizedText(legacy?.valuesTitle, legacy?.valuesTitle_i18n, locale, localizedValue(locale, "Brand Values", "قيم العلامة")),
			items: values,
		},
		visualidentity: {
			title: localizedValue(locale, "Brand Promise", "وعد العلامة"),
			promise: visualPromise,
		},
		story: {
			title: pickLocalizedText(legacy?.storyTitle, legacy?.storyTitle_i18n, locale, localizedValue(locale, "Brand Story", "قصة العلامة")),
			body: pickLocalizedText(legacy?.storyBody, legacy?.storyBody_i18n, locale, ""),
		},
		trust: {
			title: pickLocalizedText(
				legacy?.keyBenefitsTitle,
				legacy?.keyBenefitsTitle_i18n,
				locale,
				localizedValue(locale, "Why shoppers trust this storefront", "لماذا يثق المتسوقون بهذه الواجهة"),
			),
			items: trustItems,
		},
		producthighlights: {
			title: pickLocalizedText(
				legacy?.offerHighlightsTitle,
				legacy?.offerHighlightsTitle_i18n,
				locale,
				localizedValue(locale, "Product Highlights", "أبرز المنتجات"),
			),
			items: productHighlights,
		},
		socialproof: {
			title: pickLocalizedText(
				legacy?.socialProofTitle,
				legacy?.socialProofTitle_i18n,
				locale,
				localizedValue(locale, "Social Proof", "دلائل الثقة"),
			),
			items: socialProof,
		},
		faq: {
			title: pickLocalizedText(
				legacy?.faqTitle,
				legacy?.faqTitle_i18n,
				locale,
				localizedValue(locale, "Frequently Asked Questions", "الأسئلة الشائعة"),
			),
			items: faqItems,
		},
		bannerads: {
			title: localizedValue(locale, "Brand Highlights", "أبرز ما في الواجهة"),
			items: bannerItems,
		},
		cta: {
			title: pickLocalizedText(finalCta?.title, finalCta?.title_i18n, locale, localizedValue(locale, "Continue to the full storefront", "تابع إلى الواجهة الكاملة")),
			subTitle: pickLocalizedText(finalCta?.subTitle, finalCta?.subTitle_i18n, locale, localizedValue(locale, "Move directly into live product discovery and purchase.", "انتقل مباشرة إلى اكتشاف المنتجات الحي والشراء.")),
			mediaId: normalizeText(finalCta?.mediaId, heroMediaId),
			backgroundColor: normalizeText(finalCta?.backgroundColor, "#111827"),
			primaryAction: {
				label: pickLocalizedText(finalCta?.primaryAction?.label, finalCta?.primaryAction?.label_i18n, locale, localizedValue(locale, "Browse products", "تصفح المنتجات")),
				url: normalizeText(finalCta?.primaryAction?.url, catalogUrl),
				style: normalizeText(finalCta?.primaryAction?.style, "primary"),
			},
			secondaryAction: {
				label: pickLocalizedText(finalCta?.secondaryAction?.label, finalCta?.secondaryAction?.label_i18n, locale, localizedValue(locale, "Back to brand stores", "العودة إلى متاجر العلامات")),
				url: normalizeText(finalCta?.secondaryAction?.url, `${BRAND_APP_ORIGIN}/brand-stores`),
				style: normalizeText(finalCta?.secondaryAction?.style, "secondary"),
			},
		},
		mobilefirst: {
			heroLayout: normalizeText(legacy?.heroLayout, getDefaultHeroLayoutForTemplate(templateKey)),
			templateModules: ensureArray(legacy?.templateModules).length
				? legacy.templateModules
				: getDefaultBrandMarketModules(templateKey),
		},
		footeressentials: {
			title: pickLocalizedText(legacy?.footerTitle, legacy?.footerTitle_i18n, locale, brandName),
			description: pickLocalizedText(legacy?.footerDescription, legacy?.footerDescription_i18n, locale, ""),
			navigationLinks: footerNavigationLinks,
			socialLinks,
			privacyUrl: normalizeText(legacy?.privacyUrl, routeUrl),
			termsUrl: normalizeText(legacy?.termsUrl, routeUrl),
		},
		service: {
			title: pickLocalizedText(legacy?.serviceTitle, legacy?.serviceTitle_i18n, locale, localizedValue(locale, "Service & Support", "الخدمة والدعم")),
			description: pickLocalizedText(legacy?.serviceDescription, legacy?.serviceDescription_i18n, locale, ""),
			email: normalizeText(legacy?.serviceEmail, ""),
			phone: normalizeText(legacy?.servicePhone, ""),
			hours: normalizeText(legacy?.serviceHours, ""),
			url: normalizeText(legacy?.serviceUrl, ""),
			links: normalizeLinks(legacy?.serviceLinks, locale),
		},
	});
}

function buildStorefrontPayload({ brand, legacy, collections, templateKey }) {
	return {
		brandId: brand.id,
		merchantId: normalizeText(brand?.ownerId || legacy?.merchantOwnerId, ""),
		templateKey,
		schemaVersion: 1,
		localeContent: {
			en: buildLocaleContent({ legacy, brand, collections, locale: "en", templateKey }),
			ar: buildLocaleContent({ legacy, brand, collections, locale: "ar", templateKey }),
		},
		assetRefs: buildAssetRefs(legacy, brand),
		productSelections: buildProductSelections(brand.id, collections),
		themeTokens: buildThemeTokens(legacy),
		publicationStatus: "DRAFT",
	};
}

async function createOrUpdateDraft(payload, existingRecords) {
	const published = ensureArray(existingRecords).find(
		(record) => String(record?.publicationStatus || "").toUpperCase() === "PUBLISHED" && record?.templateKey === payload.templateKey,
	);

	if (published && !shouldForce) {
		return {
			record: published,
			skipped: true,
			reason: "Published next-gen storefront already exists for this brand/template.",
		};
	}

	const created = unwrapRecord(
		await requestJson("manage/brand-storefronts", {
			method: "POST",
			auth: "bearer",
			body: payload,
		}),
	);

	return {
		record: created,
		skipped: false,
	};
}

async function transitionStorefront(id, action, body = {}) {
	return unwrapRecord(
		await requestJson(`manage/brand-storefronts/${id}/${action}`, {
			method: "POST",
			auth: "bearer",
			body,
		}),
	);
}

async function verifyPublicStorefront(brandId, expectedTemplateKey) {
	const payload = unwrapRecord(
		await requestJson(`brands/${brandId}/storefront`, {
			auth: "public",
		}),
	);

	const templateKey = normalizeText(payload?.templateKey, "");
	const publicationStatus = normalizeText(payload?.publicationStatus, "");

	if (templateKey !== expectedTemplateKey) {
		throw new Error(
			`Public storefront template mismatch. Expected '${expectedTemplateKey}', received '${templateKey || "(empty)"}'.`,
		);
	}

	if (publicationStatus && publicationStatus.toUpperCase() !== "PUBLISHED") {
		throw new Error(`Public storefront is not published. Received publicationStatus='${publicationStatus}'.`);
	}

	return payload;
}

async function main() {
	if (argv.includes("--help")) {
		console.log(usage.trim());
		return;
	}

	if (shouldApply && !BEARER_TOKEN) {
		throw new Error(
			"XAP_TOKEN is required for --apply. The current .env still contains placeholder values, so live seeding is blocked until a real admin bearer token is provided.",
		);
	}

	const sourceBrand = await resolveBrandByRef(SOURCE_BRAND_REF, "public");
	const targetBrand = await resolveBrandByRef(TARGET_BRAND_REF, shouldApply ? "bearer" : "public");
	const legacy = await fetchLegacyLandingByBrand(sourceBrand.id);
	const collections = await fetchBrandCollections(targetBrand.id);
	const requestedTemplateKey = resolveBrandMarketTemplateKey(TEMPLATE_OVERRIDE || legacy?.templateKey || "editorial-hero");
	const previewAssetId = normalizeText(targetBrand?.logoId || targetBrand?.catalogId || legacy?.heroMediaId, "");
	const storefrontPayload = buildStorefrontPayload({
		brand: targetBrand,
		legacy,
		collections,
		templateKey: requestedTemplateKey,
	});

	if (!shouldApply) {
		const templateChecks = await Promise.all(
			BRAND_MARKET_TEMPLATE_KEYS.map(async (templateKey) => ({
				templateKey,
				exists: Boolean(await lookupTemplateCatalog(templateKey)),
			})),
		);

		console.log(JSON.stringify({
			mode: "dry-run",
			sourceBrand: {
				id: sourceBrand.id,
				key: sourceBrand.key,
				brandName: sourceBrand.brandName,
			},
			targetBrand: {
				id: targetBrand.id,
				key: targetBrand.key,
				brandName: targetBrand.brandName,
			},
			requestedTemplateKey,
			templateCatalog: templateChecks,
			storefrontPlan: {
				assetRefCount: storefrontPayload.assetRefs.length,
				productSelectionCount: storefrontPayload.productSelections.length,
				localeSections: Object.keys(storefrontPayload.localeContent.en),
				route: buildBrandRoute(targetBrand),
			},
			storefrontPayload: shouldDumpPayload ? storefrontPayload : undefined,
		}, null, 2));
		return;
	}

	if (shouldDumpPayload) {
		console.log(JSON.stringify({
			mode: "payload-debug",
			requestedTemplateKey,
			storefrontPayload,
		}, null, 2));
	}

	for (const templateKey of BRAND_MARKET_TEMPLATE_KEYS) {
		await upsertTemplateCatalog(templateKey, previewAssetId);
	}

	const existingRecords = await lookupStorefrontRecordsByBrand(targetBrand.id);
	const { record: draftRecord, skipped, reason } = await createOrUpdateDraft(storefrontPayload, existingRecords);

	let publishedRecord = draftRecord;
	if (!skipped) {
		const submitted = await transitionStorefront(draftRecord.id, "submit");
		const approved = await transitionStorefront(submitted.id, "approve", {
			reviewNotes: "Seeded from published legacy brand-landing content into the next-generation storefront model.",
		});
		publishedRecord = await transitionStorefront(approved.id, "publish", {
			reviewNotes: "Published by next-generation storefront seed script.",
		});
	}

	const publicPayload = await verifyPublicStorefront(targetBrand.id, requestedTemplateKey);

	console.log(JSON.stringify({
		mode: "apply",
		targetBrand: {
			id: targetBrand.id,
			key: targetBrand.key,
			brandName: targetBrand.brandName,
		},
		requestedTemplateKey,
		skipped,
		reason: skipped ? reason : undefined,
		storefrontRecord: {
			id: publishedRecord?.id,
			publicationStatus: publishedRecord?.publicationStatus,
			templateKey: publishedRecord?.templateKey,
		},
		publicRoute: buildBrandRoute(targetBrand),
		verification: {
			publicTemplateKey: publicPayload?.templateKey,
			publicPublicationStatus: publicPayload?.publicationStatus,
			hasLocaleContent: Boolean(publicPayload?.localeContent),
		},
	}, null, 2));
}

main().catch((error) => {
	console.error(error.message);
	if (error.payload) {
		console.error(JSON.stringify(error.payload, null, 2));
	}
	process.exit(1);
});
