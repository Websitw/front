import { z } from "zod";

export const languageSchema = z.object({
  languageCode: z
    .string()
    .min(1, "languages.validation.languageCodeRequired")
    .regex(/^[A-Za-z]{2}$/, "languages.validation.languageCodeFormat")
    .transform(val => val.toLowerCase()),
  name: z
    .string()
    .min(1, "languages.validation.languageNameRequired")
    .max(100, "languages.validation.languageNameMax"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
