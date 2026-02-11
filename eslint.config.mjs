import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...compat
    .config({
      extends: ["@feature-sliced"],
    })
    .map((config) => ({
      ...config,
      languageOptions: {
        ...config.languageOptions,
        ecmaVersion: "latest",
      },
    })),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. React and Next.js packages
            ["^react", "^next"],
            // 2. External packages
            ["^@?\\w"],
            // 3. Internal packages (FSD Layers) - Specific Order
            [
              "^@/app",
              "^@/pages",
              "^@/widgets",
              "^@/features",
              "^@/entities",
              "^@/shared",
            ],
            // 4. Other internal imports (fallback)
            ["^@/"],
            // 5. Parent imports
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // 6. Other relative imports
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // 7. Styles
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "import/order": "off", // Disable conflicting rule
      "import/no-internal-modules": [
        "error",
        {
          allow: [
            "**/shared/**",
            "**/entities/**",
            "**/features/**",
            "**/widgets/**",
            "next/**",
            "react",
            "@hookform/resolvers/**",
            "lucide-react",
            "posthog-js/**",
            "prismjs/**",
            "**/styles/**",
            "**/pages/**",
            "eslint/**",
          ],
        },
      ],
    },
  },
  {
    files: ["**/index.ts", "**/index.tsx"],
    rules: {
      "import/no-internal-modules": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
