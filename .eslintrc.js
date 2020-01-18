module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'prettier',
    'prettier/vue',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    camelcase: 'off',
    'max-len': [
      'warn',
      {
        code: 130
      }
    ],
    'prefer-destructuring': 'error',
    'radix': 'off',
    'consistent-return': 'error',
    'vue/name-property-casing': 'off',
    'import/no-named-as-default-member': 'off',
    'consistent-return': 'off',
    'prefer-destructuring': 'warn',
    'no-unused-vars': 'warn'
  }
}
