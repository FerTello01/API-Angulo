const STORAGE_KEY = 'proofact:issued-certificates'

export function trackIssuedCertificate(certificateId: string): void {
  if (typeof window === 'undefined') return
  const existing = getTrackedCertificateIds()
  if (!existing.includes(certificateId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([certificateId, ...existing]))
  }
}

export function getTrackedCertificateIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function clearTrackedCertificates(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
