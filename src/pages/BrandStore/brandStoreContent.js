export const resolveLocalizedText = (value, language = "en") => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value?.[language] || value?.en || value?.ar || "";
};

export const getBrandImageMediaId = (mediaList = []) =>
  mediaList
    .filter((media) => media?.type === "IMAGE" && media?.mediaId)
    .sort((left, right) => Number(left?.sortOrder || 0) - Number(right?.sortOrder || 0))[0]
    ?.mediaId || "";

export const getLandingBannerMediaId = (landing) =>
  [...(landing?.mainBanner || [])]
    .sort((left, right) => Number(left?.sortOrder || 0) - Number(right?.sortOrder || 0))[0]
    ?.mediaId || "";

export const getBrandShowcaseMediaId = (brand, landing) =>
  getLandingBannerMediaId(landing) ||
  landing?.promoBanner?.mediaId ||
  getBrandImageMediaId(brand?.mediaList) ||
  brand?.logoId ||
  "";

export const getBrandSummary = (brand, landing, language = "en") =>
  resolveLocalizedText(landing?.promoBanner?.subTitle, language) ||
  brand?.brandDescription_i18n?.[language] ||
  brand?.brandDescription ||
  "";

export const getPromoSaleText = (landing, language = "en") => {
  const title = resolveLocalizedText(landing?.promoBanner?.title, language);
  const subTitle = resolveLocalizedText(landing?.promoBanner?.subTitle, language);
  const combined = `${title} ${subTitle}`.trim();

  if (!combined) {
    return "";
  }

  const saleMatch = combined.match(/(\d+)\s*%/);

  if (saleMatch?.[1]) {
    return `${saleMatch[1]}% Sale`;
  }

  if (/(sale|off|deal|خصم|تخفيض)/i.test(combined)) {
    return title || subTitle;
  }

  return "";
};

export const hasPromoOffer = (landing, language = "en") =>
  Boolean(getPromoSaleText(landing, language));
