<script setup>
import { useData } from 'vitepress'

const { frontmatter, lang } = useData()
const { labels, tiers } = frontmatter.value.pricing
</script>

<template>
  <div class="pricing-grid">
    <div
      v-for="tier in tiers"
      :key="tier.plan"
      :class="['pricing-card', { featured: tier.featured }]"
    >
      <div
        v-if="tier.featured"
        class="pricing-badge"
      >
        {{ labels.badge }}
      </div>
      <div class="pricing-price">
        <span class="amount">€{{ tier.price }}</span>
        <span class="period">{{ labels.period }}</span>
      </div>
      <ul class="pricing-features">
        <li>{{ tier.objects }} {{ labels.objects }}</li>
        <li>{{ tier.storage }} {{ labels.storage }}</li>
        <li
          v-for="extra in tier.extras"
          :key="extra"
        >
          {{ extra }}
        </li>
      </ul>
    </div>
  </div>

  <p class="pricing-vat">
    {{ labels.vat }}
  </p>

  <div class="pricing-cta-wrap">
    <a
      class="pricing-cta"
      :href="`https://entu.app/new?locale=${lang}`"
      target="_blank"
      rel="noopener"
      @click="window.analytics?.track('signup_click')"
    >{{ labels.cta }}</a>
  </div>
</template>

<style scoped>
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 24px 0 8px;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}

.pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: box-shadow 0.2s;
}

.pricing-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f59e0b;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0px 8px;
  border-radius: 20px;
  white-space: nowrap;
}

.pricing-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.pricing-card.featured {
  border-color: #f59e0b;
  border-width: 2px;
}

.pricing-price {
  margin-bottom: 16px;
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.period {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-left: 2px;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.pricing-features li {
  padding: 4px 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}

.pricing-features li:last-child {
  border-bottom: none;
}

.pricing-cta {
  display: block;
  text-align: center;
  padding: 8px 32px;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  background-color: #f59e0b;
  color: #fff;
  border-radius: 24px;
  transition: background-color 0.2s;
}

.pricing-cta:hover {
  background-color: #d97706;
  color: #fff;
  text-decoration: none;
}

.pricing-cta-wrap {
  display: flex;
  justify-content: center;
  margin: 24px 0 12px;
}

.pricing-vat {
  margin: 0 0 40px;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  text-align: center;
}
</style>
