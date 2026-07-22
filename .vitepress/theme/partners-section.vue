<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const partners = computed(() => frontmatter.value.partners)
</script>

<template>
  <section class="partners">
    <div class="partners-kicker">
      {{ partners.heading }}
    </div>
    <div class="partners-list">
      <span
        v-for="name in partners.names"
        :key="name"
        class="partners-name"
      >{{ name }}</span>
    </div>
  </section>
</template>

<style scoped>
.partners {
  margin: 0 64px;
  border-top: 1px solid var(--e-rule);
  padding: 56px 0 72px;
}

.partners-kicker {
  font: 500 12px var(--e-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--e-muted);
  margin-bottom: 24px;
}

.partners-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
}

.partners-name {
  font: 500 14px var(--e-font-body);
  color: var(--e-secondary);
}

@media (max-width: 768px) {
  .partners {
    margin: 0 24px;
    padding: 48px 0 56px;
  }
}
</style>
