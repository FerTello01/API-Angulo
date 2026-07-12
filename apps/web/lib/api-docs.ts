/** Contenido de documentación API — alineado con apps/api/src/schemas/certificate.schema.ts */

export const API_VERSION = 'v1'

export const IMPACT_CATEGORIES = [
  { id: 'carbon_offset', label: 'Compensación de carbono', example: '15000 tCO2e' },
  { id: 'water_restoration', label: 'Restauración de agua', example: '50000 L' },
  { id: 'reforestation', label: 'Reforestación', example: '1200 árboles' },
  { id: 'renewable_energy', label: 'Energía renovable', example: '250 MWh' },
  { id: 'waste_reduction', label: 'Reducción de residuos', example: '8000 kg' },
  { id: 'biodiversity', label: 'Biodiversidad', example: '45 ha protegidas' },
  { id: 'social_impact', label: 'Impacto social', example: '320 empleos' },
] as const

export const REQUEST_FIELDS = [
  { name: 'companyTaxId', type: 'string', required: true, rules: '3–32 chars, alfanumérico y guiones', desc: 'RFC / NIT / VAT de la empresa' },
  { name: 'impactCategory', type: 'string', required: true, rules: '2–64 chars', desc: 'Categoría de impacto (ver tabla abajo)' },
  { name: 'amount', type: 'number | string', required: true, rules: 'Entero o decimal positivo', desc: 'Cantidad certificada' },
  { name: 'evidence', type: 'object', required: false, rules: '—', desc: 'Evidencia de soporte' },
  { name: 'evidence.description', type: 'string', required: 'Si evidence', rules: '10–2000 chars', desc: 'Obligatorio si envías evidence' },
  { name: 'evidence.metrics', type: 'object', required: false, rules: 'clave-valor libre', desc: 'Métricas adicionales' },
  { name: 'evidence.attachments', type: 'string[]', required: false, rules: 'URLs válidas', desc: 'Enlaces a documentos' },
  { name: 'metadata', type: 'object', required: false, rules: '—', desc: 'Datos internos del cliente (no on-chain)' },
] as const

export const HTTP_ERRORS = [
  { http: '400', code: 'VALIDATION_ERROR', desc: 'Payload inválido. Revisa el campo `details`.' },
  { http: '404', code: 'NOT_FOUND', desc: 'El certificateId no existe o el servidor se reinició (store in-memory).' },
] as const

export const ONCHAIN_ERRORS = [
  { code: 'CONFIG_ERROR', desc: 'EAS_IMPACT_SCHEMA_UID no configurado', action: 'pnpm --filter @proofact/api register-schema' },
  { code: 'INSUFFICIENT_FUNDS', desc: 'Relayer sin ETH en Base', action: 'Recargar wallet (faucet Base Sepolia)' },
  { code: 'TX_TIMEOUT', desc: 'Timeout de red Base', action: 'Verificar BASE_RPC_URL' },
  { code: 'TX_REVERTED', desc: 'EAS rechazó la transacción', action: 'Verificar schema UID' },
  { code: 'GAS_ESTIMATION_FAILED', desc: 'Simulación de gas falló', action: 'Revisar parámetros EAS' },
  { code: 'NETWORK_ERROR', desc: 'Error de conectividad RPC', action: 'Verificar BASE_RPC_URL' },
] as const

export const CERTIFICATE_STATES = [
  { status: 'PROCESSING', desc: 'Aceptado. Evidencia en IPFS. Attestation EAS en curso.', fields: 'id, certificateHash, ipfsCid, timestamps' },
  { status: 'CONFIRMED', desc: 'Attestation confirmada en Base.', fields: '+ attestationUID, txHash, blockNumber' },
  { status: 'FAILED', desc: 'Attestation falló.', fields: '+ errorMessage' },
] as const

export const LIMITATIONS = [
  'Almacenamiento in-memory — los certificados se pierden al reiniciar la API',
  'IPFS mock — el CID es simulado en desarrollo',
  'Sin autenticación — no usar en producción pública sin API keys',
  'Sin rate limiting ni idempotencia',
] as const

export const EXAMPLE_ISSUE_REQUEST = {
  companyTaxId: 'ABC123456XYZ',
  impactCategory: 'carbon_offset',
  amount: 15000,
  evidence: {
    description: 'Compensación de 15 toneladas CO2e mediante reforestación en Chiapas, Q1 2026',
    metrics: { co2e_tons: 15, region: 'MX-CHI', methodology: 'VCS' },
    attachments: ['https://storage.example.com/reports/q1-2026.pdf'],
  },
  metadata: { internalRef: 'CERT-2026-0042', department: 'sustainability' },
} as const

