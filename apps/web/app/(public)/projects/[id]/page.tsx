import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { StatusBadge, VerificationLevelBadge, MetricTypeBadge } from '@/components/impact/badges'
import {
  mockProjects,
  mockOrganizations,
  mockMetrics,
  mockEvidences,
  mockCertificates,
  mockMethodologies,
  mockValidationRequests,
} from '@/lib/mock-data'
import {
  MapPin,
  CalendarDays,
  Users,
  BarChart3,
  FileText,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Building2,
  Target,
} from 'lucide-react'

// ─── Evidence type labels ──────────────────────────────────────────────────────

const evidenceTypeLabels: Record<string, string> = {
  documento: 'Documento',
  informe: 'Informe',
  certificado_externo: 'Certificado externo',
  datos_sensor: 'Datos de sensor',
  auditoria: 'Auditoría',
  fotografia: 'Fotografía',
  video: 'Video',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = mockProjects.find((p) => p.id === id)
  if (!project) notFound()

  const org = mockOrganizations.find((o) => o.id === project.organizacionId)
  const metrics = mockMetrics.filter((m) => m.proyectoId === project.id)
  const evidences = mockEvidences.filter((e) => e.proyectoId === project.id)
  const certs = mockCertificates.filter((c) => c.proyectoId === project.id)
  const requests = mockValidationRequests.filter((r) => r.proyectoId === project.id)
  const methodologyIds = [...new Set(metrics.map((m) => m.metodologiaId).filter(Boolean))]
  const methodologies = mockMethodologies.filter((m) => methodologyIds.includes(m.id))

  const timeline = requests
    .flatMap((r) => r.historial)
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        {org && (
          <>
            <Link href={`/organizations/${org.slug}`} className="hover:text-foreground transition-colors hover:underline">
              {org.nombre}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium">{project.nombre}</span>
      </nav>

      {/* ── Project header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={project.estado} />
          {certs.map((c) => (
            <VerificationLevelBadge key={c.id} level={c.nivel} size="sm" />
          ))}
        </div>
        <h1 className="font-heading text-3xl font-normal text-foreground md:text-4xl text-balance">
          {project.nombre}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {project.ciudad}, {project.pais}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(project.fechaInicio).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
            {' — '}
            {project.fechaFin
              ? new Date(project.fechaFin).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
              : 'presente'}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {project.beneficiarios.toLocaleString('es-MX')} beneficiarios
          </span>
        </div>
      </div>

      {/* Description + Objective */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Descripción</p>
            <p className="text-base text-foreground leading-relaxed">{project.descripcion}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <Target className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Objetivo</p>
                <p className="text-sm text-foreground leading-relaxed">{project.objetivo}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Side info card */}
        <Card className="p-5 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Información del proyecto
          </p>
          <div className="flex flex-col gap-3 text-sm">
            {org && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Organización</p>
                <Link href={`/organizations/${org.slug}`} className="mt-0.5 flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors">
                  <Building2 className="h-3.5 w-3.5" />
                  {org.nombre}
                </Link>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Métricas</p>
              <p className="mt-0.5 font-medium text-foreground">{project.metricasCount} declaradas · {metrics.filter(m => m.estado === 'verificado').length} verificadas</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Evidencias</p>
              <p className="mt-0.5 font-medium text-foreground">{project.evidenciasCount} archivos</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">ODS alineados</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {project.ods.map((n) => (
                  <span key={n} className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.22_0.04_155)] text-[10px] font-bold text-[oklch(0.85_0.06_150)]">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* ── Impact metrics ───────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-xl font-normal text-foreground">Métricas de impacto</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {metrics.map((metric) => {
            const meth = mockMethodologies.find((m) => m.id === metric.metodologiaId)
            const pct = Math.round((metric.valorActual / metric.valorMeta) * 100)

            return (
              <Card key={metric.id} className="p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <MetricTypeBadge type={metric.tipo} size="sm" />
                  <StatusBadge status={metric.estado} size="sm" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{metric.nombre}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{metric.descripcion}</p>
                </div>

                {/* Value */}
                <div className="flex items-end gap-3">
                  <div>
                    <p className="font-heading text-2xl font-normal text-foreground">
                      {metric.valorActual.toLocaleString('es-MX')}
                    </p>
                    <p className="text-xs text-muted-foreground">{metric.unidad}</p>
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Base: {metric.valorLinea}</span>
                      <span>Meta: {metric.valorMeta.toLocaleString('es-MX')}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-3 text-xs">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Periodo</p>
                    <p className="font-medium text-foreground mt-0.5">{metric.periodo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tipo de declaración</p>
                    <p className="font-medium text-foreground mt-0.5 capitalize">
                      {metric.estado === 'verificado' ? 'Verificado externamente' : metric.estado === 'en_revision' ? 'En revisión' : 'Declarado'}
                    </p>
                  </div>
                  {meth && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Metodología</p>
                      <p className="font-medium text-foreground mt-0.5">{meth.nombre} · v{meth.version}</p>
                    </div>
                  )}
                  {metric.verificadaEn && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Verificada el</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {new Date(metric.verificadaEn).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                {/* ODS */}
                {metric.ods.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">ODS:</span>
                    {metric.ods.map((n) => (
                      <span key={n} className="flex h-5 w-5 items-center justify-center rounded bg-[oklch(0.22_0.04_155)] text-[10px] font-bold text-[oklch(0.85_0.06_150)]">
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </section>

      <Separator className="my-8" />

      {/* ── Evidence sources ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-xl font-normal text-foreground">Fuentes de evidencia</h2>
        </div>
        <div className="flex flex-col gap-3">
          {evidences.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay evidencias públicas disponibles.</p>
          ) : (
            evidences.map((ev) => (
              <Card key={ev.id} className="flex items-start gap-4 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm text-foreground">{ev.titulo}</p>
                    <StatusBadge status={ev.estado} size="sm" />
                    <span className="rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {evidenceTypeLabels[ev.tipo] ?? ev.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ev.descripcion}</p>
                  {ev.notas && (
                    <p className="mt-1.5 text-xs text-[oklch(0.32_0.14_130)] bg-brand-lime-light rounded px-2 py-1">
                      Nota del validador: {ev.notas}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p>{new Date(ev.subidaEn).toLocaleDateString('es-MX')}</p>
                  <p className="font-mono text-[10px] mt-0.5 opacity-70">{ev.archivoNombre}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <Separator className="my-8" />

      {/* ── Certificates ─────────────────────────────────────────────────── */}
      {certs.length > 0 && (
        <>
          <section>
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-xl font-normal text-foreground">Certificados</h2>
            </div>
            <div className="flex flex-col gap-3">
              {certs.map((cert) => (
                <Link key={cert.id} href={`/certificates/${cert.id}`}>
                  <Card className="group flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green-light">
                        <ShieldCheck className="h-4 w-4 text-[oklch(0.38_0.12_152)]" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-semibold text-muted-foreground">{cert.numero}</p>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors capitalize">
                          Nivel {cert.nivel} · {cert.emisorNombre}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <VerificationLevelBadge level={cert.nivel} size="sm" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
          <Separator className="my-8" />
        </>
      )}

      {/* ── Methodologies ────────────────────────────────────────────────── */}
      {methodologies.length > 0 && (
        <>
          <section>
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-heading text-xl font-normal text-foreground">Metodologías aplicadas</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {methodologies.map((meth) => (
                <Card key={meth.id} className="p-5">
                  <p className="font-semibold text-sm text-foreground">{meth.nombre}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{meth.organizacionEmisora} · v{meth.version}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{meth.descripcion}</p>
                  <a href={meth.urlReferencia} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
                    Ver estándar <ExternalLink className="h-3 w-3" />
                  </a>
                </Card>
              ))}
            </div>
          </section>
          <Separator className="my-8" />
        </>
      )}

      {/* ── Update timeline ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-xl font-normal text-foreground">Historial de actualizaciones</h2>
        </div>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay eventos de validación registrados.</p>
        ) : (
          <div className="flex flex-col gap-0">
            {timeline.map((ev, i) => (
              <div key={ev.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-4" />}
                </div>
                <div className="flex-1 pb-5">
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
        )}
      </section>
    </div>
  )
}
