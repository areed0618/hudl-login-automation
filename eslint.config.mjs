// ESLint Configuration File
// Purpose: Enforces code quality, formatting consistency, and catches unused variables or bugs.
// Used by: 'npm run lint' locally and the GitHub Actions CI pipeline before tests execute.

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Load standard JavaScript and TypeScript recommended rule sets
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Exclude auto-generated folders and dependencies from linting
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'dist/**'],
  },
  {
    // Custom project rules: flag unused variables as errors and console.log statements as warnings
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'warn',
    },
  }
);
