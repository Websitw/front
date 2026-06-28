import { z } from 'zod';

export const regionSchema = z.object({
  regionCode: z.string()
    .min(2, 'regions.validation.regionCodeRequired')
    .max(3, 'regions.validation.regionCodeMaxLength')
    .regex(/^[A-Z]{2,3}$/, 'regions.validation.regionCodeFormat'),
  name: z.string()
    .min(1, 'regions.validation.regionNameRequired')
    .max(100, 'regions.validation.regionNameMaxLength'),
  nameAr:z.string()
    .min(1, 'regions.validation.regionNameRequired')
    .max(100, 'regions.validation.regionNameMaxLength'),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),

});