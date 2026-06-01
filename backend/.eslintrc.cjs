module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2024: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
    'no-console': 'off'
  }
};
