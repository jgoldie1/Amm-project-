const criticalRules = {
  'no-class-assign': 'error',
  'no-const-assign': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-else-if': 'error',
  'no-dupe-keys': 'error',
  'no-func-assign': 'error',
  'no-import-assign': 'error',
  'no-obj-calls': 'error',
  'no-self-assign': 'error',
  'no-setter-return': 'error',
  'no-unreachable': 'error',
  'no-unreachable-loop': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'no-useless-backreference': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.vercel/**',
      '**/.next/**',
      '**/vendor/**',
      '**/*.min.js',
      'amm-omniverse/src/**/*.{ts,tsx}',
    ],
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    ignores: ['public/holo5dx-renderer.js', 'amm-omniverse/api/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
    rules: criticalRules,
  },
  {
    files: ['public/holo5dx-renderer.js', 'amm-omniverse/api/**/*.js', 'amm-omniverse/**/*.mjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: criticalRules,
  },
];
