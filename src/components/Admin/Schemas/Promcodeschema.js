import { z } from 'zod';

export const promoCodeSchema = z.object({
  name: z.string()
    .min(1, 'Promo code name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  code: z.string()
    .min(3, 'Promo code must be at least 3 characters')
    .max(20, 'Promo code must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Promo code must contain only uppercase letters and numbers'),
  
  discountType: z.string()
    .min(1, 'Discount type is required'),
  
  discountValue: z.number()
    .min(0, 'Discount value must be at least 0'),
  
  expiryDate: z.string()
    .min(1, 'Expiry date is required'),
  
  status: z.string()
    .min(1, 'Status is required'),
  
  maxRedemptions: z.number()
    .min(1, 'Maximum redemptions must be at least 1')
    .int('Maximum redemptions must be a whole number'),

  timesRedeemed: z.number().optional().default(0),
}).refine((data) => {
  if (data.discountType === 'percentage') {
    return data.discountValue <= 100;
  }
  return true;
}, {
  message: 'Percentage discount cannot exceed 100',
  path: ['discountValue'],
});

export const promoCodeSchemaEdit = promoCodeSchema.safeExtend({
  id: z.string().optional(),
});