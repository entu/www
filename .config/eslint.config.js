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
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/eol-last': 'error',
      '@stylistic/indent': ['error', 2],
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-string-slice': 'error',
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
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      'vue/define-emits-declaration': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/prefer-use-template-ref': 'error'
    }
  }
]
