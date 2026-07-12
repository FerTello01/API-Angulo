'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge, VerificationLevelBadge, MetricTypeBadge } from '@/components/impact/badges'
import { mockOrganizations } from '@/lib/mock-data'
import type { VerificationLevel, OrganizationSector, MetricType } from '@/lib/types'
import {
  Search,
  Building2,
  MapPin,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react'

// ─── Filter data ───────────────────────────────────────────────────────────────

const sectorLabels: Record<OrganizationSector, string> = {
  energia_renovable: 'Energía renovable',
  agricultura_regenerativa: 'Agricultura regenerativa',
  economia_circular: 'Economía circular',
  educacion: 'Educación',
  salud: 'Salud',
  agua_saneamiento: 'Agua y saneamiento',
  movilidad_sostenible: 'Movilidad sostenible',
  finanzas_impacto: 'Finanzas de impacto',
}

const levelOptions: { value: VerificationLevel; label: string }[] = [
  { value: 'platino', label: 'Platino' },
  { value: 'oro', label: 'Oro' },
  { value: 'plata', label: 'Plata' },
  { value: 'bronce', label: 'Bronce' },
]

const metricTypeOptions: { value: MetricType; label: string }[] = [
  { value: 'ambiental', label: 'Ambiental' },
  { value: 'social', label: 'Social' },
  { value: 'economico', label: 'Económico' },
  { value: 'gobernanza', label: 'Gobernanza' },
]

// ─── FilterPill ────────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

// ─── OrgCard ───────────────────────────────────────────────────────────────────

function OrgCard({ org }: { org: (typeof mockOrganizations)[number] }) {
  const sector = sectorLabels[org.sector] ?? org.sector
  return (
    <Link href={`/organizations/${org.slug}`}>
      <Card className="group flex flex-col gap-0 overflow-hidden p-0 h-full transition-shadow hover:shadow-md">
        <div className="h-14 w-full bg-[oklch(0.22_0.04_155)]" />
        <div className="flex flex-col flex-1 p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-11 w-11 -mt-8 shrink-0 items-center justify-center rounded-xl border-2 border-card bg-card shadow-sm">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            {org.verificacionNivel && (
              <VerificationLevelBadge level={org.verificacionNivel} size="sm" />
            )}
          </div>

          <div className="mt-3 flex-1">
            <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
              {org.nombre}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {org.ciudad}, {org.pais}
            </div>
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {org.descripcion}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {sector}
            </span>
            {org.etiquetas.slice(0, 2).map((t) => (
              <span key={t} className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-sm text-foreground">{org.proyectos}</p>
                <p className="text-[10px] text-muted-foreground">Proyectos</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{org.metricasVerificadas}</p>
                <p className="text-[10px] text-muted-foreground">Métricas</p>
              </div>
            </div>
            <StatusBadge status={org.verificacionEstado} size="sm" />
          </div>
        </div>
      </Card>
    </Link>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [selectedSectors, setSelectedSectors] = useState<OrganizationSector[]>([])
  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  function toggleSector(s: OrganizationSector) {
    setSelectedSectors((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  const filtered = useMemo(() => {
    return mockOrganizations.filter((org) => {
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        org.nombre.toLowerCase().includes(q) ||
        org.descripcion.toLowerCase().includes(q) ||
        org.ciudad.toLowerCase().includes(q) ||
        org.pais.toLowerCase().includes(q) ||
        org.etiquetas.some((t) => t.toLowerCase().includes(q))

      const matchesSector =
        selectedSectors.length === 0 || selectedSectors.includes(org.sector)

      const matchesLevel =
        !selectedLevel || org.verificacionNivel === selectedLevel

      return matchesQuery && matchesSector && matchesLevel
    })
  }, [query, selectedSectors, selectedLevel])

  const activeFilterCount =
    selectedSectors.length + (selectedLevel ? 1 : 0)

  function clearFilters() {
    setSelectedSectors([])
    setSelectedLevel(null)
    setQuery('')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-normal text-foreground md:text-4xl text-balance">
          Explorar empresas
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Descubre organizaciones cuyo impacto social y ambiental ha sido verificado de forma independiente.
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, sector, ciudad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          className="shrink-0 gap-2"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="mt-4 rounded-xl border border-border bg-card p-5 space-y-5">
          {/* Sector */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sector / Industria
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(sectorLabels) as OrganizationSector[]).map((s) => (
                <FilterPill
                  key={s}
                  label={sectorLabels[s]}
                  active={selectedSectors.includes(s)}
                  onClick={() => toggleSector(s)}
                />
              ))}
            </div>
          </div>

          {/* Verification level */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nivel de verificación
            </p>
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((l) => (
                <FilterPill
                  key={l.value}
                  label={l.label}
                  active={selectedLevel === l.value}
                  onClick={() =>
                    setSelectedLevel((prev) => (prev === l.value ? null : l.value))
                  }
                />
              ))}
            </div>
          </div>

          {/* Metric type */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tipo de métrica
            </p>
            <div className="flex flex-wrap gap-2">
              {metricTypeOptions.map((m) => (
                <MetricTypeBadge
                  key={m.value}
                  type={m.value}
                  size="sm"
                  className="cursor-pointer"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mt-6 mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length === mockOrganizations.length
            ? `${filtered.length} organizaciones`
            : `${filtered.length} de ${mockOrganizations.length} organizaciones`}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/40 py-16 text-center">
          <Building2 className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-semibold text-foreground">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prueba con otros términos de búsqueda o elimina los filtros activos.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      )}

      {/* Pagination placeholder */}
      {filtered.length > 0 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled>Anterior</Button>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground">1</span>
          <Button variant="outline" size="sm" disabled>Siguiente</Button>
        </div>
      )}
    </div>
  )
}
