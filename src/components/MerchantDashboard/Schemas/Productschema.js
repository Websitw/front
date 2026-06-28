import { z } from "zod";



export const wholesaleTierSchema = z.object({
  minQty: z.coerce.number().min(1).default(5),
  price: z.coerce.number().min(0).default(0),
  priceType: z.string().default("VALUE"),
});

export const variantSchema = z.object({
  name: z.string().min(1),
  code: z.string().default(""),
  barcode: z.string().default(""),
  listPrice: z.coerce.number().min(0.01, "List price is required"),
  costPrice: z.coerce.number().min(0.01, "Cost price is required"),
  salePercent: z.coerce.number().nullable().default(null),
  stock: z.coerce.number().min(0).default(0),
  tags: z.array(z.string()).default(["READY"]),
  images: z.array(z.any()).min(1, "At least one variant image is required"),
  weight: z.coerce.number().min(0.01, "Weight is required"),
  length: z.coerce.number().min(0.01, "Length is required"),
  width: z.coerce.number().min(0.01, "Width is required"),
  height: z.coerce.number().min(0.01, "Height is required"),
  wholesaleTiers: z.array(wholesaleTierSchema).default([]),
});

const optionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  values: z.array(z.string()).min(1, "At least one value required"),
});


export const productSchema = z.object({
  // Tab 1: General
  titleEn: z.string().min(1, "Product name (English) is required"),
  titleAr: z.string().min(1, "Product name (Arabic) is required"),
  descriptionEn: z.string().optional().default(""),
  descriptionAr: z.string().optional().default(""),
  brandId: z.string().min(1, "Brand is required"),
  taxId: z.string().min(1, "Tax class is required"),
  comment: z.string().optional().default(""),
  productType: z.string().optional().default(""),
  categoryId: z.string().min(1, "Category is required"),
  segmentId: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  mediaList: z.array(z.any()).min(1, "At least one product image is required"),
  options: z.array(optionSchema).optional().default([]),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  originCountryCode: z.string().min(1, "Origin country is required"),
  hsCode: z.string().optional().default(""),
  fulfillBy: z.string().default("MERCHANT"),
  fulfillmentTimeInDays: z.coerce.number().min(1).default(1),
  shippingInstructions: z.array(z.string()).optional().default([]),
  shippableCountries: z.array(z.string()).min(1, "At least one shippable country is required"),
  moq: z.coerce.number().min(1).default(1),
  packQty: z.coerce.number().min(1).default(1),
  allowGiftWrap: z.boolean().default(false),
  selectedCountry: z.string().optional().default("all"),
  // Tab 5: Marketing & Publishing
  metaTitleEn: z.string().optional().default(""),
  metaTitleAr: z.string().optional().default(""),
  metaDescriptionEn: z.string().optional().default(""),
  metaDescriptionAr: z.string().optional().default(""),
  sections: z
    .array(
      z.object({
        titleEn: z.string().optional().default(""),
        titleAr: z.string().optional().default(""),
        contentEn: z.string().optional().default(""),
        contentAr: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
  // Sidebar
  returnable: z.boolean().default(true),
  isCouponApplicable: z.boolean().default(true),
  allowBackOrder: z.boolean().default(false),
});

//  Default values

export const productDefaultValues = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  brandId: "",
  taxId: "",
  comment: "",
  productType: "",
  categoryId: "",
  segmentId: "",
  tags: [],
  mediaList: [],
  options: [],
  variants: [],
  originCountryCode: "",
  hsCode: "",
  fulfillBy: "MERCHANT",
  fulfillmentTimeInDays: 1,
  shippingInstructions: [],
  shippableCountries: [],
  moq: 1,
  packQty: 1,
  allowGiftWrap: false,
  selectedCountry: "all",
  metaTitleEn: "",
  metaTitleAr: "",
  metaDescriptionEn: "",
  metaDescriptionAr: "",
  sections: [],
  returnable: true,
  isCouponApplicable: true,
  allowBackOrder: false,
};

//  Per-step validation fields

export const STEP_FIELDS = {
  1: ["titleEn", "titleAr", "brandId", "taxId", "categoryId"],
  2: ["mediaList"],
  3: ["variants"],
  4: ["originCountryCode", "shippableCountries", "fulfillBy", "fulfillmentTimeInDays", "moq", "packQty"],
  5: [],
};


export const createDefaultVariant = (name, index) => ({
  name,
  code: `SKU-${index}`,
  barcode: "",
  listPrice: 0,
  costPrice: 0,
  salePercent: null,
  stock: 0,
  tags: ["READY"],
  images: [],
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  wholesaleTiers: [],
});

export function transformToBackendBody(formData, { merchantId, storeId, defaultCountryCode = "JO" }) {
  return {
    brandId: formData.brandId,
    merchantId,
    segmentId: formData.segmentId,
    categoryId: formData.categoryId,
    taxId: formData.taxId,
    priceIncludesTax: true,
    allowGiftWrap: formData.allowGiftWrap,
    allowBackOrder: formData.allowBackOrder,
    fulfillBy: formData.fulfillBy,
    fulfillmentTimeInDays: formData.fulfillmentTimeInDays,
    storeId: storeId || "",
    title: formData.titleEn,
    title_i18n: { en: formData.titleEn, ar: formData.titleAr },
    description: formData.descriptionEn || null,
    description_i18n: formData.descriptionEn
      ? { en: formData.descriptionEn, ar: formData.descriptionAr || formData.descriptionEn }
      : null,
    status: "DRAFT",
    comment: formData.comment || null,
    shippableCountries: formData.shippableCountries,
    hsCode: formData.hsCode || null,
    metaTitle: formData.metaTitleEn || null,
    metaTitle_i18n: formData.metaTitleEn
      ? { en: formData.metaTitleEn, ar: formData.metaTitleAr || formData.metaTitleEn }
      : null,
    metaDescription: formData.metaDescriptionEn || null,
    metaDescription_i18n: formData.metaDescriptionEn
      ? { en: formData.metaDescriptionEn, ar: formData.metaDescriptionAr || formData.metaDescriptionEn }
      : null,
    catalogId: null,
    tags: formData.tags?.length ? formData.tags : null,
    originCountryCode: formData.originCountryCode,
    isActive: true,
    shippingInstructions: formData.shippingInstructions?.length ? formData.shippingInstructions : null,
    productType: formData.productType || null,
    returnable: formData.returnable,
    isCouponApplicable: formData.isCouponApplicable,
    mediaList: (formData.mediaList || []).map((img, i) => ({
      mediaId: img.mediaId || "",
      type: "IMAGE",
      altText: img.altText || "",
      sortOrder: i + 1,
    })),
    productSectionList: formData.sections?.length
      ? formData.sections.map((s) => ({
          title: s.titleEn || "",
          title_i18n: { en: s.titleEn || "", ar: s.titleAr || s.titleEn || "" },
          description: s.contentEn || "",
          description_i18n: { en: s.contentEn || "", ar: s.contentAr || s.contentEn || "" },
        }))
      : null,
    skus: (formData.variants || []).map((v) => ({
      code: v.code || null,
      barcode: v.barcode || null,
      moq: formData.moq || 1,
      packQty: formData.packQty || 1,
      dimensions: {
        length: v.length || 0,
        width: v.width || 0,
        height: v.height || 0,
        unit: "cm",
      },
      weight: { value: v.weight || 0, unit: "kg" },
      status: "DRAFT",
      comment: null,
      mediaList: (v.images || []).map((img, i) => ({
        mediaId: img.mediaId || "",
        type: "IMAGE",
        altText: img.altText || "",
        sortOrder: i + 1,
      })),
      attributeValues: buildAttributeValues(v.name, formData.options),
      price: {
        [defaultCountryCode]: {
          countryCode: defaultCountryCode,
          listPrice: v.listPrice || 0,
          costPrice: v.costPrice || 0,
          ...(v.salePercent ? { salePercent: v.salePercent } : {}),
          ...(v.wholesaleTiers?.length
            ? {
                wholesalePriceList: v.wholesaleTiers.map((t) => ({
                  minQty: t.minQty,
                  price: t.price,
                  priceType: t.priceType || "VALUE",
                })),
              }
            : {}),
        },
      },
      inventory: {
        onHand: v.stock || 0,
        reserved: 0,
        safetyStock: 0,
        reorderPoint: 0,
      },
    })),
  };
}

// build attributeValues from variant name + options

export function buildAttributeValues(variantName, options) {
  if (!options || !variantName) return [];
  const parts = variantName.split(" / ");
  return (options || []).map((opt, i) => ({
    key: opt.name.toLowerCase(),
    label_i18n: { en: opt.name, ar: opt.nameAr || opt.name },
    valueKey: (parts[i] || "").toLowerCase(),
    value_i18n: { en: parts[i] || "", ar: parts[i] || "" },
    isVariant: true,
  }));
}

function extractOptionsFromSkus(skus) {
  const optionsMap = new Map();
  for (const sku of skus) {
    for (const attr of sku.attributeValues || []) {
      if (!optionsMap.has(attr.key)) {
        optionsMap.set(attr.key, { name: attr.label_i18n?.en || attr.key, valuesSet: new Set() });
      }
      const val = attr.value_i18n?.en || attr.valueKey || "";
      if (val) optionsMap.get(attr.key).valuesSet.add(val);
    }
  }
  return Array.from(optionsMap.values()).map(({ name, valuesSet }) => ({
    name,
    values: Array.from(valuesSet),
  }));
}

function buildVariantNameFromAttributes(attributeValues) {
  return (attributeValues || [])
    .map((a) => a.value_i18n?.en || a.valueKey || "")
    .join(" / ");
}

export function transformFromApiResponse(product, defaultCountryCode = "JO") {
  const skus = product.skus || [];
  const options = extractOptionsFromSkus(skus);
  const variants = skus.map((sku) => ({
    name: buildVariantNameFromAttributes(sku.attributeValues),
    code: sku.code || "",
    barcode: sku.barcode || "",
    listPrice: sku.price?.[defaultCountryCode]?.listPrice || 0,
    costPrice: sku.price?.[defaultCountryCode]?.costPrice || 0,
    salePercent: sku.price?.[defaultCountryCode]?.salePercent ?? null,
    stock: sku.inventory?.onHand || 0,
    tags: sku.tags || ["READY"],
    images: (sku.mediaList || []).map((m) => ({ mediaId: m.mediaId, altText: m.altText || "" })),
    weight: sku.weight?.value || 0,
    length: sku.dimensions?.length || 0,
    width: sku.dimensions?.width || 0,
    height: sku.dimensions?.height || 0,
    wholesaleTiers: (sku.price?.[defaultCountryCode]?.wholesalePriceList || []).map((t) => ({
      minQty: t.minQty,
      price: t.price,
      priceType: t.priceType || "VALUE",
    })),
  }));

  return {
    titleEn: product.title_i18n?.en || "",
    titleAr: product.title_i18n?.ar || "",
    descriptionEn: product.description_i18n?.en || "",
    descriptionAr: product.description_i18n?.ar || "",
    brandId: product.brandId || "",
    taxId: product.taxId || "",
    comment: product.comment || "",
    productType: product.productType || "",
    categoryId: product.categoryId || "",
    segmentId: product.segmentId || "",
    tags: product.tags || [],
    mediaList: (product.mediaList || []).map((m) => ({ mediaId: m.mediaId, altText: m.altText || "" })),
    options,
    variants,
    originCountryCode: product.originCountryCode || "",
    hsCode: product.hsCode || "",
    fulfillBy: product.fulfillBy || "MERCHANT",
    fulfillmentTimeInDays: product.fulfillmentTimeInDays || 1,
    shippingInstructions: product.shippingInstructions || [],
    shippableCountries: product.shippableCountries || [],
    moq: skus[0]?.moq || 1,
    packQty: skus[0]?.packQty || 1,
    allowGiftWrap: product.allowGiftWrap ?? false,
    selectedCountry: "all",
    metaTitleEn: product.metaTitle_i18n?.en || "",
    metaTitleAr: product.metaTitle_i18n?.ar || "",
    metaDescriptionEn: product.metaDescription_i18n?.en || "",
    metaDescriptionAr: product.metaDescription_i18n?.ar || "",
    sections: (product.productSectionList || []).map((s) => ({
      titleEn: s.title_i18n?.en || "",
      titleAr: s.title_i18n?.ar || "",
      contentEn: s.description_i18n?.en || "",
      contentAr: s.description_i18n?.ar || "",
    })),
    returnable: product.returnable ?? true,
    isCouponApplicable: product.isCouponApplicable ?? true,
    allowBackOrder: product.allowBackOrder ?? false,
  };
}

export function transformDirtyProductToUpdateBody(formData, dirtyFields) {
  const payload = {};
  if (dirtyFields.titleEn || dirtyFields.titleAr) {
    payload.title = formData.titleEn;
    payload.title_i18n = { en: formData.titleEn, ar: formData.titleAr };
  }
  if (dirtyFields.descriptionEn || dirtyFields.descriptionAr) {
    payload.description = formData.descriptionEn || null;
    payload.description_i18n = formData.descriptionEn
      ? { en: formData.descriptionEn, ar: formData.descriptionAr || formData.descriptionEn }
      : null;
  }
  if (dirtyFields.brandId) payload.brandId = formData.brandId;
  if (dirtyFields.taxId) payload.taxId = formData.taxId;
  if (dirtyFields.categoryId) payload.categoryId = formData.categoryId;
  if (dirtyFields.segmentId) payload.segmentId = formData.segmentId;
  if (dirtyFields.tags) payload.tags = formData.tags?.length ? formData.tags : null;
  if (dirtyFields.mediaList) {
    payload.mediaList = formData.mediaList.map((img, i) => ({
      mediaId: img.mediaId || "",
      type: "IMAGE",
      altText: img.altText || "",
      sortOrder: i + 1,
    }));
  }
  if (dirtyFields.comment) payload.comment = formData.comment || null;
  if (dirtyFields.productType) payload.productType = formData.productType || null;
  if (dirtyFields.originCountryCode) payload.originCountryCode = formData.originCountryCode;
  if (dirtyFields.hsCode) payload.hsCode = formData.hsCode || null;
  if (dirtyFields.fulfillBy) payload.fulfillBy = formData.fulfillBy;
  if (dirtyFields.fulfillmentTimeInDays) payload.fulfillmentTimeInDays = formData.fulfillmentTimeInDays;
  if (dirtyFields.shippingInstructions) payload.shippingInstructions = formData.shippingInstructions?.length ? formData.shippingInstructions : null;
  if (dirtyFields.shippableCountries) payload.shippableCountries = formData.shippableCountries;
  if (dirtyFields.moq) payload.moq = formData.moq;
  if (dirtyFields.packQty) payload.packQty = formData.packQty;
  if (dirtyFields.allowGiftWrap) payload.allowGiftWrap = formData.allowGiftWrap;
  if (dirtyFields.allowBackOrder) payload.allowBackOrder = formData.allowBackOrder;
  if (dirtyFields.returnable) payload.returnable = formData.returnable;
  if (dirtyFields.isCouponApplicable) payload.isCouponApplicable = formData.isCouponApplicable;
  if (dirtyFields.metaTitleEn || dirtyFields.metaTitleAr) {
    payload.metaTitle = formData.metaTitleEn || null;
    payload.metaTitle_i18n = formData.metaTitleEn
      ? { en: formData.metaTitleEn, ar: formData.metaTitleAr || formData.metaTitleEn }
      : null;
  }
  if (dirtyFields.metaDescriptionEn || dirtyFields.metaDescriptionAr) {
    payload.metaDescription = formData.metaDescriptionEn || null;
    payload.metaDescription_i18n = formData.metaDescriptionEn
      ? { en: formData.metaDescriptionEn, ar: formData.metaDescriptionAr || formData.metaDescriptionEn }
      : null;
  }
  if (dirtyFields.sections) {
    payload.productSectionList = formData.sections.map((s) => ({
      title: s.titleEn || "",
      title_i18n: { en: s.titleEn || "", ar: s.titleAr || s.titleEn || "" },
      description: s.contentEn || "",
      description_i18n: { en: s.contentEn || "", ar: s.contentAr || s.contentEn || "" },
    }));
  }
  return payload;
}

export function buildSkuUpdatePayload(
  variant,
  options = [],
  { moq = 1, packQty = 1, status = "DRAFT" } = {},
  defaultCountryCode = "JO",
) {
  return {
    code: variant.code || null,
    barcode: variant.barcode || null,
    moq,
    packQty,
    status,
    comment: null,
    dimensions: {
      length: variant.length || 0,
      width: variant.width || 0,
      height: variant.height || 0,
      unit: "cm",
    },
    weight: { value: variant.weight || 0, unit: "kg" },
    mediaList: (variant.images || []).map((img, i) => ({
      mediaId: img.mediaId || "",
      type: "IMAGE",
      altText: img.altText || "",
      sortOrder: i + 1,
    })),
    attributeValues: buildAttributeValues(variant.name, options),
    price: {
      [defaultCountryCode]: {
        countryCode: defaultCountryCode,
        listPrice: variant.listPrice || 0,
        costPrice: variant.costPrice || 0,
        ...(variant.salePercent != null ? { salePercent: variant.salePercent } : {}),
        ...(variant.wholesaleTiers?.length
          ? {
              wholesalePriceList: variant.wholesaleTiers.map((t) => ({
                minQty: t.minQty,
                price: t.price,
                priceType: t.priceType || "VALUE",
              })),
            }
          : {}),
      },
    },
    inventory: {
      onHand: variant.stock || 0,
      reserved: 0,
      safetyStock: 0,
      reorderPoint: 0,
    },
  };
}