/** @type {import('next').NextConfig} */
const nextConfig = {
  // SWC-powered barrel-import optimization (replaces slow Babel parsing of 500KB icon files)
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/fa",
      "react-icons/md",
      "react-icons/fi",
      "lucide-react",
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
