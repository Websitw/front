import { z } from 'zod';

export const RegisterSchema = z.object({
  firstName: z.string()
    .min(1, 'user.validation.firstNameRequired')
    .min(2, 'user.validation.firstNameMin')
    .max(50, 'user.validation.firstNameMax'),

  lastName: z.string()
    .min(1, 'user.validation.lastNameRequired')
    .min(2, 'user.validation.lastNameMin')
    .max(50, 'user.validation.lastNameMax'),

  email: z.string()
    .min(1, 'user.validation.emailRequired')
    .email('user.validation.emailInvalid'),

country: z.any()
  .refine(
    (val) => val !== "" && val !== null && val !== undefined && !isNaN(Number(val)),
    { message: 'user.validation.countryRequired' }
  )
  .transform((val) => Number(val)),
  phoneNumber: z.string()
    .min(1, 'user.validation.phoneRequired')
    .regex(/^[0-9]{9}$/, 'user.validation.phoneInvalid'),

 password: z.string()
  .min(1, 'user.validation.passwordRequired')
  .min(8, 'user.validation.passwordMin')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'user.validation.passwordWeak'),
  confirmPassword: z.string()
    .min(1, 'user.validation.confirmPasswordRequired'),

  terms: z.boolean()
    .refine((val) => val === true, {
      message: 'user.validation.termsRequired'
    })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'user.validation.passwordMismatch',
  path: ['confirmPassword'],
});
