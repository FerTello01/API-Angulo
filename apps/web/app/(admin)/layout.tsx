'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ProofactLogo } from '@/components/brand/proofact-logo'
import {
  LayoutDashboard,
  FilePlus,
  ShieldCheck,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { getOpenApiDocsUrl } from '@/lib/api-client'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/issue', label: 'Emitir certificado', icon: FilePlus },
  { href: '/admin/certificates', label: 'Certificados', icon: ShieldCheck },
  { href: '/developers', label: 'API Docs', icon: BookOpen },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/admin/login'

  useEffect(() => {
    if (!isLogin && sessionStorage.getItem('proofact:admin-session') !== 'active') {
      router.replace('/admin/login')
    }
  }, [isLogin, router])

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 h-14">
          <Link href="/admin" className="flex items-center gap-3">
            <ProofactLogo size="sm" variant="full" theme="color" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:inline">
              Panel de gestión
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={getOpenApiDocsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Scalar API <ExternalLink className="h-3 w-3" />
            </a>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              Sitio público
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex gap-8">
          <aside className="hidden w-48 shrink-0 md:block">
            <nav className="sticky top-8 space-y-0.5">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === link.href
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
