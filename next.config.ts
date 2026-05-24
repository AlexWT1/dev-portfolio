const nextConfig = {
  // Enable static exports for SSG
  output: undefined, // Keep as server for now, can switch to 'export' for full SSG

  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // Experimental features
  experimental: {},

  // Redirect to handle common paths
  async redirects() {
    return [
      {
        source: '/project/:slug',
        destination: '/projects/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
