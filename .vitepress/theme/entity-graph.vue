<script setup>
defineProps({
  graph: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="entity-graph">
    <div class="graph-root">
      <span class="graph-name">{{ graph.root.name }}</span>
      <span class="graph-type">{{ graph.root.type }}</span>
    </div>
    <div class="graph-connector" />
    <div class="graph-child">
      <div class="graph-child-head">
        <span class="graph-name">{{ graph.child.name }}</span>
        <span class="graph-type">{{ graph.child.type }}</span>
      </div>
      <div class="graph-props">
        <div
          v-for="prop in graph.child.props"
          :key="prop.k"
          class="graph-prop"
        >
          <span class="graph-prop-key">{{ prop.k }}</span>
          <span class="graph-prop-type">{{ prop.t }}</span>
          <span :class="['graph-prop-value', { accent: prop.accent }]">{{ prop.v }}</span>
        </div>
      </div>
    </div>
    <template v-if="graph.grands">
      <div
        v-for="grand in graph.grands"
        :key="grand.n"
      >
        <div class="graph-connector-sm" />
        <div class="graph-grand">
          <span class="graph-name sm">{{ grand.n }}</span>
          <span class="graph-type">{{ grand.t }}</span>
        </div>
      </div>
    </template>
    <div class="graph-rights">
      <div
        v-for="right in graph.rights"
        :key="right"
        class="graph-right"
      >
        {{ right }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph-root,
.graph-child,
.graph-grand {
  background: var(--e-card-bg);
  border: 1px solid var(--e-border);
  border-radius: 10px;
  box-shadow: var(--e-card-shadow-sm);
}

.graph-root {
  padding: 14px 18px;
  width: 240px;
  max-width: 100%;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.graph-name {
  font: 700 15px var(--e-font-display);
  color: var(--e-text);
  flex: 1;
}

.graph-name.sm {
  font-size: 14px;
}

.graph-type {
  font: 600 11px var(--e-font-mono);
  color: var(--e-accent);
}

.graph-connector {
  width: 2px;
  height: 22px;
  background: var(--e-connector);
  margin-left: 48px;
}

.graph-connector-sm {
  width: 2px;
  height: 14px;
  background: var(--e-connector);
  margin-left: 76px;
}

.graph-child {
  padding: 16px 18px;
  margin-left: 28px;
}

.graph-child-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.graph-props {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font: 400 12px var(--e-font-mono);
}

.graph-prop {
  display: flex;
  align-items: baseline;
  gap: 10px;
  border-bottom: 1px solid var(--e-border-subtle);
  padding-bottom: 7px;
}

.graph-prop-key {
  color: var(--e-muted);
  flex: 1;
}

.graph-prop-type {
  color: var(--e-faint);
  font-size: 11px;
}

.graph-prop-value {
  color: var(--e-prop-value);
}

.graph-prop-value.accent {
  color: var(--e-accent);
}

.graph-grand {
  padding: 11px 18px;
  margin-left: 56px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.graph-rights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: 16px;
  margin-top: 22px;
}

.graph-right {
  background: var(--e-fill);
  border: 1px dashed var(--e-dashed);
  border-radius: 8px;
  padding: 9px 14px;
  font: 500 12px var(--e-font-body);
  color: var(--e-secondary);
}
</style>
