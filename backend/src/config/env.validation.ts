import { z } from 'zod';

/**
 * Esquema de validación de variables de entorno, aplicado por `@nestjs/config`
 * (opción `validationSchema` de `ConfigModule.forRoot`). Se usa Zod porque
 * `@nestjs/config` v12 valida contra la especificación "Standard Schema"
 * (https://standardschema.dev/), que Zod implementa nativamente (Joi, en la
 * versión instalada, no). Si falta alguna variable crítica, la aplicación
 * falla al boot (fail-fast) en vez de fallar más tarde de forma confusa en
 * medio de una request.
 */
export const envValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerido'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),

  FRONTEND_URL: z.string().optional().default(''),
  ADMIN_URL: z.string().optional().default(''),

  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY es requerido'),
  EMAIL_FROM: z.string().optional().default(''),
  EMAIL_ADMIN: z.string().optional().default(''),
  VOLUNTEER_NOTIFICATION_EMAIL: z.string().optional().default(''),
  VOLUNTEER_FROM_EMAIL: z.string().optional().default(''),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME es requerido'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY es requerido'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET es requerido'),

  EPAYCO_PUBLIC_KEY: z.string().optional().default(''),
  EPAYCO_PRIVATE_KEY: z.string().optional().default(''),
  EPAYCO_CUSTOMER_ID: z.string().min(1, 'EPAYCO_CUSTOMER_ID es requerido'),
  EPAYCO_P_KEY: z.string().min(1, 'EPAYCO_P_KEY es requerido'),
  EPAYCO_TEST_MODE: z.enum(['true', 'false']).default('false'),
});
