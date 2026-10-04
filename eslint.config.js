import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
export default ts.config(...ts.configs.recommended, {
  files: ['frontend/src/**/*.{ts,tsx}'],
  plugins: { 'react-hooks': hooks },
  rules: { ...hooks.configs.recommended.rules, '@typescript-eslint/no-explicit-any': 'error' },
});
