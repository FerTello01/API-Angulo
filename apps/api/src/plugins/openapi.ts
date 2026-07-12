import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';
import { env } from '../config/env.js';

const API_DESCRIPTION = `
API REST B2B de **Proofact** para certificar impacto ambiental y social.

## Inicio rápido

\`\`\`bash
# 1. Emitir
curl -X POST http://localhost:3000/api/v1/certificates/issue \\
  -H "Content-Type: application/json" \\
  -d '{"companyTaxId":"ABC123456XYZ","impactCategory":"carbon_offset","amount":15000,
       "evidence":{"description":"15 toneladas CO2e compensadas Q1 2026"}}'

# 2. Polling (cada 3-5s)
curl http://localhost:3000/api/v1/certificates/{certificateId}

# 3. Verificar on-chain
# https://base-sepolia.easscan.org/attestation/view/{attestationUID}
\`\`\`

## Principio B2B — sin Web3

Tu empresa **no necesita wallet, llaves privadas ni pagar gas**. Proofact actúa como relayer operacional en Base.

## Estados del certificado

| Estado | Significado |
|---|---|
| \`PROCESSING\` | Aceptado. Attestation EAS en curso. |
| \`CONFIRMED\` | On-chain. Incluye \`attestationUID\`. |
| \`FAILED\` | Error. Ver \`errorMessage\`. |

## Validación del request

| Campo | Reglas |
|---|---|
| \`companyTaxId\` | 3–32 chars, alfanumérico |
| \`impactCategory\` | 2–64 chars |
| \`amount\` | Número positivo o string decimal |
| \`evidence.description\` | 10–2000 chars (si envías evidence) |

## Documentación

- Guía narrativa: [${env.WEB_APP_URL}/developers](${env.WEB_APP_URL}/developers)
- Verificar certificado: [${env.WEB_APP_URL}/verify](${env.WEB_APP_URL}/verify)
- Markdown técnico: [GitHub docs/INTEGRATION.md](https://github.com/FerTello01/API-Angulo/blob/main/docs/INTEGRATION.md)
`.trim();

export async function registerOpenApiDocs(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Proofact Impact Certification API',
        description: API_DESCRIPTION,
        version: '1.0.0',
        contact: {
          name: 'Proofact',
          url: 'https://github.com/FerTello01/API-Angulo',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Desarrollo local',
        },
        {
          url: 'https://api.proofact.example.com',
          description: 'Producción (configurar)',
        },
      ],
      tags: [
        {
          name: 'system',
          description: 'Health check y estado del servicio',
        },
        {
          name: 'certificates',
          description: 'Emisión (`POST /issue`) y consulta (`GET /:id`) de certificados de impacto',
        },
      ],
      externalDocs: {
        description: 'Guía de integración Proofact',
        url: `${env.WEB_APP_URL}/developers`,
      },
    },
  });

  await app.register(scalar, {
    routePrefix: '/docs',
    configuration: {
      theme: 'purple',
      layout: 'modern',
      defaultHttpClient: {
        targetKey: 'javascript',
        clientKey: 'fetch',
      },
    },
  });
}
