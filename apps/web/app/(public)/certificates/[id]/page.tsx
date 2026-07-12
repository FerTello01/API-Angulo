'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  type ApiCertificate,
  getCertificate,
  getEasScanUrl,
} from '@/lib/api-client'
import {
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  FileSearch,
} from 'lucide-react'

const statusConfig = {
  CONFIRMED: {
    icon: CheckCircle2,
    label: 'Certificado confirmado on-chain',
    className: 'bg-brand-lime-light text-[oklch(0.28_0.1_152)] border border-[oklch(0.72_0.18_130)/30]',
  },
  PROCESSING: {
    icon: Clock,
    label: 'Attestation en proceso',
    className: 'bg-brand-blue-light text-[oklch(0.28_0.12_245)] border border-[oklch(0.48_0.14_245)/30]',
  },
  FAILED: {
    icon: XCircle,
    label: 'Emisión fallida',
    className: 'bg-[oklch(0.96_0.02_25)] text-[oklch(0.42_0.18_27)] border border-[oklch(0.57_0.22_27)/25]',
  },
} as const

export default function CertificateDetailPage() {
  const params = useParams<{ id: string }>()
  const [cert, setCert] = useState<ApiCertificate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCertificate(params.id)
        setCert(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Certificado no encontrado')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 flex justify-center">
        <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !cert) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <XCircle className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-2xl">Certificado no encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Link href="/verify" className={buttonVariants({ className: 'mt-6' })}>
          Ir a verificar
        </Link>
      </div>
    )
  }

  const conf = statusConfig[cert.status]
  const StatusIcon = conf.icon

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 mb-8 ${conf.className}`}>
        <StatusIcon className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{conf.label}</p>
          {cert.status === 'FAILED' && cert.errorMessage && (
            <p className="text-xs opacity-80 mt-0.5">{cert.errorMessage}</p>
          )}
        </div>
        <Link href={`/verify?cert=${cert.id}`} className="flex items-center gap-1 text-xs font-medium hover:underline shrink-0">
          <FileSearch className="h-3.5 w-3.5" />
          Verificar
        </Link>
      </div>

      <Card className="overflow-hidden p-0 mb-6">
        <div className="bg-[oklch(0.22_0.04_155)] px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lime/20">
                <ShieldCheck className="h-6 w-6 text-brand-lime" />
              </div>
              <div>
                <p className="text-[oklch(0.75_0.025_150)] text-xs font-medium uppercase tracking-wider">
                  Certificado de Impacto Proofact
                </p>
                <p className="font-mono text-sm font-semibold text-[oklch(0.95_0.01_150)] mt-0.5 break-all">{cert.id}</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-lime/20 px-3 py-1 text-xs font-semibold text-brand-lime capitalize">
              {cert.status.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Empresa (Tax ID)</p>
              <p className="mt-1 font-medium">{cert.companyTaxId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Categoría de impacto</p>
              <p className="mt-1 font-medium capitalize">{cert.impactCategory.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Monto</p>
              <p className="mt-1 font-medium">{cert.amount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">IPFS CID</p>
              <p className="mt-1 font-mono text-xs break-all">{cert.ipfsCid}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">On-chain (Base + EAS)</p>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Certificate hash</p>
                <p className="font-mono text-xs mt-0.5 break-all">{cert.certificateHash}</p>
              </div>
              {cert.attestationUID && (
                <div>
                  <p className="text-xs text-muted-foreground">Attestation UID</p>
                  <p className="font-mono text-xs mt-0.5 break-all">{cert.attestationUID}</p>
                </div>
              )}
              {cert.txHash && (
                <div>
                  <p className="text-xs text-muted-foreground">Transaction hash</p>
                  <p className="font-mono text-xs mt-0.5 break-all">{cert.txHash}</p>
                </div>
              )}
              {cert.blockNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Block number</p>
                  <p className="font-mono text-xs mt-0.5">{cert.blockNumber}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Creado</p>
              <p className="mt-0.5">{new Date(cert.createdAt).toLocaleString('es-MX')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actualizado</p>
              <p className="mt-0.5">{new Date(cert.updatedAt).toLocaleString('es-MX')}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        {cert.attestationUID && (
          <a
            href={getEasScanUrl(cert.attestationUID)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants()}
          >
            Ver en EAS Scan <ExternalLink className="ml-1.5 h-4 w-4" />
          </a>
        )}
        <Link href="/developers" className={buttonVariants({ variant: 'outline' })}>
          Documentación API <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
