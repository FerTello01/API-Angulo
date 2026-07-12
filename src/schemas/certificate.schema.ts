import { z } from 'zod';

export const issueCertificateSchema = z.object({
  companyTaxId: z
    .string()
    .min(3, 'companyTaxId must be at least 3 characters')
    .max(32, 'companyTaxId must not exceed 32 characters')
    .regex(/^[A-Z0-9-]+$/i, 'companyTaxId must be alphanumeric'),
  impactCategory: z
    .string()
    .min(2, 'impactCategory is required')
    .max(64, 'impactCategory must not exceed 64 characters'),
  amount: z
    .number()
    .positive('amount must be a positive number')
    .or(z.string().regex(/^\d+(\.\d+)?$/, 'amount must be a valid numeric string')),
  evidence: z
    .object({
      description: z.string().min(10).max(2000),
      metrics: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
      attachments: z.array(z.string().url()).optional(),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
