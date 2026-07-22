<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, lang } = useData()

const pricing = computed(() => frontmatter.value.pricing)

function trackSignup () {
  window.analytics?.track('signup_click')
}
</script>

<template>
  <section
    :id="pricing.anchor"
    class="pricing"
  >
    <h2>{{ pricing.heading }}</h2>
    <div class="pricing-grid">
      <div
        v-for="tier in pricing.tiers"
        :key="tier.plan"
        :class="['pricing-card', { popular: tier.featured }]"
      >
        <div
          v-if="tier.featured"
          class="pricing-badge"
        >
          {{ pricing.labels.badge }}
        </div>
        <div class="pricing-price">
          €{{ tier.price }}<span class="pricing-period">{{ pricing.labels.period }}</span>
        </div>
        <div class="pricing-items">
          <div class="pricing-item">
            — {{ tier.objects }} {{ pricing.labels.objects }}
          </div>
          <div class="pricing-item">
            — {{ tier.storage }} {{ pricing.labels.storage }}
          </div>
          <div class="pricing-item">
            — {{ tier.ai }} {{ pricing.labels.ai }}
          </div>
          <div
            v-for="extra in tier.extras"
            :key="extra"
            class="pricing-item"
          >
            — {{ extra }}
          </div>
        </div>
      </div>
    </div>
    <div class="pricing-footer">
      <span class="pricing-vat">{{ pricing.labels.vat }}</span>
      <a
        class="pricing-cta"
        rel="noopener"
        target="_blank"
        :href="`https://entu.app/new?locale=${lang}`"
        @click="trackSignup"
      >{{ pricing.labels.cta }}</a>
    </div>
  </section>
</template>

<style scoped>
.pricing {
  margin: 0 64px;
  border-top: 1px solid var(--e-rule);
  padding: 64px 0;
}

.pricing h2 {
  font: 700 38px var(--e-font-display);
  color: var(--e-text);
  margin: 0 0 40px;
  letter-spacing: -0.02em;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  align-items: stretch;
}

.pricing-card {
  background: var(--e-card-bg);
  color: var(--e-text);
  border: 1px solid var(--e-tier-border);
  border-radius: 8px;
  padding: 30px 26px;
  position: relative;
}

.pricing-card.popular {
  background: var(--e-tier-popular-bg);
  color: var(--e-tier-popular-fg);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 22px;
  background: var(--e-accent);
  color: #fff;
  font: 600 11px var(--e-font-mono);
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 4px;
}

.pricing-price {
  font: 700 40px var(--e-font-display);
  margin-bottom: 22px;
  letter-spacing: -0.02em;
}

.pricing-period {
  font: 400 14px var(--e-font-body);
  color: var(--e-tier-sub);
  letter-spacing: 0;
}

.pricing-card.popular .pricing-period {
  color: var(--e-tier-popular-sub);
}

.pricing-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pricing-item {
  font: 400 14px var(--e-font-body);
  color: var(--e-tier-sub);
}

.pricing-card.popular .pricing-item {
  color: var(--e-tier-popular-sub);
}

.pricing-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
}

.pricing-vat {
  font: 400 13px var(--e-font-body);
  color: var(--e-muted);
}

.pricing-cta {
  background: var(--e-button-bg);
  color: var(--e-button-fg);
  font: 600 15px var(--e-font-body);
  padding: 13px 32px;
  border-radius: 6px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.pricing-cta:hover {
  opacity: 0.85;
}

@media (max-width: 1100px) {
  .pricing-grid {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .pricing {
    margin: 0 24px;
    padding: 48px 0;
  }

  .pricing h2 {
    font-size: 30px;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
</style>
