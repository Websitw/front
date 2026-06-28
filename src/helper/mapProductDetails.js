import { imageUrl } from "./helper";

const DEFAULT_COUNTRY = "JO";

const toKey = (attr) =>
  (attr.label_i18n?.en || attr.label).toLowerCase().replace(/\s+/g, "_");

const extractVariantsAndKeys = (skus) => {
  const variantMap = new Map();
  const variantKeys = new Set();

  skus?.forEach((sku) => {
    sku.attributeValues
      ?.filter((attr) => attr.isVariant)
      .forEach((attr) => {
        const key = toKey(attr);
        variantKeys.add(key);

        if (!variantMap.has(key)) {
          variantMap.set(key, {
            key,
            label: attr.label_i18n?.en || attr.label,
            options: [],
          });
        }

        const entry = variantMap.get(key);
        if (!entry.options.some((opt) => opt.value === attr.valueKey)) {
          entry.options.push({
            label: attr.value_i18n?.en || attr.valueKey,
            value: attr.valueKey,
          });
        }
      });
  });

  return { variantAttributes: [...variantMap.values()], variantKeys };
};

const extractStaticAttributes = (skus) => {
  const staticMap = new Map();

  skus?.forEach((sku) => {
    sku.attributeValues
      ?.filter((attr) => !attr.isVariant)
      .forEach((attr) => {
        const key = toKey(attr);
        if (!staticMap.has(key)) {
          staticMap.set(key, {
            key,
            label: attr.label_i18n?.en || attr.label,
            value: attr.value_i18n?.en || attr.valueKey,
          });
        }
      });
  });

  return [...staticMap.values()];
};
const filterMedia = (mediaList) =>
  (mediaList || [])
    .filter((m) => m.type === "IMAGE")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => `${imageUrl}${m.mediaId}`);

const findVideo = (mediaList) =>
  (mediaList || []).find((m) => m.type === "VIDEO" && m.status === "PUBLISHED");

const mapSku = (sku, countryCode = DEFAULT_COUNTRY) => {
  const pricing = sku.price[countryCode] || Object.values(sku.price)[0];
  const variantValues = {};
  sku.attributeValues
    ?.filter((attr) => attr.isVariant)
    .forEach((attr) => {
      variantValues[toKey(attr)] = attr.valueKey;

    });

  const vid = findVideo(sku.mediaList);

  return {
    id: sku.id,
    variantValues,
    isFavorite: sku?.isFavorite,
    salePrice: pricing.salePrice,
    listPrice: pricing.listPrice,
    originalPrice: pricing.originalPrice,
    salePercent: pricing.salePercent,
    currencyCode: pricing.currencyCode,
    hasWholesalePrice: pricing.hasWholesalePrice,
    wholesalePriceList: pricing.wholesalePriceList || [],
    physicalStoreId: sku.inventory?.physicalStoreId || "",
    stock: sku.inventory.availableToSell,
    isStockVisible: sku.inventory.isStockVisible,
    weight: sku.weight ? `${sku.weight.value}${sku.weight.unit}` : "",
    dimensions: sku.dimensions
      ? `${sku.dimensions.length}${sku.dimensions.unit} × ${sku.dimensions.width}${sku.dimensions.unit} × ${sku.dimensions.height}${sku.dimensions.unit}`
      : "",
    barcode: sku.barcode || "",
    mpn: sku.mpn || "",
    images: filterMedia(sku.mediaList),
    videoThumbnail: vid ? `${imageUrl}${vid.mediaId}` : null,
  };
};

export const mapProductDetails = (data) => {
  if (!data) return null;

  const mappedSkus = data.skus?.map((sku) => mapSku(sku)) || [];
  const defaultSku = mappedSkus[0];

  const { variantAttributes, variantKeys } = extractVariantsAndKeys(data.skus);
const staticAttributes = extractStaticAttributes(data.skus);

  const video = findVideo(data.mediaList);

  const howToUseSection = data.productSectionList?.find(
    (s) =>
      s.title?.toLowerCase().includes("how to") ||
      s.title?.toLowerCase().includes("application"),
  );
  return {
    id: data.id,
    name: data.title_i18n?.en || data.title,
    brand: data.brandName,
    category: data.categoryName,
    rating: data.rating || 0,
    reviewCount: data.ratingCount || 0,
    deliverTo: data.store?.storeLocation?.countryName_i18n?.en || "Jordan",
    storeName: data.store?.storeName || "",
    storeCity: data.store?.storeLocation?.cityName_i18n?.en || "",
    currentPrice: defaultSku?.hasWholesalePrice
      ? defaultSku.salePrice
      : defaultSku?.listPrice || 0,
    originalPrice: defaultSku?.originalPrice || 0,
    salePercent: defaultSku?.salePercent || 0,
    currency: defaultSku?.currencyCode || "JOD",
    stock: defaultSku?.stock || 0,
    shippingFee: 0.99,
    merchantId: data.merchantId || data.store?.merchantId || "",
    isWishList: data.isFavorite || false,
    wishlistId: data.wishlistId || null,
    variantAttributes,
    staticAttributes,
    description: data.description_i18n?.en || data.description,
    specs: {
      dimensions: defaultSku?.dimensions || "",
      weight: defaultSku?.weight || "",
      barcode: defaultSku?.barcode || "",
      returnPolicy: data.returnable ? "Returnable" : "Non-Returnable",
    },
    images: filterMedia(data.mediaList),
    videoThumbnail: video ? `${imageUrl}${video.mediaId}` : null,
    howToUse:
      howToUseSection?.description_i18n?.en ||
      howToUseSection?.description ||
      "",
    catalog: data.catalogId ? `${imageUrl}${data.catalogId}` : "",
    reviews: data.reviews || [],
    isOfficialSeller: data.isOfficialSeller || false,
    slug: data.slug,
    skus: mappedSkus,
  };
};

export const findSkuByVariants = (skus, selectedVariants) => {
  if (!skus?.length) return null;

  return skus.find((sku) =>
    Object.entries(selectedVariants).every(
      ([key, value]) => sku.variantValues[key] === value,
    ),
  );
};
