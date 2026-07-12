/** @type {import('next').NextConfig} */
const nextConfig = {
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
