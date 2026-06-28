import { z } from "zod";

export const citySchema = z.object({
  cityNameEn: z
    .string()
    .min(1, "cities.validation.cityNameEnRequired")
    .max(100, "cities.validation.cityNameEnMax"),
  cityNameAr: z
    .string()
    .min(1, "cities.validation.cityNameArRequired")
    .max(100, "cities.validation.cityNameArMax"),
  cityCode: z
    .string()
    .max(10, "cities.validation.cityCodeMax")
    .optional()
    .or(z.literal("")),
  // countryId: z.string().min(1, "cities.validation.countryRequired"),
  latitude: z.string().min(1, "cities.validation.locationRequired"),
  isCapital: z.boolean().optional().default(false),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
