'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getApiBaseUrl, getOpenApiDocsUrl, getEasScanUrl } from '@/lib/api-client'
import {
  API_VERSION,
  IMPACT_CATEGORIES,
  REQUEST_FIELDS,
  HTTP_ERRORS,
  ONCHAIN_ERRORS,
  CERTIFICATE_STATES,
  LIMITATIONS,
  EXAMPLE_ISSUE_REQUEST,
  EXAMPLE_ISSUE_RESPONSE,
  EXAMPLE_CERT_PROCESSING,
  EXAMPLE_CERT_CONFIRMED,
  EXAMPLE_CERT_FAILED,
  buildCurlIssue,
  buildJsClient,
  buildPythonClient,
} from '@/lib/api-docs'
import {
  ShieldCheck,
  Code2,
  ArrowRight,
  Copy,
  CheckCheck,
  Zap,
  Globe,
  FileText,
  AlertCircle,
  BookOpen,
  Terminal,
  Webhook,
  BarChart3,
  ExternalLink,
  Link2,
  ListChecks,
  Server,
} from 'lucide-react'

type HttpMethod = 'GET' | 'POST'

interface EndpointDoc {
  method: HttpMethod
  path: string
  description: string
  statusCode?: string
  request?: object
  responses: { label: string; status: string; body: object }[]
  notes?: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-[oklch(0.28_0.03_155)] px-2.5 py-1 text-xs text-[oklch(0.75_0.04_155)] hover:bg-[oklch(0.34_0.05_155)]"
      aria-label="Copiar"
    >
      {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative mt-3 rounded-xl bg-[oklch(0.18_0.03_155)] text-[oklch(0.88_0.03_150)]">
      <CopyButton text={code} />
      <pre className="overflow-x-auto p-4 pt-10 text-xs leading-relaxed font-mono">{code}</pre>
    </div>
  )
}

const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-brand-blue-light text-[oklch(0.38_0.14_245)] border border-[oklch(0.48_0.14_245)/25]',
  POST: 'bg-brand-lime-light text-[oklch(0.28_0.1_152)] border border-[oklch(0.72_0.18_130)/25]',
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={cn('inline-block rounded-md px-2.5 py-0.5 text-xs font-mono font-semibold', methodColors[method])}>
      {method}
    </span>
  )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 font-heading text-2xl font-normal text-foreground md:text-3xl text-balance">
      {children}
    </h2>
  )
}

