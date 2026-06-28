import { z } from 'zod';

export const AdminSchema = z.object({
  userName : z.string()
    .min(1, 'user.validation.userNameRequired')
    .min(3, 'user.validation.userNameMin')
    .max(30, 'user.validation.userNameMax'),
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

  phoneNumber: z.string()
    .min(1, 'user.validation.phoneRequired')
    .regex(/^[0-9]{9}$/, 'user.validation.phoneInvalid'),
  role: z.string()
    .min(1, 'user.validation.roleRequired')
});

export const getAdminDefaultValues = () => ({
  userName: '',
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  phoneNumber: '',
  role: ''
});