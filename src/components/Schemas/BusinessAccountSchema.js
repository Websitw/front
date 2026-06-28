import { z } from "zod";

export const businessAccountSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  commercialName: z.string().min(1, "Commercial name is required"),
  businessEmail: z
    .string()
    .email("Invalid email address")
    .min(1, "Business email is required"),
  establishmentNumber: z.string().optional(),
  businessPhone:  z
    .string()
    .min(1, "Business phone number is required")
    .regex(/^[0-9]{9,10}$/, "Phone number must be 9-10 digits"),
  countryId: z.string().min(1, "Country is required"),
  industryId: z.string().min(1, "Business industry is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  logoId: z.string().nullable(),
  businessLicenseFile: z.any().nullable().optional(),
  businessStartedDate: z
    .object({
      day: z.string().optional(),
      month: z.string().optional(),
      year: z.string().optional(),
    })
    .optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => {
  return data.logoId !== null || data.businessLicenseFile instanceof File;
}, {
  message: "Business license file is required",
  path: ["businessLicenseFile"],
});