import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MetricTypeBadge, VerificationLevelBadge } from '@/components/impact/badges'
import {
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Building2,
  BarChart3,
  Search,
  Globe,
  Lock,
  Target,
  Leaf,
  TrendingUp,
} from 'lucide-react'

// ─── Data ──────────────────────────────────────────────────────────────────────

const phases = [
  {
    n: '01',
    title: 'Registro de la empresa',
    icon: Building2,
    description:
      'La empresa crea su perfil en ImpactVerify, describe sus actividades, sectores y objetivos de impacto. Define los ODS con los que se alinea su modelo de negocio.',
    detail:
      'Se registran proyectos activos, con descripción, ubicación, beneficiarios y cronograma. Cada proyecto es la unidad mínima de reporte.',
  },
  {
    n: '02',
    title: 'Declaración de métricas',
    icon: BarChart3,
    description:
      'Para cada proyecto, la empresa declara métricas de impacto: nombre, unidad, valor actual, meta y periodo. Cada métrica se clasifica según tipo (ambiental, social, económico, gobernanza) y se le asigna una metodología estándar.',
    detail:
      'Los tipos de declaración admitidos son: declarado, documentado, calculado, estimado, proyectado, medido y verificado externamente. La distinción es importante para que los usuarios interpreten correctamente cada dato.',
  },
  {
    n: '03',
    title: 'Carga de evidencia',
    icon: FileText,
    description:
      'La empresa sube archivos de respaldo: informes técnicos, auditorías, datos de sensores, registros fotográficos y certificaciones externas. Cada evidencia está vinculada a métricas específicas.',
    detail:
      'Los archivos permanecen accesibles para los validadores y, en su versión pública, para cualquier persona. La trazabilidad de cada dato hasta su fuente es un principio central de la plataforma.',
  },
  {
    n: '04',
    title: 'Solicitud de verificación',
    icon: ShieldCheck,
    description:
      'La empresa solicita una verificación independiente, indicando el nivel deseado (Bronce, Plata, Oro o Platino) y la prioridad. La solicitud entra en cola de asignación.',
    detail:
      'Los niveles de verificación corresponden al rigor documental y la independencia de la auditoría realizada. Platino requiere auditoría de campo; Bronce, revisión documental básica.',
  },
  {
    n: '05',
    title: 'Revisión por validador',
    icon: Users,
    description:
      'Un validador certificado e independiente revisa la evidencia, puede solicitar documentación adicional y documenta el proceso en el historial de la solicitud.',
    detail:
      'Si la evidencia es insuficiente, el validador puede pedir correcciones o marcar la solicitud como rechazada. Todo el intercambio queda registrado y es auditable.',
  },
  {
    n: '06',
    title: 'Emisión del certificado',
    icon: CheckCircle2,
    description:
      'Tras la aprobación, se emite un certificado público con número único, nivel, organización, proyecto, métricas certificadas, periodo, metodología y validador emisor.',
    detail:
      'El certificado incluye una sección técnica con el identificador de la atestación, la firma del validador y la fecha de firma. Cualquier persona puede verificar su autenticidad en la plataforma.',
  },
]

const levels = [
  {
    level: 'bronce' as const,
    title: 'Bronce',
    description: 'Revisión documental básica. Métricas declaradas con respaldo mínimo.',
    requirements: ['Descripción de proyecto', 'Al menos 1 métrica', 'Documento de soporte'],
  },
  {
    level: 'plata' as const,
    title: 'Plata',
    description: 'Documentación completa y metodología estándar identificada.',
    requirements: ['Metodología reconocida', 'Informe técnico', 'Línea base establecida'],
  },
  {
    level: 'oro' as const,
    title: 'Oro',
    description: 'Auditoría documental profunda. Datos respaldados por fuentes verificables.',
    requirements: ['Auditoría de datos', 'Múltiples fuentes de evidencia', 'Revisión de campo remota'],
  },
  {
    level: 'platino' as const,
    title: 'Platino',
    description: 'Verificación de campo independiente. Máximo rigor metodológico.',
    requirements: ['Auditoría in situ', 'Metodología certificada', 'Revisión independiente anual'],
  },
]

const metricTypes = [
  {
    type: 'ambiental' as const,
    examples: ['tCO₂e evitadas', 'Hectáreas restauradas', 'kWh de energía limpia'],
    icon: Leaf,
  },
  {
    type: 'social' as const,
    examples: ['Empleos generados', 'Personas beneficiadas', 'Formación impartida'],
    icon: Users,
  },
  {
    type: 'economico' as const,
    examples: ['Ingresos comunitarios', 'Ahorros generados', 'Cadenas de valor activadas'],
    icon: TrendingUp,
  },
  {
    type: 'gobernanza' as const,
    examples: ['Índice de transparencia', 'Políticas implementadas', 'Auditorías externas'],
    icon: ShieldCheck,
  },
]

