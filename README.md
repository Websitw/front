# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Product Docs

- [Dedicated Brand Market Merchandising PRD](docs/PRD-dedicated-brand-market-merchandising.md)

## Preview Seed Script

Use `npm run seed:brand-preview` to seed Sensation catalog data into either isolated preview brands or existing target brands.

Dry run:

```bash
npm run seed:brand-preview
```

Apply against XAP:

```bash
XAP_TOKEN=... \
OWNER_ID=... \
MERCHANT_ID=... \
STORE_ID=... \
npm run seed:brand-preview -- --apply
```

Apply into named live brand routes:

```bash
XAP_TOKEN=... \
MERCHANT_ID=... \
STORE_ID=... \
TARGET_BRAND_REFS=lovely_care,7elements \
TARGET_TEMPLATE_KEYS=editorial-hero,commerce-grid \
npm run seed:brand-preview -- --apply
```

Defaults:

- source workbook: `docs/Sensation_Marketplace_Final_Attributes_Scored.xlsx`
- product sync mode: `sheet`
- generated workbooks: `tmp/brand-preview-imports/`

Optional overrides:

- `TARGET_BRAND_IDS=id1,id2,id3` to reuse existing target brands by id
- `TARGET_BRAND_REFS=lovely_care,7elements` to target existing brands by id, key, or slug
- `TARGET_TEMPLATE_KEYS=editorial-hero,commerce-grid` to assign storefront templates to explicit target brands
- `PRODUCT_LIMIT=12` to limit imported product groups per preview brand
- `XAP_FILE_UPLOAD_URL=https://xapsawa.xapis.com/v1/_filestore` when the file upload endpoint differs
- `PRODUCT_SYNC_MODE=rest` to fall back to direct product POST cloning
- `KEEP_SOURCE_IDENTIFIERS=true` to preserve source `Product key` / `SKU (Code)` / `Barcode`

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
