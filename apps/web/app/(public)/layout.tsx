import { PublicNav, PublicFooter } from '@/components/public/nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <PublicFooter />
    </>
  )
}
