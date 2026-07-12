import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge, VerificationLevelBadge, MetricTypeBadge } from '@/components/impact/badges'
import {
  mockOrganizations,
  mockProjects,
  mockMetrics,
  mockCertificates,
  mockValidators,
  mockMethodologies,
  mockEvidences,
  mockValidationRequests,
} from '@/lib/mock-data'
import type { ImpactMetric } from '@/lib/types'
import {
  Building2,
  Globe,
  MapPin,
  CalendarDays,
  Users,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  BarChart3,
  BookOpen,
  TrendingUp,
  Clock,
} from 'lucide-react'

// ─── Metric declaration type labels ───────────────────────────────────────────

const declarationLabels: Record<string, string> = {
  verificado: 'Verificado externamente',
  en_revision: 'En verificación',
  pendiente: 'Declarado',
  borrador: 'Borrador',
}

// ─── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: ImpactMetric }) {
  const methodology = mockMethodologies.find((m) => m.id === metric.metodologiaId)
  const pct = Math.round((metric.valorActual / metric.valorMeta) * 100)

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <MetricTypeBadge type={metric.tipo} size="sm" />
            <StatusBadge status={metric.estado} size="sm" />
          </div>
          <h4 className="font-semibold text-sm text-foreground leading-snug">{metric.nombre}</h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{metric.descripcion}</p>
        </div>
      </div>

      {/* Value display */}
      <div className="flex items-end gap-3">
        <div>
          <p className="font-heading text-2xl font-normal text-foreground">
            {metric.valorActual.toLocaleString('es-MX')}
          </p>
          <p className="text-xs text-muted-foreground">{metric.unidad}</p>
        </div>
        <div className="flex-1 pb-1">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Línea base: {metric.valorLinea}</span>
            <span>Meta: {metric.valorMeta.toLocaleString('es-MX')}</span>
          </div>
          <Progress value={pct} className="h-1.5" />
          <p className="mt-1 text-[10px] text-muted-foreground text-right">{pct}% de la meta</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-3 text-xs">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Periodo</p>
          <p className="font-medium text-foreground mt-0.5">{metric.periodo}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Declaración</p>
          <p className="font-medium text-foreground mt-0.5">{declarationLabels[metric.estado] ?? metric.estado}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Metodología</p>
          <p className="font-medium text-foreground mt-0.5">{methodology?.nombre ?? '—'}</p>
        </div>
      </div>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const org = mockOrganizations.find((o) => o.slug === slug)
  if (!org) notFound()

  const projects = mockProjects.filter((p) => p.organizacionId === org.id)
  const metrics = mockMetrics.filter((m) => m.organizacionId === org.id)
  const certs = mockCertificates.filter((c) => c.organizacionId === org.id)
  const requests = mockValidationRequests.filter((r) => r.organizacionId === org.id)
  const evidences = mockEvidences.filter((e) =>
    projects.some((p) => p.id === e.proyectoId)
  )
  const validatorIds = [...new Set(certs.map((c) => c.emisorId))]
  const validators = mockValidators.filter((v) => validatorIds.includes(v.id))
  const methodologyIds = [...new Set(metrics.map((m) => m.metodologiaId).filter(Boolean))]
  const methodologies = mockMethodologies.filter((m) => methodologyIds.includes(m.id))

  const verifiedMetrics = metrics.filter((m) => m.estado === 'verificado').length
  const pendingMetrics = metrics.filter((m) => m.estado !== 'verificado').length

  return (
    <div className="min-h-screen">
      {/* ── Cover + org header ──────────────────────────────────────────── */}
      <div className="h-36 w-full bg-[oklch(0.22_0.04_155)]" />
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 -mt-12 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-background bg-card shadow-md">
              <Building2 className="h-9 w-9 text-muted-foreground" />
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-normal text-foreground md:text-3xl">
                  {org.nombre}
                </h1>
                {org.verificacionNivel && (
                  <VerificationLevelBadge level={org.verificacionNivel} />
                )}
                <StatusBadge status={org.verificacionEstado} />
              </div>
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {org.ciudad}, {org.pais}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <a href={org.sitioWeb} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Globe className="mr-1.5 h-3.5 w-3.5" />
              Sitio web
              <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Org description + quick stats */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-base text-foreground leading-relaxed">{org.descripcion}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {org.etiquetas.map((t) => (
                <span key={t} className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Fundada en {new Date(org.fundadaEn).getFullYear()}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {org.empleados} empleados
              </div>
            </div>
          </div>

          {/* Trust summary card */}
          <Card className="p-5 border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Resumen de confianza
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Proyectos', value: org.proyectos },
                { label: 'Métricas verificadas', value: verifiedMetrics },
                { label: 'Certificados activos', value: certs.filter((c) => c.estado === 'activo').length },
                { label: 'En revisión', value: pendingMetrics },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-xl font-normal text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div>
              <p className="text-xs text-muted-foreground mb-2">ODS alineados</p>
              <div className="flex flex-wrap gap-1">
                {org.ods.map((n) => (
                  <span key={n} className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.22_0.04_155)] text-[10px] font-bold text-[oklch(0.85_0.06_150)]">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <Tabs defaultValue="metrics" className="pb-16">
          <TabsList className="mb-6 h-auto flex-wrap gap-1 bg-muted p-1">
            <TabsTrigger value="metrics" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Métricas ({metrics.length})
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Proyectos ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Certificados ({certs.length})
            </TabsTrigger>
            <TabsTrigger value="methodologies" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Metodologías
            </TabsTrigger>
            <TabsTrigger value="validators" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Validadores
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Evidencia
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Metrics tab */}
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {metrics.map((m) => (
                <MetricCard key={m.id} metric={m} />
              ))}
            </div>
          </TabsContent>

          {/* Projects tab */}
          <TabsContent value="projects">
            <div className="flex flex-col gap-4">
              {projects.map((proj) => (
                <Link key={proj.id} href={`/projects/${proj.id}`}>
                  <Card className="group flex items-start justify-between gap-4 p-5 transition-shadow hover:shadow-sm">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <StatusBadge status={proj.estado} size="sm" />
                        <span className="text-xs text-muted-foreground">{proj.fechaInicio.slice(0, 4)}{proj.fechaFin ? ` — ${proj.fechaFin.slice(0, 4)}` : ' — presente'}</span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {proj.nombre}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {proj.descripcion}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{proj.ciudad}</span>
                        <span>{proj.beneficiarios.toLocaleString('es-MX')} beneficiarios</span>
                        <span>{proj.metricasCount} métricas · {proj.evidenciasCount} evidencias</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Certificates tab */}
          <TabsContent value="certificates">
            <div className="flex flex-col gap-4">
              {certs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay certificados emitidos aún.</p>
              ) : (
                certs.map((cert) => (
                  <Link key={cert.id} href={`/certificates/${cert.id}`}>
                    <Card className="group flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green-light">
                          <CheckCircle2 className="h-5 w-5 text-[oklch(0.38_0.12_152)]" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-semibold text-muted-foreground">{cert.numero}</p>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            Certificado nivel <span className="capitalize">{cert.nivel}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Emitido: {new Date(cert.emitidoEn).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                            &ensp;·&ensp;
                            Expira: {new Date(cert.expiraEn).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <VerificationLevelBadge level={cert.nivel} size="sm" />
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          {/* Methodologies tab */}
          <TabsContent value="methodologies">
            <div className="flex flex-col gap-4">
              {methodologies.map((meth) => (
                <Card key={meth.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{meth.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {meth.organizacionEmisora} · v{meth.version}
                      </p>
                    </div>
                    <a
                      href={meth.urlReferencia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline shrink-0"
                    >
                      Ver estándar <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{meth.descripcion}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {meth.tiposMetrica.map((t) => (
                      <MetricTypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Validators tab */}
          <TabsContent value="validators">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {validators.map((v) => (
                <Card key={v.id} className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[oklch(0.22_0.04_155)] text-[oklch(0.85_0.06_150)] text-sm font-semibold">
                        {v.nombre[0]}{v.apellido[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{v.nombre} {v.apellido}</p>
                      <p className="text-xs text-muted-foreground">{v.organizacion}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {v.especialidades.map((e) => (
                      <MetricTypeBadge key={e} type={e} size="sm" />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{v.verificacionesRealizadas} verificaciones</span>
                    <span>★ {v.calificacion}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {v.certificaciones.map((c) => (
                      <span key={c} className="rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Evidence tab */}
          <TabsContent value="evidence">
            <div className="flex flex-col gap-3">
              {evidences.map((ev) => (
                <Card key={ev.id} className="flex items-start gap-4 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm text-foreground">{ev.titulo}</p>
                      <StatusBadge status={ev.estado} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{ev.descripcion}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground font-mono">{ev.archivoNombre}</p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 text-right">
                    <p>{new Date(ev.subidaEn).toLocaleDateString('es-MX')}</p>
                    {ev.verificadaEn && (
                      <p className="text-[10px] text-[oklch(0.38_0.12_152)]">Verificada</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History tab */}
          <TabsContent value="history">
            <div className="flex flex-col gap-3">
              {requests.flatMap((r) => r.historial).sort((a, b) =>
                new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
              ).map((ev) => (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 pb-4 border-b border-border last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{ev.autorNombre}</p>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {new Date(ev.creadoEn).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{ev.contenido}</p>
                    {ev.estadoAnterior && ev.estadoNuevo && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusBadge status={ev.estadoAnterior} size="sm" />
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <StatusBadge status={ev.estadoNuevo} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
