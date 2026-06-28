import { z } from "zod";

const inventoryFormSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  phoneNumber: z.string().min(7, "Phone number is required"),
  countryId: z.string().min(1, "Country is required"),
  cityId: z.string().min(1, "City is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  storageSpace: z.coerce
    .number()
    .min(1, "Storage space must be at least 1"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export default inventoryFormSchema;