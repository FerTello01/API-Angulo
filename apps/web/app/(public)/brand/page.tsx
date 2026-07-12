'use client'

import { useState } from 'react'
import { ProofactLogo } from '@/components/brand/proofact-logo'
import { ProofactSymbol } from '@/components/brand/proofact-symbol'
import { ImpactMetricCard } from '@/components/impact/metric-card'
import { ValidationCard } from '@/components/validation/validation-card'
import { CertificatePreview } from '@/components/certificates/certificate-preview'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Leaf,
  Users,
  TreePine,
  Droplets,
  GitBranch,
  Shield,
  Zap,
  TrendingUp,
} from 'lucide-react'

export default function BrandPage() {
  const [activeSection, setActiveSection] = useState('start')

  const sections = [
    { id: 'start', label: 'Inicio' },
    { id: 'colors', label: 'Paleta' },
    { id: 'typography', label: 'Tipografía' },
    { id: 'components', label: 'Componentes' },
    { id: 'impact', label: 'Impacto' },
    { id: 'validation', label: 'Validación' },
    { id: 'certificate', label: 'Certificado' },
    { id: 'datavis', label: 'Data Vis' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <ProofactLogo size="md" />
            <p className="text-sm text-muted-foreground hidden sm:inline-block">
              Sistema de marca e identidad visual
            </p>
          </div>
        </div>
      </header>

      {/* Main layout with sticky sidebar */}
      <div className="flex">
        {/* Sidebar navigation */}
        <aside className="sticky top-20 h-[calc(100vh-80px)] w-48 border-r border-border bg-muted/30 p-4 overflow-y-auto hidden lg:block">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
          <div className="space-y-16">
            {/* INICIO */}
            {activeSection === 'start' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-5xl font-bold text-foreground mb-2">
                    Proofact
                  </h1>
                  <h2 className="text-2xl text-primary font-semibold mb-6">
                    Make impact provable
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    Proofact es la plataforma de verificación de impacto que conecta empresas
                    sociales y ambientales con validadores independientes. Convertimos acciones en
                    evidencia verificable.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: '🔍', label: 'Rigour', desc: 'Metodologías verificables' },
                    { icon: '📊', label: 'Evidence', desc: 'Datos trazables' },
                    { icon: '✓', label: 'Trust', desc: 'Validación independiente' },
                    { icon: '⛓️', label: 'Tech', desc: 'Atestación técnica' },
                  ].map((item) => (
                    <Card key={item.label} className="p-4 flex gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* COLORES */}
            {activeSection === 'colors' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                    Paleta de color
                  </h1>
                  <p className="text-muted-foreground">Sistema semántico de 7 colores principales</p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      name: 'Ink Navy',
                      hex: '#14221F',
                      usage: 'Tipografía, fondos oscuros, autoridad',
                      oklch: 'oklch(0.18 0.012 60)',
                    },
                    {
                      name: 'Proof Green',
                      hex: '#2D7A5E',
                      usage: 'Acciones primarias, impacto verificado',
                      oklch: 'oklch(0.38 0.12 152)',
                    },
                    {
                      name: 'Signal Lime',
                      hex: '#B9E769',
                      usage: 'Señales activas, estados verificados',
                      oklch: 'oklch(0.72 0.18 130)',
                    },
                    {
                      name: 'Evidence Blue',
                      hex: '#4B78D1',
                      usage: 'Datos, información, validación',
                      oklch: 'oklch(0.48 0.14 245)',
                    },
                    {
                      name: 'Warm Sand',
                      hex: '#F3EFE7',
                      usage: 'Fondo principal, elementos cálidos',
                      oklch: 'oklch(0.975 0.006 85)',
                    },
                    {
                      name: 'Soft Clay',
                      hex: '#D9A879',
                      usage: 'Impacto social, comunidad',
                      oklch: 'oklch(0.62 0.13 50)',
                    },
                    {
                      name: 'Alert Amber',
                      hex: '#E5A93D',
                      usage: 'Revisiones pendientes, incompleto',
                      oklch: 'oklch(0.72 0.16 65)',
                    },
                  ].map((color) => (
                    <div key={color.name} className="flex gap-6 items-center">
                      <div
                        className="w-24 h-24 rounded-lg border-2 border-border flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{color.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{color.hex}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1 opacity-60">
                          {color.oklch}
                        </p>
                        <p className="text-sm text-foreground mt-2">{color.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TIPOGRAFÍA */}
            {activeSection === 'typography' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                    Sistema tipográfico
                  </h1>
                  <p className="text-muted-foreground">2 familias: Manrope para títulos, Inter para cuerpo, IBM Plex Mono para código</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Encabezados - Manrope
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="font-heading text-5xl font-bold">Display 3 / 48px</p>
                      </div>
                      <div>
                        <p className="font-heading text-4xl font-bold">Display 2 / 36px</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl font-bold">Display 1 / 30px</p>
                      </div>
                      <div>
                        <p className="font-heading text-2xl font-semibold">Heading 1 / 24px</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Cuerpo - Inter
                    </p>
                    <div className="space-y-3 font-sans">
                      <p className="text-base">Body Large / 16px — Este es el tamaño estándar para párrafos de contenido.</p>
                      <p className="text-sm">Body / 14px — Texto secundario y descripciones más pequeñas.</p>
                      <p className="text-xs">Caption / 12px — Etiquetas, ayudas y metadatos.</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Código - IBM Plex Mono
                    </p>
                    <div className="font-mono text-xs bg-muted p-4 rounded-lg border border-border overflow-x-auto">
                      <code className="text-foreground">
                        {'POST /api/v1/certifications\\n'}
                        {'Authorization: Bearer sk_live_...\\n'}
                        {'{"impact": {"value": 1000, "unit": "kg CO2"}}'}{'\n'}
                      </code>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* COMPONENTES */}
            {activeSection === 'components' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                    Componentes reutilizables
                  </h1>
                </div>

                <div className="space-y-8">
                  {/* Logo */}
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                      Marca
                    </h3>
                    <div className="flex gap-8 flex-wrap">
                      <ProofactLogo size="sm" />
                      <ProofactLogo size="md" />
                      <ProofactLogo size="lg" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                      Badges de estado
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="status-verified">Verificado</Badge>
                      <Badge className="status-pending">Pendiente</Badge>
                      <Badge className="status-review">En revisión</Badge>
                      <Badge className="status-draft">Borrador</Badge>
                      <Badge className="status-rejected">Rechazado</Badge>
                    </div>
                  </div>

                  {/* Symbol variations */}
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                      Símbolo en variaciones
                    </h3>
                    <div className="flex gap-8">
                      <ProofactSymbol size={24} />
                      <ProofactSymbol size={48} />
                      <ProofactSymbol size={64} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* IMPACTO */}
            {activeSection === 'impact' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                    Tarjetas de métrica de impacto
                  </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImpactMetricCard
                    icon={TreePine}
                    value={5240}
                    unit="árboles"
                    label="Árboles plantados"
                    category="Reforestación"
                    verificationLevel="measured"
                    period="2024"
                    trend={24}
                  />
                  <ImpactMetricCard
                    icon={Droplets}
                    value={125000}
                    unit="litros"
                    label="Agua purificada"
                    category="Agua limpia"
                    verificationLevel="documented"
                    period="2024"
                    trend={12}
                  />
                  <ImpactMetricCard
                    icon={Users}
                    value={340}
                    unit="personas"
                    label="Empleos creados"
                    category="Empleo comunitario"
                    verificationLevel="calculated"
                    period="2024"
                    trend={8}
                  />
                  <ImpactMetricCard
                    icon={Zap}
                    value={850}
                    unit="MWh"
                    label="Energía renovable"
                    category="Clima"
                    verificationLevel="estimated"
                    period="2024"
                    trend={-3}
                  />
                </div>
              </section>
            )}

            {/* VALIDACIÓN */}
            {activeSection === 'validation' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                    Tarjetas de validación
                  </h1>
                </div>

                <div className="space-y-4">
                  <ValidationCard
                    validatorName="Susana Martínez García"
                    validatorId="VAL-2024-001"
                    projectName="Reforestación del Amazonas"
                    status="approved"
                    evidenceLevel="High"
                    methodology="Satélite + In-situ"
                    reviewDate="15 Mar 2024"
                    comment="La metodología aplicada cumple con estándares internacionales de monitoreo forestal."
                  />
                  <ValidationCard
                    validatorName="Dr. Carlos López"
                    validatorId="VAL-2024-002"
                    projectName="Energía solar comunitaria"
                    status="under-review"
                    evidenceLevel="Medium"
                    methodology="Medición directa + Facturación"
                    reviewDate="Pendiente"
                  />
                  <ValidationCard
                    validatorName="Elena Ruiz"
                    validatorId="VAL-2024-003"
                    projectName="Programa de empleo local"
                    status="pending"
                    evidenceLevel="Medium"
                    methodology="Verificación de registros"
                    reviewDate="Asignado"
                  />
                </div>
              </section>
            )}

            {/* CERTIFICADO */}
            {activeSection === 'certificate' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                    Vista previa de certificado
                  </h1>
                  <p className="text-muted-foreground">Diseño limpio enfocado en la evidencia, no en NFTs</p>
                </div>

                <CertificatePreview
                  certificateId="CERT-2024-0847"
                  status="active"
                  organizationName="Verde Sostenible S.A."
                  projectName="Reforestación Cuenca del Cauca"
                  impactValue="12,450"
                  impactUnit="hectáreas"
                  impactType="de bosque nativo restaurado"
                  validatorName="Instituto Verificador de Impacto"
                  methodology="Análisis satelital + Verificación en terreno"
                  evidenceLevel="Alto"
                  issuedDate="15 de marzo de 2024"
                  attestationUid="0x7f3E8A2C1B4D6F9E5A3C7B1D9F2E4A6C"
                  blockchainNetwork="Ethereum (Mainnet)"
                  evidenceHash="QmZyAA7P3c4E7B9D2F5H8K1M3N6P9R2T4V"
                />
              </section>
            )}

            {/* DATA VIS */}
            {activeSection === 'datavis' && (
              <section className="space-y-8">
                <div>
                  <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                    Lenguaje de visualización de datos
                  </h1>
                  <p className="text-muted-foreground">
                    Diferenciamos visualmente entre tipos de medición
                  </p>
                </div>

                <div className="space-y-8">
                  {[
                    { type: 'Medido', style: 'solid', desc: 'Línea sólida', color: 'text-brand-green' },
                    { type: 'Proyectado', style: 'dotted', desc: 'Línea punteada', color: 'text-muted-foreground' },
                    { type: 'Validado', style: 'filled', desc: 'Área rellena', color: 'text-brand-blue' },
                    { type: 'Declarado', style: 'muted', desc: 'Área atenuada', color: 'text-muted-foreground' },
                  ].map((item) => (
                    <div key={item.type} className="p-4 rounded-lg border border-border">
                      <p className="font-semibold text-foreground mb-2">{item.type}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <div className={`mt-4 h-2 rounded ${item.color} opacity-60 bg-current`} />
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                    Nodos de evidencia
                  </h3>
                  <div className="p-6 bg-muted/30 rounded-lg border border-border">
                    <div className="flex justify-between items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-brand-green" title="Nodo verificado" />
                      <GitBranch className="text-muted-foreground" />
                      <div className="h-8 w-8 rounded-full bg-brand-amber border-2 border-brand-amber" title="Nodo pendiente" />
                      <GitBranch className="text-muted-foreground" />
                      <div className="h-8 w-8 rounded-full bg-transparent border-2 border-brand-blue" title="Nodo en proceso" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Acción → Evidencia → Validación → Certificado
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
