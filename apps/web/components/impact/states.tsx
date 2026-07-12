import { cn } from '@/lib/utils'
import { Inbox, Loader2, AlertTriangle } from 'lucide-react'

// ─── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/40 p-12 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-sans text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

// ─── LoadingState ──────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Cargando…', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl p-12 text-center',
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ─── ErrorState ────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'No se pudo cargar la información. Inténtalo de nuevo.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-[oklch(0.96_0.02_25)] p-12 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.93_0.03_25)]">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-sans text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
