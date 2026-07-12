/** @type {import('next').NextConfig} */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

const nextConfig = {
  // Monorepo: incluir dependencias del workspace al trazar serverless bundles.
  outputFileTracingRoot: monorepoRoot,
  // Evita mismatch de hidratación en el boundary de metadata (Next.js 16 streaming).
  htmlLimitedBots: /.*/,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
