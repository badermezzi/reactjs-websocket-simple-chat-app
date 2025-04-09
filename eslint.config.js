import pluginJs from '@eslint/js';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist'] },
  pluginJs.configs.recommended, // Add base JS rules
  pluginReactConfig, // Add React recommended rules
  {
    // Your custom settings/overrides
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest', // Use 'latest' consistently
      sourceType: 'module',
      globals: {
        ...globals.browser, // Spread browser globals
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    // Settings can be useful for plugins like eslint-plugin-react
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
    rules: {
      // Spread React Hooks recommended rules here if needed, or configure individually
      ...reactHooks.configs.recommended.rules,
      // Custom rules or overrides
      'no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ], // Adjusted unused vars rule
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // You can override rules from recommended configs here if needed
      'react/react-in-jsx-scope': 'off', // Disable rule for new JSX transform
      // e.g., 'react/prop-types': 'off'
    },
  },
  eslintConfigPrettier, // Add this last to override other configs
];
