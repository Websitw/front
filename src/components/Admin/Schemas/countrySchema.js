import { z } from "zod";

// Schema for Step 1: Country Info
export const countrySchema = z.object({
  regionId: z.string().min(1, "countries.validation.regionIDRequired"),
  nameEn: z
    .string()
    .min(1, "countries.validation.nameEnRequired")
    .max(100, "countries.validation.nameEnMax"),
  nameAr: z
    .string()
    .min(1, "countries.validation.nameArRequired")
    .max(100, "countries.validation.nameArMax"),
  countryCodeNumeric: z
    .union([z.number(), z.string()])
    .refine(
      (val) => val !== "" && val !== null && val !== undefined && val !== 0,
      { message: "countries.validation.countryCodeNumericRequired" }
    )
    .transform((val) => {
      if (typeof val === "string") {
        return Number(val);
      }
      return val;
    })
    .pipe(
      z
        .number()
        .int("countries.validation.countryCodeNumericInteger")
        .min(100, "countries.validation.countryCodeNumericMin")
        .max(999, "countries.validation.countryCodeNumericMax")
    ),
  countryCode: z
    .string()
    .min(2, "countries.validation.countryCodeRequired")
    .max(2, "countries.validation.countryCodeMax")
    .transform((val) => val.toUpperCase()),
  phoneCode: z
    .string()
    .min(1, "countries.validation.phoneCodeRequired")
    .max(10, "countries.validation.phoneCodeMax"),
  flagId: z.any()
    .refine((file) => file !== null && file !== undefined, {
      message: 'countries.validation.flagRequired',
    }),
  bnplEnabled: z.enum([true, false]).default(false),
  codeEnabled: z.enum([true, false]).default(false),
  defaultLanguage: z.string().optional().nullable(),
});
