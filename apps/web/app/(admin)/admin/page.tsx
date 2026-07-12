'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { FilePlus, ShieldCheck, BookOpen, ExternalLink } from 'lucide-react'
import { getOpenApiDocsUrl } from '@/lib/api-client'
import { getTrackedCertificateIds } from '@/lib/certificate-store'

export default function AdminDashboardPage() {
  const trackedCount = typeof window !== 'undefined' ? getTrackedCertificateIds().length : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-normal">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona certificados de impacto corporativo vía la API Proofact.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Certificados emitidos</p>
          <p className="mt-2 text-3xl font-semibold">{trackedCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">En esta sesión del navegador</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">API Status</p>
          <p className="mt-2 text-lg font-semibold text-[oklch(0.38_0.12_152)]">Base + EAS</p>
          <p className="mt-1 text-xs text-muted-foreground">Relayer operacional activo</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Versión API</p>
          <p className="mt-2 text-lg font-semibold">v1</p>
          <p className="mt-1 text-xs text-muted-foreground">3 endpoints disponibles</p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/issue" className="group">
          <Card className="p-6 transition-colors hover:border-primary/40">
            <FilePlus className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-semibold">Emitir certificado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Envía datos de impacto y dispara una attestation EAS en Base.
            </p>
          </Card>
        </Link>
        <Link href="/admin/certificates" className="group">
          <Card className="p-6 transition-colors hover:border-primary/40">
            <ShieldCheck className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-semibold">Ver certificados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitorea estados con polling y enlaces a EAS Scan.
            </p>
          </Card>
        </Link>
        <Link href="/developers" className="group">
          <Card className="p-6 transition-colors hover:border-primary/40">
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-semibold">Documentación API</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Guía de integración, ejemplos curl y flujo B2B.
            </p>
          </Card>
        </Link>
        <a href={getOpenApiDocsUrl()} target="_blank" rel="noopener noreferrer" className="group">
          <Card className="p-6 transition-colors hover:border-primary/40">
            <ExternalLink className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-semibold">Scalar (OpenAPI)</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Referencia interactiva para probar endpoints en vivo.
            </p>
          </Card>
        </a>
      </div>
    </div>
  )
}
