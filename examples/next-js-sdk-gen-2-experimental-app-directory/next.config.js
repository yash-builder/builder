/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * This setting is required for Builder's Visual Editor to work with your site.
   */
  // transpilePackages: ['@builder.io/sdk-react-nextjs'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['isolated-vm'],
  },
};

module.exports = nextConfig;
