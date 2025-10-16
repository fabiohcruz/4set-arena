/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '4set-arena-backend.elasticbeanstalk.com'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '4SET ARENA',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://localhost:5001/api/:path*'
          : 'http://backend:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;