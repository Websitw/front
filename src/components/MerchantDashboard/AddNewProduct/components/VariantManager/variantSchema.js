import { z } from "zod";

export const wholesaleTierSchema = z.object({
  minQuantity: z.coerce.number().min(1).default(10),
  pricePerUnit: z.coerce.number().min(0).default(0),
});

export const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string(),
  price: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().min(0).default(0),
  tags: z.array(z.string()).default(["READY"]),
  images: z.array(z.any()).default([]),
  barcode: z.string().default(""),
  costPrice: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().nullable().default(null),
  retailPrice: z.coerce.number().min(0).default(0),
  weight: z.coerce.number().min(0).default(0),
  length: z.coerce.number().min(0).default(0),
  width: z.coerce.number().min(0).default(0),
  height: z.coerce.number().min(0).default(0),
  wholesaleTiers: z.array(wholesaleTierSchema).default([]),
});

export const variantManagerSchema = z.object({
  options: z
    .array(
      z.object({
        name: z.string().min(1, "Option name is required"),
        values: z.array(z.string()).min(1, "At least one value required"),
      })
    )
    .min(1, "At least one option is required"),
  variants: z.array(variantSchema),
});