import { defineConfig } from 'vitepress'

export default defineConfig({
  srcDir: './src',
  outDir: './dist',
  vite: { 
    server: { port: 3003 }, 
    publicDir: '../public' 
  },
  sitemap: { hostname: 'https://entu.ee' },
  cleanUrls: true,
  title: 'Entu',
  titleTemplate: ':title · Entu',
  description: 'Build your data model without code — configure entities, properties, and access rights entirely through the UI',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['script', { src: 'https://analytics.entu.dev/ea.min.js', 'data-site': 'entu.ee', crossorigin: 'anonymous', defer: '' }]
  ],
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    et: {
      label: 'Eesti',
      lang: 'et',
      description: 'Ehita oma andmemudel programmeerimata — seadista objektid, parameetrid ja juurdepääsuõigused täielikult kasutajaliidese kaudu',
      themeConfig: {
        nav: [
          { text: 'Ülevaade', link: '/et/overview/' },
          { text: 'Seadistamine', link: '/et/configuration/entity-types' },
          { text: 'API', link: '/et/api/quickstart' },
          { text: 'Hinnakiri', link: '/et/#hinnad' },
          { text: 'Logi sisse', link: 'https://entu.app' }
        ],
        sidebar: [
          {
            text: 'Ülevaade',
            items: [
              { text: 'Mis on Entu', link: '/et/overview/' },
              { text: 'Objektid', link: '/et/overview/entities' },
              { text: 'Parameetrid', link: '/et/overview/properties' },
              { text: 'Autentimine', link: '/et/overview/authentication' }
            ]
          },
          {
            text: 'Seadistamine',
            items: [
              { text: 'Objektitüübid', link: '/et/configuration/entity-types' },
              { text: 'Kasutajad', link: '/et/configuration/users' },
              { text: 'Menüüd', link: '/et/configuration/menus' },
              { text: 'Pluginad', link: '/et/configuration/plugins' },
              { text: 'Parimad praktikad', link: '/et/configuration/best-practices' },
              { text: 'Kasutusnäited', link: '/et/examples' }
            ]
          },
          {
            text: 'API',
            items: [
              { text: 'Kiire algus', link: '/et/api/quickstart' },
              { text: 'Autentimine', link: '/et/api/authentication' },
              { text: 'Parimad praktikad', link: '/et/api/best-practices' },
              { text: 'Päringu viide', link: '/et/api/query-reference' },
              { text: 'Parameetrid', link: '/et/api/properties' },
              { text: 'Valemid', link: '/et/api/formulas' },
              { text: 'Failid', link: '/et/api/files' },
              { text: 'API viide', link: 'https://entu.app/api/docs' }
            ]
          },
          {
            text: 'Muudatuste logi',
            items: [
              { text: 'Muudatuste logi', link: '/et/changelog' }
            ]
          }
        ],
        docFooter: {
          prev: 'Eelmine leht',
          next: 'Järgmine leht'
        },
        outline: {
          label: 'Sellel lehel'
        },
        returnToTopLabel: 'Tagasi üles',
        sidebarMenuLabel: 'Menüü',
        darkModeSwitchLabel: 'Välimus',
        lightModeSwitchTitle: 'Lülitu heledasse teemasse',
        darkModeSwitchTitle: 'Lülitu tumedasse teemasse',
        footer: {
          message: '<a href="/et/terms">Kasutustingimused</a> &nbsp;·&nbsp; <a href="https://climate.stripe.com/GdfbXF" target="_blank" rel="noopener">Stripe Climate</a><br><strong>Entusiastid OÜ</strong> &nbsp;·&nbsp; Saturni 3-3, 10142 Tallinn &nbsp;·&nbsp; <a href="mailto:info@entu.ee">info@entu.ee</a>'
        }
      }
    }
  },
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Overview', link: '/overview/' },
      { text: 'Configuration', link: '/configuration/entity-types' },
      { text: 'API', link: '/api/quickstart' },
      { text: 'Pricing', link: '/#pricing' },
      { text: 'Sign In', link: 'https://entu.app' }
    ],
    sidebar: [
      {
        text: 'Overview',
        items: [
          { text: 'What is Entu', link: '/overview/' },
          { text: 'Entities', link: '/overview/entities' },
          { text: 'Properties', link: '/overview/properties' },
          { text: 'Authentication', link: '/overview/authentication' }
        ]
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Entity Types', link: '/configuration/entity-types' },
          { text: 'Users', link: '/configuration/users' },
          { text: 'Menus', link: '/configuration/menus' },
          { text: 'Plugins', link: '/configuration/plugins' },
          { text: 'Best Practices', link: '/configuration/best-practices' },
          { text: 'Examples', link: '/examples' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'Quick Start', link: '/api/quickstart' },
          { text: 'Authentication', link: '/api/authentication' },
          { text: 'Best Practices', link: '/api/best-practices' },
          { text: 'Query Reference', link: '/api/query-reference' },
          { text: 'Properties', link: '/api/properties' },
          { text: 'Formulas', link: '/api/formulas' },
          { text: 'Files', link: '/api/files' },
          { text: 'API Reference', link: 'https://entu.app/api/docs' }
        ]
      },
      {
        text: 'Changelog',
        items: [
          { text: 'Changelog', link: '/changelog' }
        ]
      }
    ],
    search: { provider: 'local' },
    footer: {
      message: '<a href="/terms">Terms of Service</a> &nbsp;·&nbsp; <a href="https://climate.stripe.com/GdfbXF" target="_blank" rel="noopener">Stripe Climate</a><br><strong>Entusiastid OÜ</strong> &nbsp;·&nbsp; Saturni 3-3, 10142 Tallinn &nbsp;·&nbsp; <a href="mailto:info@entu.ee">info@entu.ee</a>'
    }
  }
})
