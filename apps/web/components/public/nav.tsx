'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ProofactLogo } from '@/components/brand/proofact-logo'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/explore', label: 'Explorar' },
  { href: '/how-it-works', label: 'Cómo funciona' },
  { href: '/verify', label: 'Verificar certificado' },
  { href: '/developers', label: 'API' },
  { href: '/brand', label: 'Marca' },
]

export function PublicNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: '#F3EFE7',
        borderBottom: '1px solid #D8D3CB',
        boxShadow: '0 1px 3px rgba(20,34,31,0.08)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-0 h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label="Proofact — inicio">
          <ProofactLogo size="md" variant="full" theme="color" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-[#EBF5F1] text-[#2D7A5E]'
                  : 'text-[#4A4F55] hover:text-[#14221F] hover:bg-[#E8E4DC]',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/admin/login"
            className="rounded-md px-4 py-1.5 text-sm font-medium text-[#4A4F55] hover:text-[#14221F] hover:bg-[#E8E4DC] transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#2D7A5E', color: '#FFFFFF' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#256B52')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2D7A5E')}
          >
            Registrar empresa
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md text-[#4A4F55] hover:text-[#14221F] hover:bg-[#E8E4DC] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-5 pb-5 pt-2"
          style={{ borderTop: '1px solid #D8D3CB', backgroundColor: '#F3EFE7' }}
        >
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[#EBF5F1] text-[#2D7A5E]'
                    : 'text-[#4A4F55] hover:text-[#14221F] hover:bg-[#E8E4DC]',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 pt-4" style={{ borderTop: '1px solid #D8D3CB' }}>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-[#4A4F55] hover:text-[#14221F] hover:bg-[#E8E4DC] transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-semibold text-center transition-colors"
              style={{ backgroundColor: '#2D7A5E', color: '#FFFFFF' }}
            >
              Registrar empresa
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-3">
              <ProofactLogo size="sm" variant="full" theme="color" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Plataforma de verificación independiente del impacto social y ambiental. Rigor,
              transparencia y trazabilidad hasta la evidencia. Con API para integradores.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plataforma</p>
            <ul className="space-y-2">
              {[
                { href: '/explore', label: 'Explorar empresas' },
                { href: '/how-it-works', label: 'Cómo funciona' },
                { href: '/verify', label: 'Verificar certificado' },
                { href: '/developers', label: 'API para desarrolladores' },
                { href: '/brand', label: 'Sistema de marca' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Empresa</p>
            <ul className="space-y-2">
              {[
                { href: '/register', label: 'Registrar mi empresa' },
                { href: '/login', label: 'Panel de acceso' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Proofact. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Las verificaciones tienen validez documental, no son títulos-valor.
          </p>
        </div>
      </div>
    </footer>
  )
}
