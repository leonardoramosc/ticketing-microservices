/** @type {import('next').NextConfig} */
const nextConfig = {
  webpackDevMiddleware: config => {
    config.watchOptions.poll = 300; // instead of watch file changes, pull files every 300ms
    return config;
  }
}

module.exports = nextConfig