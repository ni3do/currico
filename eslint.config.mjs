import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/", ".next/", "prisma/"],
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn"] }],
    },
  },
];

export default eslintConfig;
