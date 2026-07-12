'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  type ApiCertificate,
  getCertificate,
  getEasScanUrl,
} from '@/lib/api-client'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

type VerifyState = 'idle' | 'loading' | 'confirmed' | 'processing' | 'failed' | 'not_found' | 'error'

function mapApiStatus(cert: ApiCertificate): VerifyState {
  if (cert.status === 'CONFIRMED') return 'confirmed'
  if (cert.status === 'FAILED') return 'failed'
  if (cert.status === 'PROCESSING') return 'processing'
  return 'error'
}

function ConfirmedResult({ cert }: { cert: ApiCertificate }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-xl border border-[oklch(0.72_0.18_130)/40] bg-brand-lime-light px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[oklch(0.38_0.12_152)]" />
        <div>
          <p className="font-semibold text-sm text-[oklch(0.28_0.1_152)]">Certificado confirmado on-chain</p>
          <p className="text-xs text-[oklch(0.4_0.1_152)] mt-0.5">
            Attestation EAS verificable en Base. El impacto está certificado.
          </p>
        </div>
      </div>
      <Card className="p-6">
        <div className="mb-5">
          <p className="font-mono text-xs font-semibold text-muted-foreground">{cert.id}</p>
          <p className="font-heading text-lg font-normal text-foreground mt-0.5 capitalize">
            {cert.impactCategory.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Empresa (Tax ID)</p>
            <p className="font-medium text-foreground mt-0.5">{cert.companyTaxId}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Monto</p>
            <p className="font-medium text-foreground mt-0.5">{cert.amount}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">IPFS CID</p>
            <p className="font-mono font-medium text-foreground mt-0.5 text-[10px] break-all">{cert.ipfsCid}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Attestation UID</p>
            <p className="font-mono font-medium text-foreground mt-0.5 text-[10px] break-all">{cert.attestationUID}</p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-2">
          <Link href={`/certificates/${cert.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Ver detalle completo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
          {cert.attestationUID && (
            <a
              href={getEasScanUrl(cert.attestationUID)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              EAS Scan <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </Card>
    </div>
  )
}

function ProcessingResult({ cert }: { cert: ApiCertificate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-[oklch(0.48_0.14_245)/30] bg-brand-blue-light px-5 py-4">
        <Clock className="h-5 w-5 shrink-0 text-[oklch(0.48_0.14_245)]" />
        <div>
          <p className="font-semibold text-sm text-[oklch(0.28_0.12_245)]">Attestation en proceso</p>
          <p className="text-xs text-[oklch(0.38_0.12_245)] mt-0.5">
            El relayer está emitiendo la attestation EAS en Base. Reintenta en unos segundos.
          </p>
        </div>
      </div>
      <Card className="p-4 text-xs text-muted-foreground">
        <p><strong className="text-foreground">ID:</strong> <span className="font-mono">{cert.id}</span></p>
        <p className="mt-1"><strong className="text-foreground">Categoría:</strong> {cert.impactCategory}</p>
      </Card>
    </div>
  )
}

function FailedResult({ cert }: { cert: ApiCertificate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-[oklch(0.72_0.16_65)/30] bg-brand-amber-light px-5 py-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-[oklch(0.52_0.14_65)]" />
        <div>
          <p className="font-semibold text-sm text-[oklch(0.38_0.13_65)]">Emisión fallida</p>
          <p className="text-xs text-[oklch(0.45_0.12_65)] mt-0.5">
            {cert.errorMessage ?? 'La attestation EAS no pudo completarse.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function NotFoundResult() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-5 py-4">
      <XCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div>
        <p className="font-semibold text-sm text-foreground">Certificado no encontrado</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          No existe ningún certificado con ese UUID. Verifica el certificateId devuelto en la emisión.
        </p>
      </div>
    </div>
  )
}

function ErrorResult({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[oklch(0.57_0.22_27)/25] bg-[oklch(0.96_0.02_25)] px-5 py-4">
      <XCircle className="h-5 w-5 shrink-0 text-[oklch(0.57_0.22_27)]" />
      <div>
        <p className="font-semibold text-sm text-[oklch(0.42_0.18_27)]">Error de conexión</p>
        <p className="text-xs text-[oklch(0.48_0.16_27)] mt-0.5">{message}</p>
      </div>
    </div>
  )
}

function VerifyInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('cert') ?? searchParams.get('id') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [submitted, setSubmitted] = useState(initialQuery !== '')
  const [state, setState] = useState<VerifyState>('idle')
  const [result, setResult] = useState<ApiCertificate | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function doSearch(value: string) {
    if (!value.trim()) return
    setState('loading')
    setSubmitted(true)
    setErrorMsg('')
    setResult(null)

    try {
      const cert = await getCertificate(value.trim())
      setResult(cert)
      setState(mapApiStatus(cert))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      if (message.includes('NOT_FOUND') || message.includes('404')) {
        setState('not_found')
      } else {
        setState('error')
        setErrorMsg(message)
      }
    }
  }

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.replace(`/verify?cert=${encodeURIComponent(query)}`)
    doSearch(query)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.22_0.04_155)]">
          <ShieldCheck className="h-7 w-7 text-brand-lime" />
        </div>
        <h1 className="font-heading text-3xl font-normal text-foreground md:text-4xl">
          Verificar certificado
        </h1>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
          Introduce el <span className="font-mono">certificateId</span> (UUID) devuelto al emitir un certificado
          vía la API Proofact.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            className="pl-9 font-mono text-sm"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={state === 'loading' || !query.trim()}>
          {state === 'loading' ? (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" />
              Buscando…
            </span>
          ) : (
            'Verificar'
          )}
        </Button>
      </form>

      {submitted && state !== 'loading' && state !== 'idle' && (
        <div>
          {state === 'confirmed' && result && <ConfirmedResult cert={result} />}
          {state === 'processing' && result && <ProcessingResult cert={result} />}
          {state === 'failed' && result && <FailedResult cert={result} />}
          {state === 'not_found' && <NotFoundResult />}
          {state === 'error' && <ErrorResult message={errorMsg} />}
        </div>
      )}

      {!submitted && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            ¿Cómo obtener un certificateId?
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Emite un certificado con{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">POST /api/v1/certificates/issue</code>{' '}
            o desde el{' '}
            <Link href="/admin/issue" className="text-primary hover:underline">panel de gestión</Link>.
            La respuesta incluye el UUID en <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">certificateId</code>.
          </p>
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-12 flex justify-center">
        <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyInner />
    </Suspense>
  )
}
