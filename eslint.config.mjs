// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import perfectionist from 'eslint-plugin-perfectionist';

export default defineConfig([
  {
    ignores: [
      'eslint.config.mjs',
      '**/*.spec.ts',
      '**/*.test.ts',
      'src/metadata.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...eslintNestJs.configs.flatRecommended,
  perfectionist.configs['recommended-natural'],
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 'warn',
      '@darraghor/nestjs-typed/api-method-should-specify-api-response': 'warn',
      // todo: this should be on, but it causes a lot of false positives in the current state of the codebase
      '@darraghor/nestjs-typed/injectable-should-be-provided': ['off'],
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-arrays': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-type-unions': 'off',
      'perfectionist/sort-modules': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
]);
