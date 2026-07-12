'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface ImpactMetricCardProps {
  icon: LucideIcon
  value: string | number
  unit: string
  label: string
  category: string
  verificationLevel?: 'measured' | 'documented' | 'calculated' | 'estimated'
  period?: string
  trend?: number
  className?: string
}

const verificationLevelStyles = {
  measured: 'bg-brand-lime-light text-[oklch(0.32_0.14_130)] border-[oklch(0.72_0.18_130)/30]',
  documented: 'bg-brand-blue-light text-[oklch(0.28_0.12_245)] border-[oklch(0.48_0.14_245)/30]',
  calculated: 'bg-muted text-muted-foreground border-border',
  estimated: 'bg-brand-amber-light text-[oklch(0.38_0.13_65)] border-[oklch(0.72_0.16_65)/30]',
}

export function ImpactMetricCard({
  icon: Icon,
  value,
  unit,
  label,
  category,
  verificationLevel = 'measured',
  period,
  trend,
  className = '',
}: ImpactMetricCardProps) {
  return (
    <Card className={`p-5 flex flex-col gap-3 ${className}`}>
      {/* Header with icon and verification */}
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 rounded-lg bg-primary/8">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <Badge
          variant="outline"
          className={`text-xs font-semibold border ${verificationLevelStyles[verificationLevel]}`}
        >
          {verificationLevel === 'measured' && 'Medido'}
          {verificationLevel === 'documented' && 'Documentado'}
          {verificationLevel === 'calculated' && 'Calculado'}
          {verificationLevel === 'estimated' && 'Estimado'}
        </Badge>
      </div>

      {/* Main metric */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground font-medium">{unit}</span>
      </div>

      {/* Label and category */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{category}</p>
      </div>

      {/* Footer with period and trend */}
      {(period || trend !== undefined) && (
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
          {period && <span>{period}</span>}
          {trend !== undefined && (
            <span className={trend > 0 ? 'text-brand-green' : trend < 0 ? 'text-destructive' : ''}>
              {trend > 0 ? '+' : ''}{trend}% YoY
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
