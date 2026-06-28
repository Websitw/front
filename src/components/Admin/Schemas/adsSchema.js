import { z } from 'zod';

export const adsSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  
  media_type: z.string()
    .min(1, 'Media type is required'),
  
  brand: z.string()
    .min(1, 'Brand is required'),
  
  link: z.string()
    .min(1, 'Link is required')
    .url('Please enter a valid URL'),
  
  mediaFile: z.any()
    .refine((file) => file !== null && file !== undefined, {
      message: 'Media file is required',
    })
    .optional(),
  
  mediaId: z.string().optional(),
});

export const adsSchemaEdit = adsSchema.extend({
  mediaFile: z.any().optional(),
});