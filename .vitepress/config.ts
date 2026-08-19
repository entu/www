import { defineConfig, type HeadConfig } from 'vitepress'

const HOSTNAME = 'https://entu.ee'
const OG_IMAGE = `${HOSTNAME}/og-image.png`
const OG_IMAGE_ET = `${HOSTNAME}/og-image-et.png`

// Turn a source relativePath into its clean site path ('' for the homepage).
function cleanPath (relativePath: string): string {
  return relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
}

// Map an EN path to its ET counterpart and vice versa.
function localeCounterparts (path: string): { en: string, et: string } {
  const en = path.startsWith('et/') ? path.slice(3) : path
  const et = path.startsWith('et/') ? path : `et/${path}`

  return { en, et }
}

function abs (path: string): string {
  return `${HOSTNAME}/${path}`
}

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
    ['meta', { property: 'og:site_name', content: 'Entu' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['script', { src: 'https://analytics.entu.dev/ea.min.js', 'data-site': 'entu.ee', crossorigin: 'anonymous', defer: '' }]
  ],
  transformHead ({ pageData, title, description }) {
    const path = cleanPath(pageData.relativePath)
    const isEt = path.startsWith('et/')
    const url = abs(path)
    const image = isEt ? OG_IMAGE_ET : OG_IMAGE
    const isHome = path === '' || path === 'et/'
    const { en, et } = localeCounterparts(path)

    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: url }],
      ['link', { rel: 'alternate', hreflang: 'en', href: abs(en) }],
      ['link', { rel: 'alternate', hreflang: 'et', href: abs(et) }],
      ['link', { rel: 'alternate', hreflang: 'x-default', href: abs(en) }],
      ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:locale', content: isEt ? 'et_EE' : 'en' }],
      ['meta', { property: 'og:locale:alternate', content: isEt ? 'en' : 'et_EE' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: image }]
    ]

    if (isHome) {
      const graph: object[] = [
        {
          '@type': 'Organization',
          '@id': `${HOSTNAME}/#organization`,
          name: 'Entusiastid OÜ',
          url: HOSTNAME,
          logo: `${HOSTNAME}/logo.png`,
          email: 'info@entu.ee',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Saturni 3-3',
            postalCode: '10142',
            addressLocality: 'Tallinn',
            addressCountry: 'EE'
          }
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${HOSTNAME}/#software`,
          name: 'Entu',
          url: HOSTNAME,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web, iOS, iPadOS, macOS',
          publisher: { '@id': `${HOSTNAME}/#organization` },
          offers: [
            { '@type': 'Offer', price: '2', priceCurrency: 'EUR' },
            { '@type': 'Offer', price: '10', priceCurrency: 'EUR' },
            { '@type': 'Offer', price: '40', priceCurrency: 'EUR' },
            { '@type': 'Offer', price: '200', priceCurrency: 'EUR' }
          ]
        }
      ]

      const faqItems = (pageData.frontmatter.faq?.items || []) as { q: string, a: string }[]

      if (faqItems.length) {
        graph.push({
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a }
          }))
        })
      }

      head.push(['script', { type: 'application/ld+json' }, JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': graph
      })])
    }

    return head
  },
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
          { text: 'Alustamine', link: '/et/getting-started/' },
          { text: 'Ülevaade', link: '/et/overview/' },
          { text: 'Seadistamine', link: '/et/configuration/entity-types' },
          { text: 'API', link: '/et/api/quickstart' },
          { text: 'Hinnakiri', link: '/et/#hinnad' },
          { text: 'Logi sisse', link: 'https://entu.app' }
        ],
        sidebar: [
          {
            text: 'Alustamine',
            items: [
              { text: 'Loo oma konto', link: '/et/getting-started/' },
              { text: 'Lisa esimesed kirjed', link: '/et/getting-started/add-data' },
              { text: 'Leia oma andmed', link: '/et/getting-started/find' },
              { text: 'Jaga ja kutsu', link: '/et/getting-started/share' },
              { text: 'Entu sinu telefonis', link: '/et/getting-started/mobile' }
            ]
          },
          {
            text: 'Ülevaade',
            items: [
              { text: 'Mis on Entu', link: '/et/overview/' },
              { text: 'Objektid', link: '/et/overview/entities' },
              { text: 'Parameetrid', link: '/et/overview/properties' },
              { text: 'Autentimine', link: '/et/overview/authentication' },
              { text: 'Objektide jagamine', link: '/et/overview/sharing' }
            ]
          },
          {
            text: 'Seadistamine',
            items: [
              { text: 'Objektitüübid', link: '/et/configuration/entity-types' },
              { text: 'Kasutajad', link: '/et/configuration/users' },
              { text: 'Menüüd', link: '/et/configuration/menus' },
              { text: 'Pluginad', link: '/et/configuration/plugins' },
              { text: 'Entu AI', link: '/et/configuration/ai' },
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
              { text: 'AI assistent', link: '/et/api/ai' },
              { text: 'Andmebaasi mutatsioonid', link: '/et/db-mutations' },
              { text: 'API viide', link: 'https://api.entu.app/docs' }
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
          message: '<span class="footer-links"><a href="/et/terms">Kasutustingimused</a> · <a href="https://climate.stripe.com/GdfbXF" target="_blank" rel="noopener">Stripe Climate</a></span><span class="footer-company"><strong>Entusiastid OÜ</strong> · Saturni 3-3, 10142 Tallinn · <a href="mailto:info@entu.ee">info@entu.ee</a></span>'
        }
      }
    }
  },
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Overview', link: '/overview/' },
      { text: 'Configuration', link: '/configuration/entity-types' },
      { text: 'API', link: '/api/quickstart' },
      { text: 'Pricing', link: '/#pricing' },
      { text: 'Sign In', link: 'https://entu.app' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Create Your Account', link: '/getting-started/' },
          { text: 'Add Your First Entries', link: '/getting-started/add-data' },
          { text: 'Find Your Data', link: '/getting-started/find' },
          { text: 'Share and Invite', link: '/getting-started/share' },
          { text: 'Entu on Your Phone', link: '/getting-started/mobile' }
        ]
      },
      {
        text: 'Overview',
        items: [
          { text: 'What is Entu', link: '/overview/' },
          { text: 'Entities', link: '/overview/entities' },
          { text: 'Properties', link: '/overview/properties' },
          { text: 'Authentication', link: '/overview/authentication' },
          { text: 'Entity sharing', link: '/overview/sharing' }
        ]
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Entity Types', link: '/configuration/entity-types' },
          { text: 'Users', link: '/configuration/users' },
          { text: 'Menus', link: '/configuration/menus' },
          { text: 'Plugins', link: '/configuration/plugins' },
          { text: 'Entu AI', link: '/configuration/ai' },
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
          { text: 'AI Assistant', link: '/api/ai' },
          { text: 'Database Mutations', link: '/db-mutations' },
          { text: 'API Reference', link: 'https://api.entu.app/docs' }
        ]
      }
    ],
    search: { provider: 'local' },
    footer: {
      message: '<span class="footer-links"><a href="/terms">Terms of Service</a> · <a href="https://climate.stripe.com/GdfbXF" target="_blank" rel="noopener">Stripe Climate</a></span><span class="footer-company"><strong>Entusiastid OÜ</strong> · Saturni 3-3, 10142 Tallinn · <a href="mailto:info@entu.ee">info@entu.ee</a></span>'
    }
  }
})
