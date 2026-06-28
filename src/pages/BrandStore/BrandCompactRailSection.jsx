import React from "react";

import BrandMediaRail from "./BrandMediaRail";

const BrandCompactRailSection = ({
  sectionId,
  title,
  brands = [],
  landingById = {},
  onSelectBrand,
}) => {
  if (!brands.length) {
    return null;
  }

  return (
    <section
      className="brand-compact-section"
      data-brand-section={sectionId}
      aria-label={title}
    >
      <div className="brand-store-section__header">
        <h2 className="section-title">{title}</h2>
      </div>

      <BrandMediaRail
        brands={brands}
        landingById={landingById}
        onSelectBrand={onSelectBrand}
        showSaleBadge
      />
    </section>
  );
};

export default BrandCompactRailSection;
