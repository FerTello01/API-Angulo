'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { issueCertificate } from '@/lib/api-client'
import { trackIssuedCertificate } from '@/lib/certificate-store'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export default function AdminIssuePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ certificateId: string; status: string } | null>(null)

  const [companyTaxId, setCompanyTaxId] = useState('')
  const [impactCategory, setImpactCategory] = useState('carbon_offset')
  const [amount, setAmount] = useState('')
  const [evidenceDescription, setEvidenceDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await issueCertificate({
        companyTaxId,
        impactCategory,
        amount: Number(amount) || amount,
        evidence: evidenceDescription
          ? { description: evidenceDescription }
          : undefined,
      })
      trackIssuedCertificate(response.certificateId)
      setResult({ certificateId: response.certificateId, status: response.status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al emitir certificado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-heading text-3xl font-normal">Emitir certificado</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Llama a <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">POST /api/v1/certificates/issue</code>
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="taxId">Tax ID de la empresa</Label>
            <Input
              id="taxId"
              value={companyTaxId}
              onChange={(e) => setCompanyTaxId(e.target.value)}
              placeholder="ABC123456XYZ"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría de impacto</Label>
            <Input
              id="category"
              value={impactCategory}
              onChange={(e) => setImpactCategory(e.target.value)}
              placeholder="carbon_offset"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Monto / cantidad</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="15000"
              required
            />
          </div>
          <div>
            <Label htmlFor="evidence">Descripción de evidencia</Label>
            <Textarea
              id="evidence"
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              placeholder="15 toneladas CO2e compensadas Q1 2026"
              rows={3}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Emitiendo…' : 'Emitir certificado'}
          </Button>
        </form>
      </Card>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-[oklch(0.72_0.18_130)/40] bg-brand-lime-light p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-[oklch(0.38_0.12_152)]" />
            <p className="font-semibold text-sm text-[oklch(0.28_0.1_152)]">Certificado aceptado</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Estado: <strong>{result.status}</strong>
          </p>
          <p className="mt-1 font-mono text-xs break-all">{result.certificateId}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/admin/certificates?id=${result.certificateId}`}
              className={buttonVariants({ size: 'sm' })}
            >
              Monitorear estado <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
            <Link href={`/verify?cert=${result.certificateId}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Verificar
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
