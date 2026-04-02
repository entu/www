<script setup>
import { useData } from 'vitepress'
import BookOpenSvg from '../../public/icons/book-open.svg?raw'
import LandmarkSvg from '../../public/icons/landmark.svg?raw'
import BuildingSvg from '../../public/icons/building.svg?raw'
import MonitorSvg from '../../public/icons/monitor.svg?raw'
import ServerSvg from '../../public/icons/server.svg?raw'
import ClipboardListSvg from '../../public/icons/clipboard-list.svg?raw'

const { frontmatter } = useData()

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
  <div class="use-cases-grid">
    <div
      v-for="item in frontmatter.usecases"
      :key="item.title"
      class="use-case-card"
    >
      <div class="use-case-header">
        <div
          class="use-case-icon"
          v-html="iconMap[item.icon]"
        />
        <p class="use-case-title">
          {{ item.title }}
        </p>
      </div>
      <p class="use-case-details">
        {{ item.details }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
}

@media (max-width: 767px) {
  .use-cases-grid {
    grid-template-columns: 1fr;
  }
}

.use-case-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--vp-c-divider);
  padding: 24px;
  background: var(--vp-c-bg);
}

.use-case-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.use-case-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--vp-c-text-1);
}

.use-case-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.use-case-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

.use-case-details {
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>
