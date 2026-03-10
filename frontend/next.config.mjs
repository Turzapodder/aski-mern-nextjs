/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Strip /api suffix to get the backend origin for the rewrite destination.
    // In production: NEXT_PUBLIC_API_URL=https://yourapi.onrender.com/api
    // In development: falls back to http://localhost:8000
    const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.svgrepo.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
