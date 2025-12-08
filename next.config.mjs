// next.config.mjs

import bundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

// نجهّز الـ plugin
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  compiler: {
    removeConsole: isProd,
    reactRemoveProperties: isProd,
    styledComponents: true,
  },
};

// لازم نصدّر الـ config بعد ما نمرّره على withBundleAnalyzer
export default withBundleAnalyzer(nextConfig);
