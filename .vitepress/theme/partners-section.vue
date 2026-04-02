<script setup>
import { useData } from 'vitepress'
import BookOpenSvg from '../../public/icons/book-open.svg?raw'
import LandmarkSvg from '../../public/icons/landmark.svg?raw'
import BuildingSvg from '../../public/icons/building.svg?raw'
import MonitorSvg from '../../public/icons/monitor.svg?raw'
import ServerSvg from '../../public/icons/server.svg?raw'
import ClipboardListSvg from '../../public/icons/clipboard-list.svg?raw'

const { frontmatter } = useData()
const partners = frontmatter.value.partners

const iconMap = {
  'book-open': BookOpenSvg,
  landmark: LandmarkSvg,
  building: BuildingSvg,
  monitor: MonitorSvg,
  server: ServerSvg,
  'clipboard-list': ClipboardListSvg
}
</script>

<template>
  <div class="partners-grid">
    <span
      v-for="partner in partners"
      :key="partner.name"
      class="partner-item"
      :style="{ '--partner-color': partner.color, '--partner-dark-color': partner.darkColor }"
    >
      <span
        class="partner-icon"
        v-html="iconMap[partner.icon]"
      />
      {{ partner.name }}
    </span>
  </div>
</template>

<style scoped>
.partners-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 24px 0 48px;
}

.partner-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  background-color: var(--partner-color);
}

.dark .partner-item {
  background-color: var(--partner-dark-color);
}

.partner-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: var(--vp-c-text-2);
}

.partner-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
