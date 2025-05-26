/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Disable webpack cache to prevent caching errors
    config.cache = false;
    
    // Clear any existing cache configuration
    if (config.cache === true || (typeof config.cache === 'object' && config.cache !== null)) {
      config.cache = false;
    }
    
    return config;
  },
};

module.exports = nextConfig;