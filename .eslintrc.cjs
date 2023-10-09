module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
    'prettier',
    'import',
    'simple-import-sort',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-empty-function': 'off',
    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: false,
        optionalDependencies: false,
        peerDependencies: false,
        packageDir: './',
      },
    ],
    'import/prefer-default-export': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'linebreak-style': 0
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    // override "simple-import-sort" config
    {
      files: ['*.ts'],
      rules: {
        'no-console': 'error',
      },
    },
    {
      files: ['*.js', '*.ts'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Internal packages.
              ['^(@|components)(/.*|$)'],
              // Side effect imports.
              ['^\\u0000'],
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // Style imports.
              ['^.+\\.?(css)$'],
            ],
          },
        ],
      },
    },
  ],
};