function EndpointCard({ endpoint }: { endpoint: EndpointDoc }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="overflow-hidden p-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/40">
        <MethodBadge method={endpoint.method} />
        <code className="flex-1 text-sm font-mono">{endpoint.path}</code>
        {endpoint.statusCode && <Badge variant="secondary" className="hidden text-xs sm:inline-flex">{endpoint.statusCode}</Badge>}
        <ArrowRight className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="border-t border-border bg-muted/20 px-4 pb-5 pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
          {endpoint.request && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request body</p>
              <CodeBlock code={JSON.stringify(endpoint.request, null, 2)} />
            </div>
          )}
          {endpoint.responses.map((r) => (
            <div key={r.label}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {r.label} <Badge variant="outline" className="ml-1 text-[10px]">{r.status}</Badge>
              </p>
              <CodeBlock code={JSON.stringify(r.body, null, 2)} />
            </div>
          ))}
          {endpoint.notes && (
            <div className="flex items-start gap-2 rounded-lg bg-brand-amber-light px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.55_0.16_65)]" />
              <p className="text-xs text-[oklch(0.38_0.13_65)]">{endpoint.notes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

const API_BASE = getApiBaseUrl()
const DOCS_URL = getOpenApiDocsUrl()
const EAS_SCAN = getEasScanUrl()

const endpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/health',
    description: 'Verifica que la API está operativa. Útil para health checks y monitoreo.',
    statusCode: '200',
    responses: [{ label: 'Respuesta', status: '200', body: { status: 'ok', service: 'proofact-impact-certification-api', timestamp: '2026-07-12T08:00:00.000Z' } }],
  },
  {
    method: 'POST',
    path: '/api/v1/certificates/issue',
    description: 'Emite un certificado. Responde de inmediato con PROCESSING mientras el relayer emite la attestation EAS en background.',
    statusCode: '202',
    request: EXAMPLE_ISSUE_REQUEST,
    responses: [
      { label: 'Aceptado', status: '202', body: EXAMPLE_ISSUE_RESPONSE },
      { label: 'Validación fallida', status: '400', body: { error: 'VALIDATION_ERROR', details: { companyTaxId: ['companyTaxId must be at least 3 characters'] } } },
    ],
    notes: 'Guarda certificateId. Haz polling con GET /api/v1/certificates/:id cada 3–5 segundos.',
  },
  {
    method: 'GET',
    path: '/api/v1/certificates/:id',
    description: 'Consulta el estado. Detén el polling cuando status sea CONFIRMED o FAILED.',
    statusCode: '200',
    responses: [
      { label: 'En proceso', status: '200', body: EXAMPLE_CERT_PROCESSING },
      { label: 'Confirmado', status: '200', body: EXAMPLE_CERT_CONFIRMED },
      { label: 'Fallido', status: '200', body: EXAMPLE_CERT_FAILED },
      { label: 'No encontrado', status: '404', body: { error: 'NOT_FOUND', message: 'Certificate ... not found' } },
    ],
    notes: `Con CONFIRMED, verifica attestationUID en ${EAS_SCAN}`,
  },
]

const sideLinks = [
  { id: 'quickstart', label: 'Inicio rápido', icon: Zap },
  { id: 'prerequisites', label: 'Requisitos', icon: Server },
  { id: 'fields', label: 'Campos del request', icon: ListChecks },
  { id: 'categories', label: 'Categorías', icon: Globe },
  { id: 'states', label: 'Estados', icon: ShieldCheck },
  { id: 'endpoints', label: 'Endpoints', icon: Terminal },
  { id: 'sdks', label: 'Ejemplos de código', icon: Code2 },
  { id: 'errors', label: 'Errores', icon: AlertCircle },
  { id: 'openapi', label: 'OpenAPI', icon: BookOpen },
  { id: 'limitations', label: 'Limitaciones', icon: FileText },
  { id: 'roadmap', label: 'Próximamente', icon: Webhook },
]

export default function DevelopersPage() {
  const [activeSection, setActiveSection] = useState('quickstart')

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[oklch(0.18_0.03_155)] text-[oklch(0.95_0.01_150)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <span className="text-xs font-mono font-semibold text-brand-lime tracking-widest uppercase">Proofact API · {API_VERSION}</span>
          <h1 className="mt-3 font-heading text-4xl font-normal leading-tight md:text-5xl text-balance">
            Documentación de la API de certificación de impacto
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[oklch(0.72_0.025_150)] max-w-2xl">
            Guía completa para integrar Proofact: emitir certificados, hacer polling y validar attestations EAS en Base — sin Web3 para tu empresa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#quickstart" className={cn(buttonVariants({ size: 'lg' }), 'bg-brand-lime text-[oklch(0.15_0.04_155)] font-semibold')}>
              Inicio rápido <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <a
              href="https://github.com/FerTello01/API-Angulo/blob/main/docs/INTEGRATION.md"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-[oklch(0.38_0.12_152)/50] text-[oklch(0.88_0.02_150)] bg-transparent')}
            >
              <BookOpen className="mr-1.5 h-4 w-4" /> Guía de implementación
            </a>
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-[oklch(0.38_0.12_152)/50] text-[oklch(0.88_0.02_150)] bg-transparent')}>
              <ExternalLink className="mr-1.5 h-4 w-4" /> Probar en Scalar
            </a>
          </div>
        </div>
      </section>

      {/* Base URL bar */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base URL</span>
          <code className="rounded-md bg-card px-3 py-1 font-mono border border-border">{API_BASE}</code>
          <Badge variant="secondary">{API_VERSION}</Badge>
          <Badge className="bg-brand-lime-light text-[oklch(0.28_0.1_152)]">REST · JSON</Badge>
          <span className="text-xs text-muted-foreground ml-auto">Auth: ninguna (v1)</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex gap-10">
          <aside className="hidden w-52 shrink-0 lg:block">
            <nav className="sticky top-24 space-y-0.5">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contenidos</p>
              {sideLinks.map((l) => (
                <a key={l.id} href={`#${l.id}`} onClick={() => setActiveSection(l.id)}
                  className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    activeSection === l.id ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-muted')}>
                  <l.icon className="h-3.5 w-3.5" />{l.label}
                </a>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 space-y-16">
            {/* Quickstart */}
            <section id="quickstart">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">01</p>
              <SectionTitle id="quickstart-title">Inicio rápido</SectionTitle>
              <p className="mt-3 mb-5 text-sm text-muted-foreground">
                Guía paso a paso completa con checklist de producción:{' '}
                <a href="https://github.com/FerTello01/API-Angulo/blob/main/docs/INTEGRATION.md" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  docs/INTEGRATION.md ↗
                </a>
              </p>
              <div className="mt-6 space-y-5">
                {[
                  { n: '1', title: 'Emitir certificado', code: buildCurlIssue(API_BASE) },
                  { n: '2', title: 'Polling del estado', code: `curl ${API_BASE}/api/v1/certificates/a1b2c3d4-e5f6-7890-abcd-ef1234567890\n\n# Repetir cada 3-5s hasta status: CONFIRMED o FAILED` },
                  { n: '3', title: 'Verificar en EAS Scan', code: `# Cuando status === "CONFIRMED":\nopen "https://base-sepolia.easscan.org/attestation/view/{attestationUID}"\n\n# O usa la UI pública:\nopen "http://localhost:3001/verify?cert={certificateId}"` },
                ].map((s) => (
                  <div key={s.n}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-lime-light text-xs font-bold text-[oklch(0.28_0.1_152)]">{s.n}</span>
                      <p className="text-sm font-semibold">{s.title}</p>
                    </div>
                    <CodeBlock code={s.code} />
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Prerequisites */}
            <section id="prerequisites">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">02</p>
              <SectionTitle id="prerequisites-title">Requisitos</SectionTitle>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Card className="p-5">
                  <p className="font-semibold text-sm">Para consumir la API (tu integración)</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                    <li>HTTP client (fetch, axios, requests)</li>
                    <li><code className="text-xs">Content-Type: application/json</code></li>
                    <li>Capacidad de polling (cada 3–5 s, timeout 120 s)</li>
                  </ul>
                </Card>
                <Card className="p-5">
                  <p className="font-semibold text-sm">Para operar la API (servidor Proofact)</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                    <li><code className="text-xs">RELAYER_PRIVATE_KEY</code> con ETH en Base</li>
                    <li><code className="text-xs">EAS_IMPACT_SCHEMA_UID</code> registrado</li>
                    <li>Ver <code className="text-xs">docs/DEPLOY-BASE.md</code> en el repo</li>
                  </ul>
                </Card>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Desarrollo local: <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm dev</code> levanta API (:3000) y web (:3001).
              </p>
            </section>

            <Separator />

            {/* Fields */}
            <section id="fields">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">03</p>
              <SectionTitle id="fields-title">Campos del request — POST /issue</SectionTitle>
              <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Campo</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Req.</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Validación</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {REQUEST_FIELDS.map((f) => (
                      <tr key={f.name} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 font-mono text-xs">{f.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{f.type}</td>
                        <td className="px-4 py-2.5">{typeof f.required === 'boolean' ? (f.required ? 'Sí' : 'No') : f.required}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{f.rules}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <Separator />

            {/* Categories */}
            <section id="categories">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">04</p>
              <SectionTitle id="categories-title">Categorías de impacto</SectionTitle>
              <p className="mt-3 text-sm text-muted-foreground">Convenciones recomendadas. La API acepta cualquier string de 2–64 caracteres.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {IMPACT_CATEGORIES.map((c) => (
                  <Card key={c.id} className="p-4">
                    <code className="text-xs font-mono font-semibold text-primary">{c.id}</code>
                    <p className="mt-1 text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Ej. amount: {c.example}</p>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* States */}
            <section id="states">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">05</p>
              <SectionTitle id="states-title">Estados del certificado</SectionTitle>
              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Descripción</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Campos clave</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {CERTIFICATE_STATES.map((s) => (
                      <tr key={s.status}>
                        <td className="px-4 py-3"><Badge variant="outline" className="font-mono">{s.status}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{s.desc}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.fields}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Polling: cada <strong>3–5 s</strong>, timeout sugerido <strong>120 s</strong> (alineado con <code className="text-xs">TX_TIMEOUT_MS</code>).
              </p>
            </section>

            <Separator />

            {/* Endpoints */}
            <section id="endpoints">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">06</p>
              <SectionTitle id="endpoints-title">Referencia de endpoints</SectionTitle>
              <div className="mt-5 space-y-3">
                {endpoints.map((ep) => <EndpointCard key={ep.path + ep.method} endpoint={ep} />)}
              </div>
            </section>

            <Separator />

            {/* Code examples */}
            <section id="sdks">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">07</p>
              <SectionTitle id="sdks-title">Ejemplos de integración</SectionTitle>
              <p className="mt-3 mb-5 text-sm text-muted-foreground">Clientes listos para copiar. Incluyen emisión + polling + manejo de errores.</p>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold mb-1">JavaScript / TypeScript</p>
                  <CodeBlock code={buildJsClient(API_BASE)} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Python</p>
                  <CodeBlock code={buildPythonClient(API_BASE)} />
                </div>
              </div>
            </section>

            <Separator />

            {/* Errors */}
            <section id="errors">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">08</p>
              <SectionTitle id="errors-title">Errores</SectionTitle>
              <h3 className="mt-5 text-sm font-semibold">Errores HTTP</h3>
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {HTTP_ERRORS.map((e) => (
                      <tr key={e.code}>
                        <td className="px-4 py-2.5 w-16"><Badge variant="secondary">{e.http}</Badge></td>
                        <td className="px-4 py-2.5 w-40"><code className="text-xs font-mono">{e.code}</code></td>
                        <td className="px-4 py-2.5 text-muted-foreground">{e.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="mt-6 text-sm font-semibold">Errores on-chain (status FAILED)</h3>
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs uppercase text-muted-foreground">Código</th>
                      <th className="px-4 py-2 text-left text-xs uppercase text-muted-foreground">Causa</th>
                      <th className="px-4 py-2 text-left text-xs uppercase text-muted-foreground">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ONCHAIN_ERRORS.map((e) => (
                      <tr key={e.code}>
                        <td className="px-4 py-2.5 font-mono text-xs">{e.code}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{e.desc}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{e.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <Separator />

            {/* OpenAPI */}
            <section id="openapi">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">09</p>
              <SectionTitle id="openapi-title">OpenAPI 3.1</SectionTitle>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                El spec se genera automáticamente desde los schemas Fastify. Úsalo para Postman, SDKs y validación de contratos.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Card className="p-5">
                  <p className="font-semibold text-sm">Scalar — referencia interactiva</p>
                  <p className="mt-1 text-xs text-muted-foreground">Prueba endpoints en vivo desde el navegador.</p>
                  <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    {DOCS_URL} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Card>
                <Card className="p-5">
                  <p className="font-semibold text-sm">openapi.json</p>
                  <p className="mt-1 text-xs text-muted-foreground">Importar en Postman: File → Import → Link.</p>
                  <a href={`${API_BASE}/openapi.json`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    {API_BASE}/openapi.json <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Card>
              </div>
            </section>

            <Separator />

            {/* Limitations */}
            <section id="limitations">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">10</p>
              <SectionTitle id="limitations-title">Limitaciones actuales (v1)</SectionTitle>
              <ul className="mt-4 space-y-2">
                {LIMITATIONS.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[oklch(0.55_0.16_65)]" />{l}
                  </li>
                ))}
              </ul>
            </section>

            <Separator />

            {/* Roadmap */}
            <section id="roadmap">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">11</p>
              <SectionTitle id="roadmap-title">Próximamente</SectionTitle>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {['API Keys / JWT', 'Webhooks certificate.confirmed', 'GET /certificates?taxId=', 'Revocación EAS', 'Upload de evidencia'].map((f) => (
                  <div key={f} className="flex items-center gap-3 rounded-xl border border-dashed p-4">
                    <Badge variant="outline" className="text-xs">Próximamente</Badge>
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 rounded-2xl bg-[oklch(0.22_0.04_155)] p-8 text-[oklch(0.95_0.01_150)]">
                <h3 className="font-heading text-xl">Prueba sin código</h3>
                <p className="mt-2 text-sm text-[oklch(0.72_0.025_150)]">Emite y verifica certificados desde el panel o la UI pública.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/admin/issue" className={cn(buttonVariants(), 'bg-brand-lime text-[oklch(0.15_0.04_155)] font-semibold')}>
                    Panel de gestión <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                  <Link href="/verify" className={cn(buttonVariants({ variant: 'outline' }), 'border-[oklch(0.38_0.12_152)/50] text-[oklch(0.88_0.02_150)] bg-transparent')}>
                    Verificar certificado
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
