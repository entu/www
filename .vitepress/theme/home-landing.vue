<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import PersonasSection from './personas-section.vue'
import PricingSection from './pricing-section.vue'
import PartnersSection from './partners-section.vue'

const { frontmatter, lang } = useData()

const fm = computed(() => frontmatter.value)

const appStoreBadge = computed(() => lang.value === 'et'
  ? '/badges/app-store-et.svg'
  : '/badges/app-store-en.svg')

const appStoreAlt = computed(() => lang.value === 'et'
  ? 'Laadi alla App Store\'ist'
  : 'Download on the App Store')

function trackSignup () {
  window.analytics?.track('hero_signup_click')
}
</script>

<template>
  <div class="landing">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-copy">
        <div class="hero-kicker">
          {{ fm.hero.kicker }}
        </div>
        <h1>{{ fm.hero.heading }}</h1>
        <p class="hero-lead">
          {{ fm.hero.lead }}
        </p>
        <div class="hero-actions">
          <a
            class="hero-signup"
            rel="noopener"
            target="_blank"
            :href="fm.hero.signupLink"
            @click="trackSignup"
          >{{ fm.hero.signup }}</a>
          <a
            class="hero-docs"
            :href="fm.hero.docsLink"
          >{{ fm.hero.docs }}</a>
          <a
            class="hero-badge"
            href="https://apps.apple.com/app/apple-store/id1520575542?pt=120355100&ct=www&mt=8"
            rel="noopener"
            target="_blank"
          >
            <img
              :alt="appStoreAlt"
              :src="appStoreBadge"
            >
          </a>
        </div>
      </div>
      <!-- Branching entity graph -->
      <div class="hero-graph">
        <div class="hero-root">
          <div class="hero-root-head">
            <div class="hero-root-type">
              {{ fm.hero.graph.type }}
            </div>
            <div class="hero-root-name">
              {{ fm.hero.graph.name }}
            </div>
          </div>
          <div class="hero-root-props">
            <div
              v-for="(prop, index) in fm.hero.graph.props"
              :key="prop.name"
              :class="['hero-prop', { last: index === fm.hero.graph.props.length - 1 }]"
            >
              <span class="hero-prop-key">{{ prop.name }}</span>
              <span :class="['hero-prop-value', { accent: prop.accent }]">{{ prop.value }}</span>
            </div>
          </div>
        </div>
        <div class="hero-line-v-wrap">
          <div class="hero-line-v" />
        </div>
        <div class="hero-line-h-wrap">
          <div class="hero-line-h" />
        </div>
        <div class="hero-branches">
          <div
            v-for="child in fm.hero.graph.children"
            :key="child.name"
            class="hero-branch-line"
          >
            <div class="hero-line-v short" />
          </div>
        </div>
        <div class="hero-branches">
          <div
            v-for="child in fm.hero.graph.children"
            :key="child.name"
            class="hero-child"
          >
            <div class="hero-child-type">
              {{ child.type }}
            </div>
            <div class="hero-child-name">
              {{ child.name }}
            </div>
            <div class="hero-child-note">
              {{ child.note }}
            </div>
          </div>
        </div>
        <div class="hero-rights-wrap">
          <div class="hero-rights">
            {{ fm.hero.graph.rights }}
          </div>
        </div>
      </div>
    </section>

    <!-- Concept strip -->
    <section class="concepts">
      <div
        v-for="concept in fm.concepts"
        :key="concept.num"
        class="concept"
      >
        <div class="concept-num">
          {{ concept.num }}
        </div>
        <h2>{{ concept.title }}</h2>
        <p>{{ concept.text }}</p>
      </div>
    </section>

    <!-- Personas -->
    <personas-section />

    <!-- UI vs API -->
    <section class="uiapi">
      <h2>{{ fm.uiapi.heading }}</h2>
      <p class="uiapi-intro">
        {{ fm.uiapi.intro }}
      </p>
      <div class="uiapi-grid">
        <div class="uiapi-card">
          <div class="uiapi-kicker">
            {{ fm.uiapi.uiLabel }}
          </div>
          <div class="uiapi-entity">
            <div class="uiapi-entity-title">
              {{ fm.uiapi.card.title }}
            </div>
            <div class="uiapi-entity-rows">
              <div
                v-for="(row, index) in fm.uiapi.card.rows"
                :key="row.k"
                :class="['uiapi-row', { last: index === fm.uiapi.card.rows.length - 1 }]"
              >
                <span class="uiapi-row-key">{{ row.k }}</span>
                <span :class="['uiapi-row-value', { accent: row.accent }]">{{ row.v }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="uiapi-panel">
          <div class="uiapi-kicker api">
            {{ fm.uiapi.apiLabel }}
          </div>
          <div class="uiapi-code">
            <div><span class="method">GET</span> <span class="path">/api/entity?_type=screen</span></div>
            <div class="status">
              → 200 OK
            </div>
            <div>{ "entities": [ {</div>
            <div class="indent">
              "name": <span class="string">"Lobby display"</span>,
            </div>
            <div class="indent">
              "playlist": <span class="string">"spring-campaign"</span>
            </div>
            <div>} ] }</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Entu + features -->
    <section class="why">
      <div class="why-copy">
        <h2>{{ fm.why.heading }}</h2>
        <div class="why-paragraphs">
          <p
            v-for="paragraph in fm.why.paragraphs"
            :key="paragraph"
          >
            {{ paragraph }}
          </p>
        </div>
      </div>
      <div class="features">
        <div
          v-for="feature in fm.features"
          :key="feature.title"
          class="feature"
        >
          <div class="feature-icon">
            <img
              alt=""
              :src="feature.icon.src"
            >
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.details }}</p>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <pricing-section />

    <!-- Partners -->
    <partners-section />
  </div>
