<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed, onMounted } from 'vue'

const { Layout } = DefaultTheme
const { lang } = useData()

const appStoreBadge = computed(() => lang.value === 'et'
  ? '/badges/app-store-et.svg'
  : '/badges/app-store-en.svg')

const appStoreAlt = computed(() => lang.value === 'et'
  ? 'Laadi alla App Store\'ist'
  : 'Download on the App Store')

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
  <layout>
    <template #home-hero-actions-after>
      <a
        class="app-store-badge"
        href="https://apps.apple.com/app/apple-store/id1520575542?pt=120355100&ct=www&mt=8"
        rel="noopener"
        target="_blank"
      >
        <img
          height="40"
          :alt="appStoreAlt"
          :src="appStoreBadge"
        >
      </a>
    </template>
  </layout>
</template>

<style scoped>
.app-store-badge {
  display: inline-flex;
  margin-top: 12px;
  margin-left: 12px;
  vertical-align: bottom;
}

.app-store-badge img {
  height: 40px;
  width: auto;
}
</style>
