import { z } from "zod";

export const currencySchema = z.object({
  currencyCode: z
    .string()
    .min(3, "currencies.validation.currencyCodeRequired")
    .max(3, "currencies.validation.currencyCodeMax")
    .toUpperCase(),
  name: z
    .string()
    .min(1, "currencies.validation.currencyNameRequired")
    .max(100, "currencies.validation.currencyNameMax"),
  nameAr: z.string()
    .min(1, "currencies.validation.currencyNameRequired")
    .max(100, "currencies.validation.currencyNameMax"),
  decimalPlaces: z
    .number()
    .min(0, "currencies.validation.decimalPlacesMin")
    .max(10, "currencies.validation.decimalPlacesMax"),
  symbol: z
    .string()
    .min(1, "currencies.validation.symbolRequired")
    .max(5, "currencies.validation.symbolMax"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
