/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removido para compatibilidade com Vercel
  trailingSlash: true,
  images: {
    domains: ['localhost', '4set-arena-backend.elasticbeanstalk.com'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://4set-arena-production.up.railway.app/api',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '4SET ARENA',
  },
};

module.exports = nextConfig;