import { z } from "zod";

export const exchangeRateSchema = z.object({
  countryId: z.string().min(1, "exchangerate.validation.countryRequired"),
  fromCurrencyId: z
    .string()
    .min(1, "exchangerate.validation.fromCurrencyRequired"),
  toCurrencyId: z.string().min(1, "exchangerate.validation.toCurrencyRequired"),
  fxRate: z
    .string()
    .min(1, "exchangerate.validation.fxRateRequired")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "exchangerate.validation.fxRatePositive",
    }),
  fxRateDate: z
    .union([z.string(), z.date()])
    .transform((val) => {
      if (!val) return "";
      const date = typeof val === "string" ? new Date(val) : val;
      return date.toISOString();
    })
    .refine((val) => val !== "" && val !== "Invalid Date", {
      message: "exchangerate.validation.fxRateDateRequired",
    }),
  source: z
    .string()
    .min(1, "exchangerate.validation.sourceRequired")
    .min(3, "exchangerate.validation.sourceMinLength")
    .max(100, "exchangerate.validation.sourceMaxLength"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});


