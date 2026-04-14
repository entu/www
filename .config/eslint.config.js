import stylistic from '@stylistic/eslint-plugin'
import unicorn from 'eslint-plugin-unicorn'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  ...vue.configs['flat/recommended'],
  {
    ignores: ['.vitepress/cache/']
  },
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser
    },
    plugins: {
      '@stylistic': stylistic,
      unicorn
    },
    rules: {
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-date-now': 'error',
      'vue/attributes-order': ['error', {
        alphabetical: true,
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          ['OTHER_DIRECTIVES', 'CONTENT'],
          ['ATTR_STATIC', 'ATTR_SHORTHAND_BOOL'],
          'ATTR_DYNAMIC',
          'EVENTS'
        ]
      }],
      'vue/define-emits-declaration': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/prefer-use-template-ref': 'error'
    }
  }
]
