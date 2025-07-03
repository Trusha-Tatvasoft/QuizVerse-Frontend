import angular from '@angular-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';
 
export default [
  {
    ignores: ['**/*.spec.ts', '**/*.stories.ts', '.storybook/**'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@angular-eslint': angular,
    },
    rules: {
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-redeclare': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variable',
          format: ['camelCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'no-var': 'error',
      'no-console': 'error',
      'max-lines-per-function': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'no-debugger': 'error',
      'no-eq-null': 'warn',
    },
  },
];