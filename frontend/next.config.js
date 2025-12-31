// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // true if this is a permanent redirect (301)
      },
    ]
  },
}

module.exports = nextConfig;
