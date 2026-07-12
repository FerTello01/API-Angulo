'use client'

import { ProofactSymbol } from '@/components/brand/proofact-symbol'
import { CheckCircle2 } from 'lucide-react'

interface CertificatePreviewProps {
  certificateId: string
  status: 'active' | 'pending' | 'revoked'
  organizationName: string
  projectName: string
  impactValue: string
  impactUnit: string
  impactType: string
  validatorName: string
  methodology: string
  evidenceLevel: string
  issuedDate: string
  attestationUid: string
  blockchainNetwork: string
  evidenceHash: string
}

export function CertificatePreview({
  certificateId,
  status,
  organizationName,
  projectName,
  impactValue,
  impactUnit,
  impactType,
  validatorName,
  methodology,
  evidenceLevel,
  issuedDate,
  attestationUid,
  blockchainNetwork,
  evidenceHash,
}: CertificatePreviewProps) {
  const statusColor =
    status === 'active'
      ? 'text-brand-green'
      : status === 'pending'
        ? 'text-brand-amber'
        : 'text-destructive'

  return (
    <div className="w-full max-w-2xl mx-auto p-0">
      {/* Certificate container - print-friendly */}
      <div className="bg-white text-black rounded-lg border-2 border-primary/20 overflow-hidden shadow-lg">
        {/* Header */}
        <div className="p-8 border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ProofactSymbol size={40} />
              <div>
                <div className="font-heading font-bold text-lg text-primary">Proofact</div>
                <div className="text-xs text-muted-foreground font-medium">
                  Verificación de impacto
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${statusColor} font-semibold text-sm`}>
              <CheckCircle2 className="h-5 w-5" />
              {status === 'active' && 'VERIFICADO'}
              {status === 'pending' && 'PENDIENTE'}
              {status === 'revoked' && 'REVOCADO'}
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            ID: {certificateId}
          </div>
        </div>

        {/* Main content */}
        <div className="p-8 space-y-8">
          {/* Organization & Project */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Organización
            </p>
            <p className="font-heading text-2xl font-bold text-foreground">
              {organizationName}
            </p>
            <p className="text-sm text-muted-foreground">Proyecto: {projectName}</p>
          </div>

          {/* Impact value - main focus */}
          <div className="py-6 border-y-2 border-primary/10 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Impacto verificado
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-5xl font-bold text-primary">
                {impactValue}
              </span>
              <div className="flex flex-col gap-0">
                <span className="text-lg font-semibold text-foreground">{impactUnit}</span>
                <span className="text-xs text-muted-foreground">{impactType}</span>
              </div>
            </div>
          </div>

          {/* Validation details grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Validador
              </p>
              <p className="font-medium text-foreground">{validatorName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Metodología
              </p>
              <p className="font-medium text-foreground">{methodology}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Nivel de evidencia
              </p>
              <p className="font-medium text-foreground">{evidenceLevel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Fecha de emisión
              </p>
              <p className="font-medium text-foreground">{issuedDate}</p>
            </div>
          </div>

          {/* Technical section */}
          <div className="pt-6 border-t-2 border-primary/10 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Detalles técnicos de atestación
            </p>
            <div className="bg-muted/40 p-4 rounded-lg space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between items-start gap-2 break-all">
                <span className="flex-shrink-0">UID:</span>
                <span className="text-right">{attestationUid}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="flex-shrink-0">Red:</span>
                <span>{blockchainNetwork}</span>
              </div>
              <div className="flex justify-between items-start gap-2 break-all">
                <span className="flex-shrink-0">Hash:</span>
                <span className="text-right">{evidenceHash}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="p-6 bg-muted/20 border-t-2 border-primary/10">
          <p className="text-xs text-muted-foreground leading-relaxed text-center italic">
            Este certificado registra la integridad, emisión y validación declarada de la evidencia
            asociada. La información es verificable en proofact.me
          </p>
        </div>
      </div>
    </div>
  )
}
