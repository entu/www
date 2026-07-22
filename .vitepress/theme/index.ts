import DefaultTheme from 'vitepress/theme'
import Layout from './layout.vue'
import HomeLanding from './home-landing.vue'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/archivo/400.css'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp ({ app }) {
    app.component('HomeLanding', HomeLanding)
  }
}
