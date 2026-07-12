'use client'

interface ProofactSymbolProps {
  size?: number
  className?: string
}

/**
 * Abstract symbol combining:
 * - Evidence nodes (circles)
 * - Traceability lines
 * - Progress & verification
 * - Subtle P monogram
 */
export function ProofactSymbol({ size = 32, className = '' }: ProofactSymbolProps) {
  const viewBox = '0 0 64 64'
  const strokeWidth = 1.5

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-primary ${className}`}
    >
      {/* Background circle */}
      <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.08" />

      {/* Evidence nodes */}
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
      <circle cx="44" cy="20" r="3.5" fill="currentColor" />
      <circle cx="32" cy="44" r="3.5" fill="currentColor" />

      {/* Traceability lines forming P */}
      <path
        d="M 20 20 L 32 32"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 44 20 L 32 32"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 32 32 L 32 44"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Verification arc */}
      <path
        d="M 38 42 Q 42 40 44 36"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Central verification dot */}
      <circle cx="32" cy="32" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  )
}
