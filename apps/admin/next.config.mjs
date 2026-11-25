/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sakeena/db"],
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
export default nextConfig;
