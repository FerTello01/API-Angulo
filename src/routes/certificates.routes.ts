import type { FastifyInstance } from 'fastify';
import { issueCertificateSchema } from '../schemas/certificate.schema.js';
import {
  getCertificateById,
  issueCertificate,
} from '../services/certificate.service.js';

export async function registerCertificateRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /api/v1/certificates/issue
   *
   * Accepts corporate impact data, pins evidence to IPFS (mocked),
   * and triggers an async on-chain attestation via the Gravity relayer.
   */
  app.post('/api/v1/certificates/issue', {
    schema: {
      description: 'Issue a new corporate impact certificate',
      tags: ['certificates'],
      body: {
        type: 'object',
        required: ['companyTaxId', 'impactCategory', 'amount'],
        properties: {
          companyTaxId: { type: 'string', minLength: 3, maxLength: 32 },
          impactCategory: { type: 'string', minLength: 2, maxLength: 64 },
          amount: { oneOf: [{ type: 'number' }, { type: 'string' }] },
          evidence: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              metrics: { type: 'object' },
              attachments: { type: 'array', items: { type: 'string' } },
            },
          },
          metadata: { type: 'object' },
        },
      },
      response: {
        202: {
          type: 'object',
          properties: {
            certificateId: { type: 'string' },
            certificateHash: { type: 'string' },
            status: { type: 'string', enum: ['PROCESSING'] },
            ipfsCid: { type: 'string' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const parsed = issueCertificateSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await issueCertificate(parsed.data);

      return reply.status(202).send(result);
    },
  });

  /**
   * GET /api/v1/certificates/:id
   * Poll certificate status after issuance.
   */
  app.get('/api/v1/certificates/:id', {
    schema: {
      tags: ['certificates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: true,
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const record = getCertificateById(id);

      if (!record) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: `Certificate ${id} not found`,
        });
      }

      return reply.send({
        ...record,
        blockNumber: record.blockNumber?.toString(),
      });
    },
  });
}
