import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, VerificationLevelBadge } from '@/components/impact/badges'
import {
  mockOrganizations,
  mockCertificates,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  ShieldCheck,
  ArrowRight,
  FileSearch,
  Leaf,
  Users,
  TrendingUp,
  Building2,
  CheckCircle2,
} from 'lucide-react'

// ─── Impact category tiles ────────────────────────────────────────────────────

const categories = [
  {
    icon: Leaf,
    label: 'Ambiental',
    description: 'Clima, biodiversidad, suelos, agua y energía',
    color: 'bg-brand-green-light text-[oklch(0.28_0.1_152)]',
    iconColor: 'text-[oklch(0.38_0.12_152)]',
  },
  {
    icon: Users,
    label: 'Social',
    description: 'Empleo, educación, salud y comunidades',
    color: 'bg-brand-blue-light text-[oklch(0.28_0.12_245)]',
    iconColor: 'text-[oklch(0.48_0.14_245)]',
  },
  {
    icon: TrendingUp,
    label: 'Económico',
    description: 'Ingresos, cadenas de valor e inclusión financiera',
    color: 'bg-brand-amber-light text-[oklch(0.38_0.13_65)]',
    iconColor: 'text-[oklch(0.72_0.16_65)]',
  },
  {
    icon: ShieldCheck,
    label: 'Gobernanza',
    description: 'Transparencia, ética y rendición de cuentas',
    color: 'bg-[oklch(0.95_0.015_300)] text-[oklch(0.32_0.08_300)]',
    iconColor: 'text-[oklch(0.52_0.1_300)]',
  },
]

// ─── How verification works steps ─────────────────────────────────────────────

const steps = [
  {
    n: '01',
    title: 'La empresa declara su impacto',
    body: 'Registra proyectos, métricas, metodologías y sube evidencia documental.',
  },
  {
    n: '02',
    title: 'Un validador independiente revisa',
    body: 'Expertos certificados auditan la evidencia y confirman que los datos son sólidos.',
  },
  {
    n: '03',
    title: 'Se emite el certificado',
    body: 'El certificado incluye el resultado, el periodo, la metodología y el validador.',
  },
  {
    n: '04',
    title: 'Cualquiera puede verificarlo',
    body: 'El público puede consultar el certificado y rastrear cada dato hasta su origen.',
  },
]

// ─── Stat strip data ───────────────────────────────────────────────────────────

const stats = [
  { label: 'Empresas verificadas', value: '4+' },
  { label: 'Certificados emitidos', value: '3' },
  { label: 'Métricas de impacto', value: '7+' },
  { label: 'Validadores activos', value: '3' },
]

