/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer is an ESM-only package — must be transpiled by Next.js
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
