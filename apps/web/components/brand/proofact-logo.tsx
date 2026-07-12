interface ProofactLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** 'full' = símbolo + wordmark, 'symbol' = solo símbolo, 'wordmark' = solo texto */
  variant?: 'full' | 'symbol' | 'wordmark'
  /** 'color' (default) | 'white' para fondos oscuros */
  theme?: 'color' | 'white'
}

/**
 * Logo oficial de Proofact.
 * Símbolo: nodo azul abajo-izq, nodo verde arriba-der, líneas navy formando
 * una flecha/grafo ascendente.
 * Wordmark: "proof" en Ink Navy, "act" en Proof Green.
 */
export function ProofactLogo({
  size = 'md',
  variant = 'full',
  theme = 'color',
  className = '',
}: ProofactLogoProps) {
  // Ink Navy #14221F | Proof Green #2D7A5E | Evidence Blue #4B78D1
  const navy  = theme === 'white' ? '#FFFFFF' : '#14221F'
  const green = theme === 'white' ? '#B9E769' : '#2D7A5E'
  const blue  = theme === 'white' ? '#A0C4FF' : '#4B78D1'

  const heights = { sm: 20, md: 28, lg: 40 }
  const symbolH = heights[size]
  // Symbol viewBox is 44×44, keep aspect ratio
  const symbolW = symbolH

  const textSizes = { sm: 14, md: 20, lg: 28 }
  const textH = textSizes[size]
  const gap = Math.round(symbolW * 0.35)

  // Total SVG width depends on variant
  const wordmarkW = Math.round(textH * 4.0) // approximate "proofact" width
  const totalW =
    variant === 'symbol'   ? symbolW :
    variant === 'wordmark' ? wordmarkW :
    symbolW + gap + wordmarkW

  const totalH = Math.max(symbolH, textH + 2)

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Proofact"
      role="img"
    >
      {/* ── Symbol ── */}
      {variant !== 'wordmark' && (
        <g transform={`translate(0, ${(totalH - symbolH) / 2})`}>
          {/*
            Recreación fiel del símbolo del logo:
            · Línea horizontal base (navy)
            · Línea diagonal ascendente derecha (navy)
            · Nodo azul (Evidence Blue) en extremo inferior-izquierdo
            · Nodo verde (Proof Green) en extremo superior-derecho
            · Trazo corto vertical debajo del nodo azul (navy)
            Escala en viewBox 44×44
          */}
          <svg width={symbolW} height={symbolH} viewBox="0 0 44 44" fill="none">
            {/* Trazo corto vertical inferior (pie del símbolo) */}
            <line
              x1="10" y1="32"
              x2="10" y2="40"
              stroke={navy}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Línea horizontal base: del nodo azul hacia el centro */}
            <line
              x1="10" y1="32"
              x2="22" y2="32"
              stroke={navy}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Línea diagonal ascendente: del centro al nodo verde */}
            <line
              x1="22" y1="32"
              x2="32" y2="14"
              stroke={navy}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Nodo Evidence Blue — inferior izquierdo */}
            <circle cx="10" cy="32" r="6.5" fill={blue} />
            {/* Nodo Proof Green — superior derecho */}
            <circle cx="32" cy="14" r="6.5" fill={green} />
          </svg>
        </g>
      )}

      {/* ── Wordmark ── */}
      {variant !== 'symbol' && (
        <text
          x={variant === 'wordmark' ? 0 : symbolW + gap}
          y={totalH / 2}
          dominantBaseline="central"
          fontFamily="Manrope, system-ui, sans-serif"
          fontWeight="700"
          fontSize={textH}
          letterSpacing="-0.02em"
        >
          <tspan fill={navy}>proof</tspan>
          <tspan fill={green}>act</tspan>
        </text>
      )}
    </svg>
  )
}
