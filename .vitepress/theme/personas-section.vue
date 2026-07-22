<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import EntityGraph from './entity-graph.vue'

const { frontmatter } = useData()

const personas = computed(() => frontmatter.value.personas)

const activeExample = ref('p0')

const expandedExample = ref('p0')

const activeGraph = computed(() => {
  const [group, index] = [activeExample.value[0], Number(activeExample.value.slice(1))]
  const list = group === 'p' ? personas.value.personal : personas.value.org

  return list[index]?.graph || personas.value.personal[0].graph
})

function setActive (key) {
  activeExample.value = key
}

function toggleExpanded (key) {
  expandedExample.value = expandedExample.value === key ? null : key
}
</script>

<template>
  <section class="personas">
    <h2>{{ personas.heading }}</h2>
    <p class="personas-intro">
      {{ personas.intro }}
    </p>
    <div class="personas-grid">
      <div class="personas-card personal">
        <div class="personas-kicker">
          {{ personas.personalLabel }}
        </div>
        <div class="personas-items">
          <div
            v-for="(item, index) in personas.personal"
            :key="item.name"
            :class="['personas-item', { active: activeExample === `p${index}`, expanded: expandedExample === `p${index}` }]"
            @click="toggleExpanded(`p${index}`)"
            @mouseenter="setActive(`p${index}`)"
          >
            <h3>{{ item.name }} <span class="personas-arrow">→</span></h3>
            <p>{{ item.text }}</p>
            <Transition name="graph-fade">
              <div
                v-if="expandedExample === `p${index}`"
                class="personas-item-graph"
              >
                <entity-graph :graph="item.graph" />
              </div>
            </Transition>
          </div>
        </div>
      </div>
      <div class="personas-preview">
        <div class="personas-hint">
          {{ personas.hint }}
        </div>
        <Transition
          mode="out-in"
          name="graph-fade"
        >
          <entity-graph
            :key="activeExample"
            :graph="activeGraph"
          />
        </Transition>
      </div>
      <div class="personas-card org">
        <div class="personas-kicker org">
          {{ personas.orgLabel }}
        </div>
        <div class="personas-items">
          <div
            v-for="(item, index) in personas.org"
            :key="item.name"
            :class="['personas-item', 'org', { active: activeExample === `o${index}`, expanded: expandedExample === `o${index}` }]"
            @click="toggleExpanded(`o${index}`)"
            @mouseenter="setActive(`o${index}`)"
          >
            <h3>{{ item.name }} <span class="personas-arrow org">→</span></h3>
            <p>{{ item.text }}</p>
            <Transition name="graph-fade">
              <div
                v-if="expandedExample === `o${index}`"
                class="personas-item-graph"
              >
                <entity-graph :graph="item.graph" />
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.personas {
  border-top: 1px solid var(--e-border-subtle);
  padding: 72px 64px;
}

.personas h2 {
  font: 700 38px var(--e-font-display);
  color: var(--e-text);
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.personas-intro {
  font: 400 17px/1.65 var(--e-font-body);
  color: var(--e-secondary);
  max-width: 680px;
  margin: 0 0 44px;
  text-wrap: pretty;
}

.personas-grid {
  display: grid;
  grid-template-columns: 1fr 400px 1fr;
  gap: 24px;
  align-items: stretch;
}

.personas-card {
  background: var(--e-card-bg);
  border: 1px solid var(--e-border);
  border-radius: 10px;
  padding: 32px 36px;
}

.personas-card.org {
  background: var(--e-panel-bg);
  color: var(--e-panel-text);
  border: none;
}

.personas-kicker {
  font: 500 12px var(--e-font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--e-accent);
  margin-bottom: 16px;
}

.personas-kicker.org {
  color: var(--e-accent-soft);
}

.personas-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.personas-item {
  padding: 14px 12px;
  margin: 0 -12px;
  border-radius: 6px;
  cursor: default;
  transition: background-color 0.15s;
}

.personas-item:hover {
  background: var(--e-hover);
}

.personas-item.active {
  background: var(--e-active-item);
}

.personas-item.org:hover {
  background: var(--e-panel-hover);
}

.personas-item.org.active {
  background: var(--e-panel-active);
}

.personas-item h3 {
  font: 700 17px var(--e-font-display);
  margin: 0 0 6px;
}

.personas-item p {
  font: 400 14px/1.6 var(--e-font-body);
  color: var(--e-secondary);
  margin: 0;
  text-wrap: pretty;
}

.personas-item.org p {
  color: var(--e-panel-muted);
}

.personas-arrow {
  font: 400 13px var(--e-font-mono);
  color: var(--e-faint);
}

.personas-arrow.org {
  color: var(--e-org-arrow);
}

.personas-preview {
  background: var(--e-preview-bg);
  border: 1px dashed var(--e-dashed);
  border-radius: 10px;
  padding: 28px;
  box-sizing: border-box;
}

.personas-hint {
  font: 500 11px var(--e-font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--e-muted);
  margin-bottom: 18px;
  text-align: center;
}

.personas-item-graph {
  display: none;
  margin-top: 16px;
}

.graph-fade-enter-active,
.graph-fade-leave-active {
  transition: opacity 0.15s ease;
}

.graph-fade-enter-from,
.graph-fade-leave-to {
  opacity: 0;
}

/* Tablet: two cards side by side, examples collapse under each item */
@media (max-width: 1100px) {
  .personas-grid {
    grid-template-columns: 1fr 1fr;
  }

  .personas-preview {
    display: none;
  }

  .personas-item {
    cursor: pointer;
  }

  .personas-item-graph {
    display: block;
  }

  .personas-arrow {
    display: inline-block;
    transition: transform 0.15s;
  }

  .personas-item.expanded .personas-arrow {
    transform: rotate(90deg);
  }
}

@media (max-width: 768px) {
  .personas {
    padding: 56px 24px;
  }

  .personas h2 {
    font-size: 30px;
  }
}

/* Mobile: single column */
@media (max-width: 640px) {
  .personas-grid {
    grid-template-columns: 1fr;
  }

  .personas-card {
    padding: 24px 20px;
  }
}
</style>
