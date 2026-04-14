import DefaultTheme from 'vitepress/theme'
import Layout from './layout.vue'
import PartnersSection from './partners-section.vue'
import PricingSection from './pricing-section.vue'
import UseCasesSection from './use-cases-section.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp ({ app }) {
    app.component('PricingSection', PricingSection)
    app.component('PartnersSection', PartnersSection)
    app.component('UseCasesSection', UseCasesSection)
  }
}
