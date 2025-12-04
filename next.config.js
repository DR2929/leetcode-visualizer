/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude scripts from serverless function analysis
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;

