'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  type ApiCertificate,
  getCertificate,
  getEasScanUrl,
} from '@/lib/api-client'
import { getTrackedCertificateIds } from '@/lib/certificate-store'
import { RefreshCw, ExternalLink, ArrowRight, Clock } from 'lucide-react'

const statusBadge: Record<string, string> = {
  PROCESSING: 'bg-brand-blue-light text-[oklch(0.28_0.12_245)]',
  CONFIRMED: 'bg-brand-lime-light text-[oklch(0.28_0.1_152)]',
  FAILED: 'bg-[oklch(0.96_0.02_25)] text-[oklch(0.42_0.18_27)]',
}

function CertificatesInner() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('id')
  const [ids, setIds] = useState<string[]>([])
  const [certs, setCerts] = useState<Record<string, ApiCertificate | 'error'>>({})
  const [polling, setPolling] = useState(false)

  const loadIds = useCallback(() => {
    setIds(getTrackedCertificateIds())
  }, [])

  const refreshAll = useCallback(async (certificateIds: string[]) => {
    setPolling(true)
    const results: Record<string, ApiCertificate | 'error'> = {}
    await Promise.all(
      certificateIds.map(async (id) => {
        try {
          results[id] = await getCertificate(id)
        } catch {
          results[id] = 'error'
        }
      }),
    )
    setCerts(results)
    setPolling(false)
  }, [])

  useEffect(() => {
    loadIds()
  }, [loadIds])

  useEffect(() => {
    if (ids.length > 0) refreshAll(ids)
  }, [ids, refreshAll])

  useEffect(() => {
    const hasProcessing = Object.values(certs).some(
      (c) => c !== 'error' && c.status === 'PROCESSING',
    )
    if (!hasProcessing) return

    const interval = setInterval(() => refreshAll(ids), 5000)
    return () => clearInterval(interval)
  }, [certs, ids, refreshAll])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-normal">Certificados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Certificados emitidos desde este panel (almacenados en el navegador).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshAll(ids)} disabled={polling}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${polling ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/admin/issue" className={buttonVariants({ size: 'sm' })}>
            Emitir nuevo
          </Link>
        </div>
      </div>

      {ids.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No hay certificados emitidos aún.</p>
          <Link href="/admin/issue" className={buttonVariants({ className: 'mt-4' })}>
            Emitir el primero
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {ids.map((id) => {
            const cert = certs[id]
            const isHighlight = id === highlightId

            if (!cert) {
              return (
                <Card key={id} className="p-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="font-mono text-xs">{id}</span>
                </Card>
              )
            }

            if (cert === 'error') {
              return (
                <Card key={id} className="p-4">
                  <p className="font-mono text-xs text-muted-foreground">{id}</p>
                  <p className="text-sm text-destructive mt-1">No se pudo cargar</p>
                </Card>
              )
            }

            return (
              <Card
                key={id}
                className={`p-4 ${isHighlight ? 'ring-2 ring-primary/40' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground break-all">{cert.id}</p>
                    <p className="mt-1 font-medium capitalize">{cert.impactCategory.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cert.companyTaxId} · {cert.amount}</p>
                  </div>
                  <Badge className={statusBadge[cert.status] ?? ''}>{cert.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/certificates/${cert.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    Detalle <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                  {cert.attestationUID && (
                    <a
                      href={getEasScanUrl(cert.attestationUID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      EAS Scan <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminCertificatesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Clock className="h-6 w-6 animate-spin" /></div>}>
      <CertificatesInner />
    </Suspense>
  )
}