export default function HomePage() {
  const featuredOrgs = mockOrganizations.filter((o) => o.verificacionEstado === 'verificado').slice(0, 3)
  const recentCerts = mockCertificates.filter((c) => c.estado === 'activo').slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[oklch(0.22_0.04_155)] text-[oklch(0.95_0.01_150)]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[oklch(0.38_0.12_152)/40] bg-[oklch(0.28_0.05_155)] px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-lime" />
              <span className="text-xs font-medium text-[oklch(0.85_0.06_150)]">
                Verificación independiente de impacto
              </span>
            </div>
            <h1 className="font-heading text-4xl font-normal leading-tight text-balance md:text-5xl lg:text-[3.25rem]">
              Descubre empresas cuyo impacto puede rastrearse hasta la evidencia
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[oklch(0.75_0.025_150)] max-w-xl">
              Proofact conecta a empresas con impacto real con validadores independientes.
              Cada métrica está respaldada por evidencia, metodología y una firma de validación.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'bg-brand-lime text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.66_0.17_130)] font-semibold',
                )}
              >
                Explorar empresas <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/verify"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'border-[oklch(0.38_0.12_152)/50] text-[oklch(0.88_0.02_150)] bg-transparent hover:bg-[oklch(0.28_0.05_155)] hover:text-[oklch(0.95_0.01_150)]',
                )}
              >
                <FileSearch className="mr-1.5 h-4 w-4" />
                Verificar certificado
              </Link>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:linear-gradient(oklch(0.95_0.01_150)_1px,transparent_1px),linear-gradient(90deg,oklch(0.95_0.01_150)_1px,transparent_1px)] [background-size:60px_60px]" />
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-3xl font-normal text-foreground">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works (mini) ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proceso</p>
            <h2 className="mt-1 font-heading text-2xl font-normal text-foreground md:text-3xl text-balance">
              Cómo funciona la verificación
            </h2>
          </div>
          <Link href="/how-it-works" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
            Ver más <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="relative rounded-xl border border-border bg-card p-5">
              <span className="font-heading text-3xl font-normal text-muted/70">{step.n}</span>
              <h3 className="mt-3 text-sm font-semibold text-foreground leading-snug">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      {/* ── Impact categories ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorías</p>
          <h2 className="mt-1 font-heading text-2xl font-normal text-foreground md:text-3xl text-balance">
            Tipos de impacto verificado
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.label}
                href={`/explore?tipo=${cat.label.toLowerCase()}`}
                className={`group flex flex-col gap-3 rounded-xl border border-border p-5 transition-shadow hover:shadow-sm ${cat.color}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/60">
                  <Icon className={`h-5 w-5 ${cat.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{cat.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed opacity-80">{cat.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium opacity-70 group-hover:opacity-100">
                  Explorar <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      {/* ── Featured organizations ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destacadas</p>
            <h2 className="mt-1 font-heading text-2xl font-normal text-foreground md:text-3xl text-balance">
              Empresas con impacto verificado
            </h2>
          </div>
          <Link href="/explore" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {featuredOrgs.map((org) => (
            <Link key={org.id} href={`/organizations/${org.slug}`}>
              <Card className="group flex flex-col gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md">
                <div className="h-16 w-full bg-[oklch(0.22_0.04_155)]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 -mt-9 items-center justify-center rounded-xl border-2 border-card bg-card shadow-sm">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {org.verificacionNivel && (
                      <VerificationLevelBadge level={org.verificacionNivel} size="sm" />
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {org.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {org.ciudad}, {org.pais}
                  </p>
                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {org.descripcion}
                  </p>
                  <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
                    <div className="text-center">
                      <p className="font-semibold text-sm text-foreground">{org.proyectos}</p>
                      <p className="text-xs text-muted-foreground">Proyectos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm text-foreground">{org.metricasVerificadas}</p>
                      <p className="text-xs text-muted-foreground">Métricas</p>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge status={org.verificacionEstado} size="sm" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link href="/explore" className={buttonVariants({ variant: 'outline' })}>
            Ver todas las empresas
          </Link>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      {/* ── Recent certificates ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certificados recientes</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-foreground md:text-3xl text-balance">
              Últimas verificaciones emitidas
            </h2>
          </div>
          <Link href="/explore" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentCerts.map((cert) => {
            const org = mockOrganizations.find((o) => o.id === cert.organizacionId)
            const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
              platino: { bg: '#EBF0FB', text: '#4B78D1', dot: '#4B78D1' },
              oro:     { bg: '#FDF4E1', text: '#B8860B', dot: '#E5A93D' },
              plata:   { bg: '#F0F0F0', text: '#4A4F55', dot: '#B7B1A6' },
            }
            const lc = levelColors[cert.nivel] ?? levelColors.plata
            const emitido = new Date(cert.emitidoEn).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
            const expira  = new Date(cert.expiraEn).toLocaleDateString('es-MX',  { year: 'numeric', month: 'short', day: 'numeric' })

            return (
              <Link key={cert.id} href={`/certificates/${cert.id}`} className="group block">
                <div
                  className="relative flex flex-col rounded-xl border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg overflow-hidden"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#D8D3CB' }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: lc.dot }} />

                  <div className="flex flex-col gap-4 p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      {/* Cert number + icon */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: '#EBF5F1' }}
                        >
                          <CheckCircle2 className="h-4.5 w-4.5" style={{ color: '#2D7A5E' }} />
                        </div>
                        <span
                          className="font-mono text-xs font-semibold tracking-wider"
                          style={{ color: '#4A4F55' }}
                        >
                          {cert.numero}
                        </span>
                      </div>
                      {/* Level badge */}
                      <span
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                        style={{ backgroundColor: lc.bg, color: lc.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: lc.dot }} />
                        {cert.nivel}
                      </span>
                    </div>

                    {/* Org name */}
                    <div>
                      <p
                        className="text-base font-semibold leading-snug transition-colors group-hover:text-primary"
                        style={{ color: '#14221F' }}
                      >
                        {org?.nombre ?? '—'}
                      </p>
                      {org && (
                        <p className="mt-0.5 text-xs" style={{ color: '#4A4F55' }}>
                          {org.ciudad}, {org.pais}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t" style={{ borderColor: '#E8E4DC' }} />

                    {/* Meta row */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-medium" style={{ color: '#4A4F55' }}>
                          Emitido
                        </p>
                        <p className="text-xs font-semibold" style={{ color: '#14221F' }}>
                          {emitido}
                        </p>
                      </div>
                      <div className="flex flex-col gap-0.5 text-right">
                        <p className="text-xs font-medium" style={{ color: '#4A4F55' }}>
                          Expira
                        </p>
                        <p className="text-xs font-semibold" style={{ color: '#14221F' }}>
                          {expira}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ backgroundColor: '#EBF5F1', color: '#2D7A5E' }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Activo
                      </div>
                    </div>

                    {/* Validator */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: '#B7B1A6' }}>
                        Validado por{' '}
                        <span className="font-medium" style={{ color: '#4A4F55' }}>
                          {cert.emisorNombre}
                        </span>
                      </p>
                      <ArrowRight
                        className="h-3.5 w-3.5 translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                        style={{ color: '#2D7A5E' }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/explore" className={buttonVariants({ variant: 'outline' })}>
            Ver todos los certificados
          </Link>
        </div>
      </section>

      {/* ── Dual CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-[oklch(0.22_0.04_155)] p-8 text-[oklch(0.95_0.01_150)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-lime/20">
              <Building2 className="h-5 w-5 text-brand-lime" />
            </div>
            <h3 className="mt-4 font-heading text-xl font-normal text-balance">
              ¿Tu empresa genera impacto real?
            </h3>
            <p className="mt-2 text-sm text-[oklch(0.75_0.025_150)] leading-relaxed">
              Registra tus proyectos, documenta tus métricas y solicita una verificación
              independiente. Construye credibilidad con evidencia.
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: 'default' }),
                'mt-6 bg-brand-lime text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.66_0.17_130)] font-semibold',
              )}
            >
              Registrar mi empresa <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue-light">
              <ShieldCheck className="h-5 w-5 text-[oklch(0.48_0.14_245)]" />
            </div>
            <h3 className="mt-4 font-heading text-xl font-normal text-foreground text-balance">
              ¿Eres experto en impacto?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Únete a la red de validadores independientes de Proofact. Contribuye al
              ecosistema de transparencia en inversión de impacto.
            </p>
            <Link
              href="/register?rol=validador"
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}
            >
              Convertirme en validador <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
