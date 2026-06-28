export const getBrandMarketRef = (brand) => {
  if (!brand) {
    return "";
  }

  if (typeof brand === "string") {
    return brand;
  }

  return brand.slug || brand.key || brand.id || brand.brandId || "";
};

export const buildBrandMarketPath = (brand) => {
  const ref = getBrandMarketRef(brand);
  return ref ? `/brands/${encodeURIComponent(ref)}` : "/brand-stores";
};

export const buildBrandMarketPreviewPath = (brand, storefrontId = "") => {
  const path = buildBrandMarketPath(brand);
  if (path === "/brand-stores") {
    return path;
  }

  const params = new URLSearchParams();
  params.set("preview", "1");

  const brandId =
    typeof brand === "string" ? "" : brand?.id || brand?.brandId || "";
  if (brandId) {
    params.set("brandId", String(brandId));
  }
  if (storefrontId) {
    params.set("storefrontId", String(storefrontId));
  }

  return `${path}?${params.toString()}`;
};

export const isBrandMarketPath = (pathname = "") =>
  pathname.startsWith("/brands/") || pathname.startsWith("/BrandTemplate");
