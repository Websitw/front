import { z } from "zod";

// Schema for individual tax within a group
const taxEntrySchema = z.object({
  nameEn: z
    .string()
    .min(1, "taxes.validation.taxNameEnRequired")
    .max(100, "taxes.validation.taxNameMax"),
  nameAr: z
    .string()
    .min(1, "taxes.validation.taxNameArRequired")
    .max(100, "taxes.validation.taxNameMax"),
  rate: z
    .string()
    .min(1, "taxes.validation.rateRequired")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
      message: "taxes.validation.rateInvalid",
    }),
  isDefault: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// Schema for tax group
export const taxGroupSchema = z.object({
  taxGroupCode: z
    .string()
    .min(1, "taxes.validation.taxGroupCodeRequired")
    .max(20, "taxes.validation.taxCodeMax"),
  taxes: z
    .array(taxEntrySchema)
    .min(1, "taxes.validation.atLeastOneTaxRequired"),
});

export const getTaxGroupDefaultValues = (taxGroup = null) => {
  if (taxGroup) {
    return {
      taxGroupCode: taxGroup.taxGroupCode || "",
      taxes: taxGroup.taxes || [
        { nameEn: "", nameAr: "", rate: "", isDefault: false },
      ],
    };
  }

  return {
    taxGroupCode: "",
    taxes: [{ nameEn: "", nameAr: "", rate: "", isDefault: false }],
  };
};