</template>

<style scoped>
.landing {
  background: var(--e-bg);
  color: var(--e-text);
}

.landing h1,
.landing h2,
.landing h3 {
  color: var(--e-text);
}

/* ============ Hero ============ */

.hero {
  padding: 88px 64px 72px;
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 72px;
  align-items: center;
}

.hero-kicker {
  font: 500 13px var(--e-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--e-accent);
  margin-bottom: 22px;
}

.hero h1 {
  font: 700 72px/1.02 var(--e-font-display);
  margin: 0 0 26px;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.hero-lead {
  font: 400 19px/1.65 var(--e-font-body);
  color: var(--e-secondary);
  max-width: 600px;
  margin: 0 0 38px;
  text-wrap: pretty;
}

.hero-actions {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.hero-signup {
  background: var(--e-accent);
  color: #fff;
  font: 600 16px var(--e-font-body);
  padding: 15px 36px;
  border-radius: 6px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.hero-signup:hover {
  opacity: 0.9;
}

.hero-docs {
  font: 600 16px var(--e-font-body);
  color: var(--e-text);
  padding: 15px 36px;
  border: 1px solid var(--e-faint);
  border-radius: 6px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.hero-docs:hover {
  opacity: 0.75;
}

.hero-badge img {
  height: 52px;
  display: block;
  clip-path: inset(2px round 6px);
  margin: -1px 0;
  filter: var(--e-badge-filter);
}

/* Hero entity graph */

.hero-graph {
  position: relative;
  padding: 8px;
}

.hero-root {
  background: var(--e-card-bg);
  border: 1px solid var(--e-border);
  border-radius: 10px;
  padding: 18px 22px;
  box-shadow: var(--e-card-shadow);
  width: 300px;
  margin: 0 auto;
}

.hero-root-head {
  margin-bottom: 14px;
}

.hero-root-type {
  font: 600 12px var(--e-font-mono);
  color: var(--e-accent);
  margin-bottom: 4px;
}

.hero-root-name {
  font: 700 17px var(--e-font-display);
}

.hero-root-props {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font: 400 13px var(--e-font-mono);
}

.hero-prop {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--e-border-subtle);
  padding-bottom: 8px;
}

.hero-prop.last {
  border-bottom: none;
  padding-bottom: 0;
}

.hero-prop-key {
  color: var(--e-muted);
}

.hero-prop-value.accent {
  color: var(--e-accent);
}

.hero-line-v-wrap,
.hero-line-h-wrap {
  display: flex;
  justify-content: center;
}

.hero-line-v {
  width: 2px;
  height: 20px;
  background: var(--e-connector);
}

.hero-line-v.short {
  height: 20px;
}

.hero-line-h {
  width: 310px;
  height: 2px;
  background: var(--e-connector);
}

.hero-branches {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.hero-branch-line {
  display: flex;
  justify-content: center;
}

.hero-child {
  background: var(--e-card-bg);
  border: 1px solid var(--e-border);
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: var(--e-card-shadow);
}

.hero-child-type {
  font: 600 11px var(--e-font-mono);
  color: var(--e-accent);
  margin-bottom: 6px;
}

.hero-child-name {
  font: 700 14px var(--e-font-display);
}

.hero-child-note {
  font: 400 12px var(--e-font-mono);
  color: var(--e-muted);
  margin-top: 6px;
}

.hero-rights-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.hero-rights {
  background: var(--e-fill);
  border: 1px dashed var(--e-dashed);
  border-radius: 8px;
  padding: 11px 16px;
  font: 500 13px var(--e-font-body);
  color: var(--e-secondary);
}

/* ============ Concept strip ============ */

.concepts {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-top: 1px solid var(--e-rule);
}

.concept {
  padding: 36px 40px;
  border-right: 1px solid var(--e-border-subtle);
}

.concept:last-child {
  border-right: none;
}

.concept-num {
  font: 500 12px var(--e-font-mono);
  color: var(--e-accent);
  margin-bottom: 12px;
}

.concept h2 {
  font: 700 22px var(--e-font-display);
  margin: 0 0 8px;
}

.concept p {
  font: 400 14px/1.65 var(--e-font-body);
  color: var(--e-secondary);
  margin: 0;
  text-wrap: pretty;
}

/* ============ UI vs API ============ */

.uiapi {
  margin: 0 64px;
  border-top: 1px solid var(--e-rule);
  padding: 64px 0 72px;
}

.uiapi h2 {
  font: 700 38px var(--e-font-display);
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.uiapi-intro {
  font: 400 17px/1.65 var(--e-font-body);
  color: var(--e-secondary);
  max-width: 680px;
  margin: 0 0 40px;
  text-wrap: pretty;
}

.uiapi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.uiapi-card {
  background: var(--e-card-bg);
  border: 1px solid var(--e-border);
  border-radius: 10px;
  padding: 28px 30px;
}

.uiapi-kicker {
  font: 600 12px var(--e-font-mono);
  text-transform: uppercase;
  color: var(--e-accent);
  margin-bottom: 18px;
}

.uiapi-kicker.api {
  color: var(--e-accent-soft);
}

.uiapi-entity {
  background: var(--e-preview-bg);
  border: 1px solid var(--e-border-subtle);
  border-radius: 8px;
  padding: 18px 20px;
}

.uiapi-entity-title {
  font: 700 16px var(--e-font-display);
  margin-bottom: 12px;
}

.uiapi-entity-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font: 400 13px var(--e-font-mono);
  color: var(--e-secondary);
}

.uiapi-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--e-border-subtle);
  padding-bottom: 8px;
}

.uiapi-row.last {
  border-bottom: none;
  padding-bottom: 0;
}

.uiapi-row-key {
  color: var(--e-muted);
}

.uiapi-row-value.accent {
  color: var(--e-accent);
}

.uiapi-panel {
  background: var(--e-panel-bg);
  border-radius: 10px;
  padding: 28px 30px;
}

.uiapi-code {
  font: 400 13px/1.8 var(--e-font-mono);
  color: #bbb;
}

.uiapi-code .method {
  color: #7dd3a8;
}

.uiapi-code .path {
  color: #ddd;
}

.uiapi-code .status {
  color: #777;
}

.uiapi-code .string {
  color: #e8b96f;
}

.uiapi-code .indent {
  padding-left: 18px;
}

/* ============ Why + features ============ */

.why {
  margin: 0 64px;
  border-top: 1px solid var(--e-rule);
  padding: 64px 0;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 64px;
  align-items: start;
}

.why h2 {
  font: 700 38px var(--e-font-display);
  margin: 0 0 24px;
  letter-spacing: -0.02em;
}

.why-paragraphs {
  font: 400 15px/1.75 var(--e-font-body);
  color: var(--e-body);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.why-paragraphs p {
  margin: 0;
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px 40px;
  border-left: 1px solid var(--e-border-subtle);
  padding-left: 56px;
}

.feature {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 6px 12px;
  align-items: center;
}

.feature-icon {
  width: 22px;
  height: 22px;
}

.feature-icon img {
  width: 100%;
  height: 100%;
  display: block;
  filter: var(--e-icon-filter);
}

.feature h3 {
  font: 700 17px var(--e-font-display);
  margin: 0;
}

.feature p {
  font: 400 13.5px/1.6 var(--e-font-body);
  color: var(--e-secondary);
  margin: 0;
  text-wrap: pretty;
  grid-column: 2;
}

/* ============ Responsive ============ */

@media (max-width: 1100px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 56px;
  }

  .hero-graph {
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }

  .why {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .features {
    border-left: none;
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 48px 24px;
  }

  .hero h1 {
    font-size: 44px;
  }

  .hero-lead {
    font-size: 17px;
  }

  .concepts {
    grid-template-columns: 1fr;
  }

  .concept {
    border-right: none;
    border-bottom: 1px solid var(--e-border-subtle);
    padding: 28px 24px;
  }

  .concept:last-child {
    border-bottom: none;
  }

  .uiapi,
  .why {
    margin: 0 24px;
    padding: 48px 0;
  }

  .uiapi h2,
  .why h2 {
    font-size: 30px;
  }

  .uiapi-grid {
    grid-template-columns: 1fr;
  }

  .features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-copy {
    text-align: center;
  }

  .hero-lead {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }
}
</style>
