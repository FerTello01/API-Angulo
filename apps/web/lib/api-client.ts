export type CertificateStatus = 'PROCESSING' | 'CONFIRMED' | 'FAILED'

export interface ApiCertificate {
  id: string
  certificateHash: string
  companyTaxId: string
  impactCategory: string
  amount: string
  ipfsCid: string
  status: CertificateStatus
  attestationUID?: string
  txHash?: string
  blockNumber?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface IssueCertificateInput {
  companyTaxId: string
  impactCategory: string
  amount: number | string
  evidence?: {
    description?: string
    metrics?: Record<string, unknown>
    attachments?: string[]
  }
  metadata?: Record<string, unknown>
}

export interface IssueCertificateResponse {
  certificateId: string
  certificateHash: string
  status: 'PROCESSING'
  ipfsCid: string
  message: string
}

export interface ApiError {
  error: string
  message?: string
  details?: Record<string, string[]>
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = data as ApiError
    throw new Error(err.message ?? err.error ?? `API error ${res.status}`)
  }

  return data as T
}

export function getApiBaseUrl(): string {
  return API_BASE
}

export function getOpenApiDocsUrl(): string {
  return `${API_BASE}/docs`
}

export function getEasScanUrl(attestationUID?: string): string {
  const base = 'https://base-sepolia.easscan.org'
  return attestationUID ? `${base}/attestation/view/${attestationUID}` : base
}

export async function issueCertificate(
  input: IssueCertificateInput,
): Promise<IssueCertificateResponse> {
  return apiFetch<IssueCertificateResponse>('/api/v1/certificates/issue', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getCertificate(id: string): Promise<ApiCertificate> {
  return apiFetch<ApiCertificate>(`/api/v1/certificates/${id}`)
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  return apiFetch('/health')
}
