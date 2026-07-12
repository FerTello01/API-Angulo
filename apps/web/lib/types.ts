// ─── Core Enums ────────────────────────────────────────────────────────────────

export type VerificationStatus =
  | 'borrador'
  | 'pendiente'
  | 'en_revision'
  | 'verificado'
  | 'rechazado'
  | 'expirado'

export type VerificationLevel = 'bronce' | 'plata' | 'oro' | 'platino'

export type MetricType =
  | 'ambiental'
  | 'social'
  | 'economico'
  | 'gobernanza'
  | 'ods'

export type EvidenceType =
  | 'documento'
  | 'informe'
  | 'certificado_externo'
  | 'datos_sensor'
  | 'auditoria'
  | 'fotografia'
  | 'video'

export type OrganizationSector =
  | 'energia_renovable'
  | 'agricultura_regenerativa'
  | 'economia_circular'
  | 'educacion'
  | 'salud'
  | 'agua_saneamiento'
  | 'movilidad_sostenible'
  | 'finanzas_impacto'

export type UserRole =
  | 'visitante'
  | 'administrador_empresa'
  | 'validador'
  | 'administrador_plataforma'

// ─── Organization ──────────────────────────────────────────────────────────────

export interface Organization {
  id: string
  slug: string
  nombre: string
  descripcion: string
  sector: OrganizationSector
  pais: string
  ciudad: string
  fundadaEn: string           // ISO date
  sitioWeb: string
  logoUrl: string
  coverUrl: string
  correo: string
  verificacionNivel: VerificationLevel | null
  verificacionEstado: VerificationStatus
  proyectos: number
  metricasVerificadas: number
  empleados: number
  ods: number[]               // ODS goal numbers
  etiquetas: string[]
  creadaEn: string
  actualizadaEn: string
}

// ─── Project ───────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  slug: string
  organizacionId: string
  nombre: string
  descripcion: string
  objetivo: string
  estado: VerificationStatus
  fechaInicio: string
  fechaFin: string | null
  pais: string
  ciudad: string
  beneficiarios: number
  ods: number[]
  etiquetas: string[]
  metricasCount: number
  evidenciasCount: number
  creadoEn: string
  actualizadoEn: string
}

// ─── ImpactMetric ──────────────────────────────────────────────────────────────

export interface ImpactMetric {
  id: string
  proyectoId: string
  organizacionId: string
  nombre: string
  descripcion: string
  tipo: MetricType
  unidad: string
  valorLinea: number
  valorActual: number
  valorMeta: number
  periodo: string             // e.g. "2024-Q1"
  estado: VerificationStatus
  metodologiaId: string | null
  evidenciasCount: number
  ods: number[]
  creadaEn: string
  verificadaEn: string | null
}

// ─── Evidence ──────────────────────────────────────────────────────────────────

export interface Evidence {
  id: string
  metricaId: string
  proyectoId: string
  tipo: EvidenceType
  titulo: string
  descripcion: string
  archivoUrl: string
  archivoNombre: string
  archivoTamanio: number      // bytes
  estado: VerificationStatus
  subidaEn: string
  verificadaEn: string | null
  verificadorId: string | null
  notas: string
}

// ─── Methodology ───────────────────────────────────────────────────────────────

export interface Methodology {
  id: string
  nombre: string
  descripcion: string
  version: string
  organizacionEmisora: string
  urlReferencia: string
  tiposMetrica: MetricType[]
  sectores: OrganizationSector[]
  activa: boolean
  creadaEn: string
}

// ─── Validator ─────────────────────────────────────────────────────────────────

export interface Validator {
  id: string
  nombre: string
  apellido: string
  correo: string
  organizacion: string
  especialidades: MetricType[]
  sectores: OrganizationSector[]
  verificacionesRealizadas: number
  calificacion: number        // 1–5
  activo: boolean
  avatarUrl: string
  certificaciones: string[]
  ingresadoEn: string
}

// ─── ValidationRequest ─────────────────────────────────────────────────────────

export interface ValidationRequest {
  id: string
  proyectoId: string
  organizacionId: string
  validadorId: string | null
  tipo: 'proyecto' | 'metrica' | 'evidencia'
  referenciaId: string        // id of the entity being validated
  estado: VerificationStatus
  nivelSolicitado: VerificationLevel
  descripcion: string
  comentarios: string
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  fechaSolicitud: string
  fechaLimite: string
  fechaResolucion: string | null
  historial: ReviewEvent[]
}

export interface ReviewEvent {
  id: string
  solicitudId: string
  autorId: string
  autorNombre: string
  autorRol: UserRole
  tipo: 'comentario' | 'cambio_estado' | 'solicitud_evidencia' | 'aprobacion' | 'rechazo'
  contenido: string
  estadoAnterior: VerificationStatus | null
  estadoNuevo: VerificationStatus | null
  creadoEn: string
}

// ─── Certificate ───────────────────────────────────────────────────────────────

export interface Certificate {
  id: string
  numero: string              // e.g. "IV-2024-0042"
  organizacionId: string
  proyectoId: string | null
  nivel: VerificationLevel
  estado: 'activo' | 'expirado' | 'revocado'
  emitidoEn: string
  expiraEn: string
  emisorNombre: string
  emisorId: string
  metricasIncluidas: string[] // metric ids
  urlPublica: string
  codigoVerificacion: string
}

// ─── Attestation ───────────────────────────────────────────────────────────────

export interface Attestation {
  id: string
  certificadoId: string
  validadorId: string
  metricaId: string
  valor: number
  unidad: string
  periodoInicio: string
  periodoFin: string
  metodologiaId: string
  notas: string
  firmadaEn: string
  valida: boolean
}