export const EXAMPLE_ISSUE_RESPONSE = {
  certificateId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  certificateHash: '0x8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8',
  status: 'PROCESSING',
  ipfsCid: 'bafybeig8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a1b2c3d4',
  message: 'Certificate issuance accepted. On-chain attestation is being processed by the relayer.',
} as const

export const EXAMPLE_CERT_PROCESSING = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  certificateHash: '0x8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8',
  companyTaxId: 'ABC123456XYZ',
  impactCategory: 'carbon_offset',
  amount: '15000',
  ipfsCid: 'bafybeig8f3a2b1c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a1b2c3d4',
  status: 'PROCESSING',
  createdAt: '2026-07-12T08:00:00.000Z',
  updatedAt: '2026-07-12T08:00:00.000Z',
} as const

export const EXAMPLE_CERT_CONFIRMED = {
  ...EXAMPLE_CERT_PROCESSING,
  status: 'CONFIRMED',
  attestationUID: '0xff08bbf3d3e6e0992fc70ab9b9370416be59e87897c3d42b20549901d2cccc3e',
  txHash: '0xabc123def4567890abcdef1234567890abcdef1234567890abcdef1234567890',
  blockNumber: '1234567',
  updatedAt: '2026-07-12T08:00:05.000Z',
} as const

export const EXAMPLE_CERT_FAILED = {
  ...EXAMPLE_CERT_PROCESSING,
  status: 'FAILED',
  errorMessage: 'Relayer wallet has insufficient ETH on Base for gas',
  updatedAt: '2026-07-12T08:00:03.000Z',
} as const

export function buildCurlIssue(apiBase: string): string {
  return `curl -X POST ${apiBase}/api/v1/certificates/issue \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    {
      companyTaxId: 'ABC123456XYZ',
      impactCategory: 'carbon_offset',
      amount: 15000,
      evidence: { description: 'Compensación de 15 toneladas CO2e Q1 2026' },
    },
    null,
    2,
  )}'`
}

export function buildJsClient(apiBase: string): string {
  return `const API_BASE = '${apiBase}'

/** Emite certificado y espera confirmación on-chain (polling). */
async function issueAndWait(datos) {
  const res = await fetch(\`\${API_BASE}/api/v1/certificates/issue\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? \`HTTP \${res.status}\`)
  }

  const { certificateId } = await res.json()
  const deadline = Date.now() + 120_000 // 120s — alineado con TX_TIMEOUT_MS

  while (Date.now() < deadline) {
    const poll = await fetch(\`\${API_BASE}/api/v1/certificates/\${certificateId}\`)
    const cert = await poll.json()

    if (cert.status === 'CONFIRMED') return cert
    if (cert.status === 'FAILED') throw new Error(cert.errorMessage)

    await new Promise((r) => setTimeout(r, 4000))
  }

  throw new Error('Timeout esperando confirmación on-chain')
}

// Uso:
const cert = await issueAndWait({
  companyTaxId: 'ABC123456XYZ',
  impactCategory: 'carbon_offset',
  amount: 15000,
  evidence: { description: '15 toneladas CO2e compensadas Q1 2026' },
})

console.log('Attestation UID:', cert.attestationUID)
console.log('EAS Scan:', \`https://base-sepolia.easscan.org/attestation/view/\${cert.attestationUID}\`)`
}

export function buildPythonClient(apiBase: string): string {
  return `import time
import requests

API_BASE = "${apiBase}"

def issue_and_wait(datos: dict, timeout_s: int = 120) -> dict:
    res = requests.post(f"{API_BASE}/api/v1/certificates/issue", json=datos)
    res.raise_for_status()
    certificate_id = res.json()["certificateId"]
    deadline = time.time() + timeout_s

    while time.time() < deadline:
        cert = requests.get(f"{API_BASE}/api/v1/certificates/{certificate_id}").json()
        if cert["status"] == "CONFIRMED":
            return cert
        if cert["status"] == "FAILED":
            raise RuntimeError(cert.get("errorMessage", "Attestation failed"))
        time.sleep(4)

    raise TimeoutError("Timeout esperando confirmación on-chain")

cert = issue_and_wait({
    "companyTaxId": "ABC123456XYZ",
    "impactCategory": "carbon_offset",
    "amount": 15000,
    "evidence": {"description": "15 toneladas CO2e compensadas Q1 2026"},
})

print("Attestation UID:", cert["attestationUID"])`
}
