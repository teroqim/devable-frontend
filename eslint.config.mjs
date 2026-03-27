import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'unused-imports/no-unused-imports': 'error',
    },
  },
  prettierConfig,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '**/*.config.js',
    '**/*.config.cjs',
    '**/*.config.mjs',
  ]),
]);

export default eslintConfig;
