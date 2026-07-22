<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'

const { Layout } = DefaultTheme
const { frontmatter, page, theme } = useData()

const isDoc = computed(() => frontmatter.value.layout === undefined)

const docKicker = computed(() => {
  const path = `/${page.value.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '')}`
  const groups = theme.value.sidebar || []

  for (const group of groups) {
    for (const item of group.items || []) {
      const link = (item.link || '').replace(/\/$/, '')
      if (link && (link === path.replace(/\/$/, '') || path.startsWith(`${link}/`))) {
        return group.text
      }
    }
  }

  return null
})
</script>

<template>
  <layout>
    <template #doc-before>
      <div
        v-if="isDoc && docKicker"
        class="doc-kicker"
      >
        {{ docKicker }}
      </div>
    </template>
  </layout>
</template>
