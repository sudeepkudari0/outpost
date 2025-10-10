import * as z from 'zod';

export enum UserRole {
  ADMIN,
  USER,
}

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  firstName: z.string().min(1, {
    message: 'FirstName is required',
  }),
  lastName: z.string().min(1, {
    message: 'LastName is required',
  }),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  whatsapp: z.optional(z.string()),
});
export const PatientRegisterSchema = z.object({
  loginMethod: z.enum(['whatsapp', 'email']),
  email: z.optional(z.string()),
  password: z.optional(z.string()),
  firstName: z.string().min(1, {
    message: 'FirstName is required',
  }),
  lastName: z.string().min(1, {
    message: 'LastName is required',
  }),
  whatsapp: z.optional(z.string()),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Minimum 6 characters required!',
  }),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  email: z.string().email({
    message: 'Valid email is required',
  }),
});

export const SetPasswordSchema = z.object({
  token: z.string().min(1, {
    message: 'Token is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
});

export const signUpSchema = z.object({
  loginMethod: z.enum(['whatsapp', 'email']),
  code: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  age: z.string().min(1, 'Age is required'),
  gender: z.enum(['male', 'female', 'other']),
  lastName: z.string().min(1, 'Last name is required'),
  isVerified: z.boolean().default(false),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
});

// export const SettingsSchema = z
//   .object({
//     name: z.optional(z.string()),
//     isTwoFactorEnabled: z.optional(z.boolean()),
//     role: z.enum([UserRole.ADMIN, UserRole.USER]),
//     email: z.optional(z.string().email()),
//     password: z.optional(z.string().min(6)),
//     newPassword: z.optional(z.string().min(6)),
//   })
//   .refine(
//     (data) => {
//       if (data.password && !data.newPassword) {
//         return false;
//       }

//       return true;
//     },
//     {
//       message: "New password is required!",
//       path: ["newPassword"],
//     }
//   )
//   .refine(
//     (data) => {
//       if (data.newPassword && !data.password) {
//         return false;
//       }

//       return true;
//     },
//     {
//       message: "Password is required!",
//       path: ["password"],
//     }
//   );
