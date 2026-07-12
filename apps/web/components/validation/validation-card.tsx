'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, User } from 'lucide-react'

type ValidationStatus = 'approved' | 'pending' | 'rejected' | 'under-review'

interface ValidationCardProps {
  validatorName: string
  validatorAvatar?: string
  validatorId: string
  projectName: string
  status: ValidationStatus
  evidenceLevel: string
  methodology: string
  reviewDate: string
  comment?: string
  className?: string
}

const statusConfig = {
  approved: {
    icon: CheckCircle2,
    label: 'Aprobado',
    className: 'status-verified',
  },
  pending: {
    icon: Clock,
    label: 'Pendiente',
    className: 'status-pending',
  },
  rejected: {
    icon: AlertCircle,
    label: 'Rechazado',
    className: 'status-rejected',
  },
  'under-review': {
    icon: Clock,
    label: 'En revisión',
    className: 'status-review',
  },
}

export function ValidationCard({
  validatorName,
  validatorAvatar,
  validatorId,
  projectName,
  status,
  evidenceLevel,
  methodology,
  reviewDate,
  comment,
  className = '',
}: ValidationCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className={`p-5 flex flex-col gap-4 ${className}`}>
      {/* Header: validator and status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground truncate">{validatorName}</p>
            <p className="text-xs text-muted-foreground truncate">ID: {validatorId}</p>
          </div>
        </div>
        <Badge className={`flex items-center gap-1.5 ${config.className}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
      </div>

      {/* Project and methodology details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Proyecto:</span>
          <span className="font-medium text-foreground">{projectName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Metodología:</span>
          <span className="font-medium text-foreground">{methodology}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Nivel de evidencia:</span>
          <span className={`font-medium ${evidenceLevel === 'High' ? 'text-brand-green' : 'text-brand-amber'}`}>
            {evidenceLevel}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Revisado:</span>
          <span className="font-medium text-foreground text-xs">{reviewDate}</span>
        </div>
      </div>

      {/* Comment if available */}
      {comment && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed italic">{comment}</p>
        </div>
      )}
    </Card>
  )
}
