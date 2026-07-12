import type { FastifyInstance } from 'fastify';
import { issueCertificateSchema } from '../schemas/certificate.schema.js';
import {
  getCertificateById,
  issueCertificate,
} from '../services/certificate.service.js';
import {
  certificateRecordSchema,
  issueCertificateBodySchema,
  issueCertificateResponseSchema,
  notFoundErrorSchema,
  validationErrorSchema,
} from '../openapi/schemas.js';

export async function registerCertificateRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/v1/certificates/issue', {
    schema: {
      summary: 'Emitir certificado de impacto',
      description: `Registra un nuevo certificado de impacto corporativo.

**Flujo:**
1. Valida el payload (Zod)
2. Sube evidencia a IPFS (mock en dev)
3. Responde \`202\` con \`certificateId\` y \`status: PROCESSING\`
4. En background, el relayer emite attestation EAS en Base

**Polling:** consulta \`GET /api/v1/certificates/:id\` cada 3–5 s hasta \`CONFIRMED\` o \`FAILED\`.

**Categorías sugeridas:** \`carbon_offset\`, \`water_restoration\`, \`reforestation\`, \`renewable_energy\`, \`waste_reduction\`, \`biodiversity\`, \`social_impact\``,
      tags: ['certificates'],
      body: issueCertificateBodySchema,
      response: {
        202: {
          description: 'Certificado aceptado — attestation en proceso',
          ...issueCertificateResponseSchema,
        },
        400: {
          description: 'Error de validación del payload',
          ...validationErrorSchema,
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

  app.get('/api/v1/certificates/:id', {
    schema: {
      summary: 'Consultar estado del certificado',
      description: `Obtiene el estado actual del certificado.

Usar para **polling** tras la emisión. Detener cuando \`status\` sea \`CONFIRMED\` o \`FAILED\`.

| Estado | Campos adicionales |
|---|---|
| \`PROCESSING\` | — |
| \`CONFIRMED\` | \`attestationUID\`, \`txHash\`, \`blockNumber\` |
| \`FAILED\` | \`errorMessage\` |

Verificar on-chain: [base-sepolia.easscan.org](https://base-sepolia.easscan.org) con el \`attestationUID\`.`,
      tags: ['certificates'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'certificateId devuelto en POST /issue',
            example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          },
        },
      },
      response: {
        200: {
          description: 'Estado del certificado (PROCESSING, CONFIRMED o FAILED)',
          ...certificateRecordSchema,
        },
        404: {
          description: 'Certificado no encontrado',
          ...notFoundErrorSchema,
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
