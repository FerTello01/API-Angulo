import { cn } from '@/lib/utils'
import type {
  VerificationStatus,
  VerificationLevel,
  MetricType,
} from '@/lib/types'
import {
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  XCircle,
  AlertCircle,
  Leaf,
  Users,
  TrendingUp,
  ShieldCheck,
  Target,
} from 'lucide-react'

// ─── StatusBadge ───────────────────────────────────────────────────────────────

const statusConfig: Record<
  VerificationStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  borrador: {
    label: 'Borrador',
    icon: FileEdit,
    className: 'bg-muted text-muted-foreground border border-border',
  },
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    className:
      'bg-brand-amber-light text-[oklch(0.38_0.13_65)] border border-[oklch(0.72_0.16_65)/30]',
  },
  en_revision: {
    label: 'En revisión',
    icon: Eye,
    className:
      'bg-brand-blue-light text-[oklch(0.28_0.12_245)] border border-[oklch(0.48_0.14_245)/30]',
  },
  verificado: {
    label: 'Verificado',
    icon: CheckCircle2,
    className:
      'bg-brand-lime-light text-[oklch(0.32_0.14_130)] border border-[oklch(0.72_0.18_130)/30]',
  },
  rechazado: {
    label: 'Rechazado',
    icon: XCircle,
    className:
      'bg-[oklch(0.96_0.02_25)] text-[oklch(0.42_0.18_27)] border border-[oklch(0.57_0.22_27)/25]',
  },
  expirado: {
    label: 'Expirado',
    icon: AlertCircle,
    className: 'bg-muted text-muted-foreground border border-border',
  },
}

interface StatusBadgeProps {
  status: VerificationStatus
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {config.label}
    </span>
  )
}

// ─── VerificationLevelBadge ────────────────────────────────────────────────────

const levelConfig: Record<
  VerificationLevel,
  { label: string; className: string; dotClass: string }
> = {
  bronce: {
    label: 'Bronce',
    className:
      'bg-[oklch(0.95_0.03_55)] text-[oklch(0.38_0.11_55)] border border-[oklch(0.65_0.12_55)/25]',
    dotClass: 'bg-[oklch(0.65_0.12_55)]',
  },
  plata: {
    label: 'Plata',
    className:
      'bg-[oklch(0.94_0.005_250)] text-[oklch(0.32_0.04_250)] border border-[oklch(0.55_0.05_250)/25]',
    dotClass: 'bg-[oklch(0.55_0.05_250)]',
  },
  oro: {
    label: 'Oro',
    className:
      'bg-[oklch(0.96_0.05_80)] text-[oklch(0.38_0.13_75)] border border-[oklch(0.72_0.16_80)/30]',
    dotClass: 'bg-[oklch(0.72_0.16_80)]',
  },
  platino: {
    label: 'Platino',
    className:
      'bg-brand-green-light text-[oklch(0.28_0.1_152)] border border-[oklch(0.38_0.12_152)/30]',
    dotClass: 'bg-brand-green',
  },
}

interface VerificationLevelBadgeProps {
  level: VerificationLevel
  size?: 'sm' | 'md'
  className?: string
}

export function VerificationLevelBadge({
  level,
  size = 'md',
  className,
}: VerificationLevelBadgeProps) {
  const config = levelConfig[level]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
    >
      <ShieldCheck className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {config.label}
    </span>
  )
}

// ─── MetricTypeBadge ───────────────────────────────────────────────────────────

const metricTypeConfig: Record<
  MetricType,
  { label: string; icon: React.ElementType; className: string }
> = {
  ambiental: {
    label: 'Ambiental',
    icon: Leaf,
    className:
      'bg-brand-green-light text-[oklch(0.28_0.1_152)] border border-[oklch(0.38_0.12_152)/25]',
  },
  social: {
    label: 'Social',
    icon: Users,
    className:
      'bg-brand-blue-light text-[oklch(0.28_0.12_245)] border border-[oklch(0.48_0.14_245)/25]',
  },
  economico: {
    label: 'Económico',
    icon: TrendingUp,
    className:
      'bg-brand-amber-light text-[oklch(0.38_0.13_65)] border border-[oklch(0.72_0.16_65)/25]',
  },
  gobernanza: {
    label: 'Gobernanza',
    icon: ShieldCheck,
    className:
      'bg-[oklch(0.95_0.015_300)] text-[oklch(0.32_0.08_300)] border border-[oklch(0.52_0.1_300)/25]',
  },
  ods: {
    label: 'ODS',
    icon: Target,
    className:
      'bg-[oklch(0.96_0.03_20)] text-[oklch(0.42_0.14_20)] border border-[oklch(0.62_0.18_20)/25]',
  },
}

interface MetricTypeBadgeProps {
  type: MetricType
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export function MetricTypeBadge({
  type,
  size = 'md',
  showIcon = true,
  className,
}: MetricTypeBadgeProps) {
  const config = metricTypeConfig[type]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {config.label}
    </span>
  )
}
