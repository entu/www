<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'

const { Layout } = DefaultTheme

onMounted(() => {
  document.addEventListener('click', (e) => {
    const el = (e.target).closest('.VPHero a[href*="entu.app/new"]')
    if (el) {
      window.analytics?.track('hero_signup_click')
    }
  })
})
</script>

<template>
  <Layout />
</template>
