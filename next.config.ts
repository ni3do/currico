import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Infomaniak S3 storage for uploaded files
        protocol: "https",
        hostname: "*.s3.pub1.infomaniak.cloud",
      },
      {
        // Test storage domain for E2E test data
        protocol: "https",
        hostname: "storage.test",
      },
      {
        // Infomaniak S3 storage for uploaded files
        protocol: "https",
        hostname: "*.s3.swiss-backup04.infomaniak.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

// Wrap with next-intl first, then Sentry
const configWithIntl = withNextIntl(nextConfig);

// Only apply Sentry in production or when configured
export default process.env.SENTRY_DSN
  ? withSentryConfig(configWithIntl, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : configWithIntl;
