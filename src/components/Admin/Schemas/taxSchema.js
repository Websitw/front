import { z } from "zod";

export const taxSchema = z.object({
  taxGroupCode: z
    .string()
    .min(1, "taxes.validation.taxCodeRequired")
    .max(20, "taxes.validation.taxCodeMax")
    .regex(/^[A-Z0-9_]+$/, "taxes.validation.taxCodeFormat"),
  name: z
    .string()
    .min(1, "taxes.validation.taxNameRequired")
    .max(100, "taxes.validation.taxNameMax"),
  rate: z
    .number()
    .min(0, "taxes.validation.rateMin")
    .max(100, "taxes.validation.rateMax")
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => !isNaN(val), "taxes.validation.rateInvalid"),
  countryId: z.string().min(1, "taxes.validation.countryRequired"),
  isDefault: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const getTaxDefaultValues = (tax = null) => {
  if (tax) {
    return {
      taxGroupCode: tax.taxGroupCode || "",
      name: tax.name || "",
      rate: tax.rate || 0,
      countryId: tax.countryId || "",
      isDefault: tax.isDefault || false,
      status: tax.status !== undefined ? tax.status : "ACTIVE",
    };
  }

  return {
    taxGroupCode: "",
    name: "",
    rate: 0,
    countryId: "",
    isDefault: false,
    status: "ACTIVE",
  };
};
