/** JSON Schemas compartidos para OpenAPI — deben reflejar Zod en certificate.schema.ts */

export const evidenceSchema = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      minLength: 10,
      maxLength: 2000,
      description: 'Descripción textual de la evidencia. Obligatorio si se envía `evidence`.',
      example: 'Compensación de 15 toneladas CO2e mediante reforestación en Chiapas, Q1 2026',
    },
    metrics: {
      type: 'object',
      additionalProperties: true,
      description: 'Métricas clave-valor libres (no van on-chain tal cual).',
      example: { co2e_tons: 15, region: 'MX-CHI', methodology: 'VCS' },
    },
    attachments: {
      type: 'array',
      items: { type: 'string', format: 'uri' },
      description: 'URLs a documentos de respaldo.',
      example: ['https://storage.example.com/reports/q1-2026.pdf'],
    },
  },
} as const;

export const issueCertificateBodySchema = {
  type: 'object',
  required: ['companyTaxId', 'impactCategory', 'amount'],
  properties: {
    companyTaxId: {
      type: 'string',
      minLength: 3,
      maxLength: 32,
      pattern: '^[A-Za-z0-9-]+$',
      description: 'Identificador fiscal de la empresa (RFC, NIT, VAT, etc.). Alfanumérico y guiones.',
      example: 'ABC123456XYZ',
    },
    impactCategory: {
      type: 'string',
      minLength: 2,
      maxLength: 64,
      description:
        'Categoría de impacto. Convenciones: carbon_offset, water_restoration, reforestation, renewable_energy, waste_reduction, biodiversity, social_impact.',
      example: 'carbon_offset',
    },
    amount: {
      oneOf: [{ type: 'number', minimum: 0, exclusiveMinimum: true }, { type: 'string', pattern: '^\\d+(\\.\\d+)?$' }],
      description: 'Cantidad de impacto certificado (unidades según categoría). Entero o decimal positivo.',
      example: 15000,
    },
    evidence: evidenceSchema,
    metadata: {
      type: 'object',
      additionalProperties: true,
      description: 'Metadatos del cliente. No se escriben on-chain.',
      example: { internalRef: 'CERT-2026-0042', department: 'sustainability' },
    },
  },
} as const;

export const issueCertificateResponseSchema = {
  type: 'object',
  required: ['certificateId', 'certificateHash', 'status', 'ipfsCid', 'message'],
  properties: {
    certificateId: { type: 'string', format: 'uuid', description: 'UUID para polling con GET /api/v1/certificates/:id' },
    certificateHash: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$', description: 'Hash bytes32 off-chain determinístico' },
    status: { type: 'string', enum: ['PROCESSING'], description: 'Siempre PROCESSING en la respuesta inicial' },
    ipfsCid: { type: 'string', description: 'CID IPFS con la evidencia serializada' },
    message: { type: 'string' },
  },
  example: {
    certificateId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    certificateHash: '0x8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8',
    status: 'PROCESSING',
    ipfsCid: 'bafybeig8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a1b2c3d4',
    message: 'Certificate issuance accepted. On-chain attestation is being processed by the relayer.',
  },
} as const;

export const certificateRecordSchema = {
  type: 'object',
  required: [
    'id',
    'certificateHash',
    'companyTaxId',
    'impactCategory',
    'amount',
    'ipfsCid',
    'status',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'string', format: 'uuid' },
    certificateHash: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' },
    companyTaxId: { type: 'string' },
    impactCategory: { type: 'string' },
    amount: { type: 'string', description: 'Siempre string en la respuesta de consulta' },
    ipfsCid: { type: 'string' },
    status: { type: 'string', enum: ['PROCESSING', 'CONFIRMED', 'FAILED'] },
    attestationUID: {
      type: 'string',
      pattern: '^0x[a-fA-F0-9]{64}$',
      description: 'Presente cuando status=CONFIRMED. Verificable en EAS Scan.',
    },
    txHash: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$', description: 'Presente cuando status=CONFIRMED' },
    blockNumber: { type: 'string', description: 'Presente cuando status=CONFIRMED' },
    errorMessage: { type: 'string', description: 'Presente cuando status=FAILED' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const certificateExamples = {
  processing: {
    summary: 'PROCESSING — attestation en curso',
    value: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      certificateHash: '0x8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8',
      companyTaxId: 'ABC123456XYZ',
      impactCategory: 'carbon_offset',
      amount: '15000',
      ipfsCid: 'bafybeig8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a1b2c3d4',
      status: 'PROCESSING',
      createdAt: '2026-07-12T08:00:00.000Z',
      updatedAt: '2026-07-12T08:00:00.000Z',
    },
  },
  confirmed: {
    summary: 'CONFIRMED — attestation EAS en Base',
    value: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      certificateHash: '0x8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8',
      companyTaxId: 'ABC123456XYZ',
      impactCategory: 'carbon_offset',
      amount: '15000',
      ipfsCid: 'bafybeig8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a1b2c3d4',
      status: 'CONFIRMED',
      attestationUID: '0xff08bbf3d3e6e0992fc70ab9b9370416be59e87897c3d42b20549901d2cccc3e',
      txHash: '0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: '1234567',
      createdAt: '2026-07-12T08:00:00.000Z',
      updatedAt: '2026-07-12T08:00:05.000Z',
    },
  },
  failed: {
    summary: 'FAILED — error on-chain',
    value: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      certificateHash: '0x8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8',
      companyTaxId: 'ABC123456XYZ',
      impactCategory: 'carbon_offset',
      amount: '15000',
      ipfsCid: 'bafybeig8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a1b2c3d4',
      status: 'FAILED',
      errorMessage: 'Relayer wallet has insufficient ETH on Base for gas',
      createdAt: '2026-07-12T08:00:00.000Z',
      updatedAt: '2026-07-12T08:00:03.000Z',
    },
  },
} as const;

export const validationErrorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string', enum: ['VALIDATION_ERROR'] },
    details: {
      type: 'object',
      additionalProperties: { type: 'array', items: { type: 'string' } },
    },
  },
  example: {
    error: 'VALIDATION_ERROR',
    details: {
      companyTaxId: ['companyTaxId must be at least 3 characters'],
      amount: ['amount must be a positive number'],
    },
  },
} as const;

export const notFoundErrorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string', enum: ['NOT_FOUND'] },
    message: { type: 'string' },
  },
  example: {
    error: 'NOT_FOUND',
    message: 'Certificate a1b2c3d4-e5f6-7890-abcd-ef1234567890 not found',
  },
} as const;