const principles = [
  {
    icon: Search,
    title: 'Trazabilidad',
    description: 'Cada métrica puede rastrearse hasta la evidencia que la respalda.',
  },
  {
    icon: Users,
    title: 'Independencia',
    description: 'Los validadores son externos a las organizaciones que verifican.',
  },
  {
    icon: Globe,
    title: 'Transparencia',
    description: 'Los certificados y evidencias públicas son accesibles para cualquier persona.',
  },
  {
    icon: Lock,
    title: 'Rigor metodológico',
    description: 'Se aplican estándares reconocidos: GRI, IRIS+, VCS, B Impact Assessment.',
  },
  {
    icon: Target,
    title: 'Sin ranking comparativo',
    description: 'No comparamos empresas entre sí. Verificamos cada impacto en sus propios términos.',
  },
  {
    icon: FileText,
    title: 'Claridad declarativa',
    description: 'Distinguimos entre datos medidos, estimados, proyectados y verificados externamente.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="bg-[oklch(0.22_0.04_155)] text-[oklch(0.95_0.01_150)]">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <h1 className="font-heading text-4xl font-normal text-balance md:text-5xl">
            Cómo funciona la verificación de impacto
          </h1>
          <p className="mt-4 text-lg text-[oklch(0.75_0.025_150)] leading-relaxed max-w-2xl">
            ImpactVerify conecta a empresas con validadores independientes para crear
            un registro público y verificable del impacto social y ambiental.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        {/* ── Process phases ─────────────────────────────────────────────── */}
        <section className="py-16">
          <h2 className="font-heading text-2xl font-normal text-foreground md:text-3xl mb-10 text-balance">
            El proceso paso a paso
          </h2>
          <div className="flex flex-col gap-6">
            {phases.map((phase) => {
              const Icon = phase.icon
              return (
                <div key={phase.n} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.22_0.04_155)] text-[oklch(0.85_0.06_150)]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="w-px flex-1 bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{phase.n}</span>
                      <h3 className="font-semibold text-foreground">{phase.title}</h3>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{phase.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{phase.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Separator />

        {/* ── Verification levels ──────────────────────────────────────── */}
        <section className="py-16">
          <h2 className="font-heading text-2xl font-normal text-foreground md:text-3xl mb-3 text-balance">
            Niveles de verificación
          </h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            Cada nivel representa un grado creciente de rigor en la revisión de evidencia y metodología.
            No es una jerarquía de valor: una empresa con Bronce que declara con honestidad es tan valiosa
            como una con Platino.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {levels.map((l) => (
              <Card key={l.level} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <VerificationLevelBadge level={l.level} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{l.description}</p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {l.requirements.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[oklch(0.38_0.12_152)]" />
                      {req}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Metric types ─────────────────────────────────────────────── */}
        <section className="py-16">
          <h2 className="font-heading text-2xl font-normal text-foreground md:text-3xl mb-3 text-balance">
            Tipos de métricas
          </h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            Clasificamos las métricas en cuatro dimensiones. Cada métrica debe tener claro su tipo
            de declaración: si es medida directamente, calculada por metodología, estimada o verificada
            por un tercero.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {metricTypes.map((mt) => (
              <Card key={mt.type} className="p-5">
                <div className="mb-3">
                  <MetricTypeBadge type={mt.type} />
                </div>
                <ul className="flex flex-col gap-1.5">
                  {mt.examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Declaration types explainer */}
          <Card className="mt-6 p-5 bg-muted/30">
            <p className="font-semibold text-sm text-foreground mb-3">Tipos de declaración admitidos</p>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-4">
              {[
                { label: 'Declarado', desc: 'Sin evidencia adicional' },
                { label: 'Documentado', desc: 'Con documentos de respaldo' },
                { label: 'Calculado', desc: 'Por fórmula metodológica' },
                { label: 'Estimado', desc: 'Aproximación justificada' },
                { label: 'Proyectado', desc: 'Valor esperado a futuro' },
                { label: 'Medido', desc: 'Instrumento de medición directo' },
                { label: 'Verificado externamente', desc: 'Auditado por tercero independiente' },
              ].map((d) => (
                <div key={d.label} className="rounded-lg border border-border bg-card p-2.5">
                  <p className="font-medium text-foreground text-xs">{d.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Separator />

        {/* ── Principles ───────────────────────────────────────────────── */}
        <section className="py-16">
          <h2 className="font-heading text-2xl font-normal text-foreground md:text-3xl mb-3 text-balance">
            Principios del modelo
          </h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            ImpactVerify no es un sello de aprobación ni un ranking. Es una infraestructura de
            transparencia que permite a cualquier persona verificar las afirmaciones de impacto.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{p.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Separator />

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="rounded-2xl border border-border bg-[oklch(0.22_0.04_155)] p-8 text-[oklch(0.95_0.01_150)]">
            <h2 className="font-heading text-2xl font-normal text-balance">
              ¿Listo para verificar el impacto de tu empresa?
            </h2>
            <p className="mt-2 text-sm text-[oklch(0.75_0.025_150)] leading-relaxed max-w-lg">
              Registra tu empresa, documenta tus proyectos y solicita una verificación independiente.
              O explora las organizaciones que ya han sido verificadas.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register" className={cn(buttonVariants(), "bg-brand-lime text-[oklch(0.15_0.04_155)] hover:bg-[oklch(0.66_0.17_130)] font-semibold")}>
                Registrar mi empresa <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link href="/explore" className={cn(buttonVariants({ variant: "outline" }), "border-[oklch(0.38_0.12_152)/50] text-[oklch(0.88_0.02_150)] bg-transparent hover:bg-[oklch(0.28_0.05_155)] hover:text-[oklch(0.95_0.01_150)]")}>
                Explorar empresas
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
