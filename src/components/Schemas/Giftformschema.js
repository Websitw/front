import { z } from "zod";

export const giftFormSchema = z
  .object({
    packagingId: z.string().min(1, "Please select a gift paper"),
    recipientPhoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{7,15}$/, "Enter a valid phone number"),
    giftMessage: z.string().optional(),
    senderName: z.string().min(1, "Your name is required"),
    deliveryDateType: z.enum(["ORDER", "CUSTOM"]),
    deliveryDate: z.string().optional(),
    addressType: z.enum(["ORDER", "CUSTOM"]),
    countryId: z.string().optional(),
    cityId: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryDateType === "CUSTOM") {
      if (!data.deliveryDate) {
        ctx.addIssue({
          path: ["deliveryDate"],
          code: z.ZodIssueCode.custom,
          message: "Delivery date is required",
        });
      }
    }

    if (data.addressType === "CUSTOM") {
      if (!data.countryId) {
        ctx.addIssue({
          path: ["countryId"],
          code: z.ZodIssueCode.custom,
          message: "Country is required",
        });
      }
      if (!data.cityId) {
        ctx.addIssue({
          path: ["cityId"],
          code: z.ZodIssueCode.custom,
          message: "City is required",
        });
      }
      if (!data.addressLine1) {
        ctx.addIssue({
          path: ["addressLine1"],
          code: z.ZodIssueCode.custom,
          message: "Address line 1 is required",
        });
      }
    }
  });