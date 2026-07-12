'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProofactLogo } from '@/components/brand/proofact-logo'
import { ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sessionStorage.setItem('proofact:admin-session', 'active')
    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <ProofactLogo size="md" variant="full" theme="color" />
        </div>
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-heading text-2xl">Panel de gestión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acceso operacional para emitir y monitorear certificados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operaciones@empresa.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar al panel
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Auth real (API keys, SSO) próximamente.{' '}
          <Link href="/developers" className="text-primary hover:underline">
            Ver documentación API
          </Link>
        </p>
      </Card>
    </div>
  )
}
