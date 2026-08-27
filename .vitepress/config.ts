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

// EN section/page slugs and their ET counterparts, longest first so child paths match before parents.
const SLUG_MAP: [string, string][] = [
  ['getting-started/add-data', 'alustamine/andmete-lisamine'],
  ['getting-started/find', 'alustamine/otsimine'],
  ['getting-started/palette', 'alustamine/kasupalett'],
  ['getting-started/share', 'alustamine/jagamine'],
  ['getting-started/mobile', 'alustamine/mobiil'],
  ['getting-started', 'alustamine'],
  ['overview/entities', 'ulevaade/objektid'],
  ['overview/properties', 'ulevaade/parameetrid'],
  ['overview/sharing', 'ulevaade/jagamine'],
  ['overview/authentication', 'ulevaade/autentimine'],
  ['overview', 'ulevaade'],
  ['configuration/entity-types', 'seadistamine/objektituubid'],
  ['configuration/menus', 'seadistamine/menuud'],
  ['configuration/users', 'seadistamine/kasutajad'],
  ['configuration/plugins', 'seadistamine/pluginad'],
  ['configuration/best-practices', 'seadistamine/parimad-praktikad'],
  ['configuration/ai', 'seadistamine/ai'],
  ['configuration', 'seadistamine'],
  ['examples', 'kasutusnaited'],
  ['db-mutations', 'andmebaasi-mutatsioonid'],
  ['terms', 'kasutustingimused'],
  ['api/quickstart', 'api/kiire-algus'],
  ['api/authentication', 'api/autentimine'],
  ['api/best-practices', 'api/parimad-praktikad'],
  ['api/query-reference', 'api/paringu-viide'],
  ['api/properties', 'api/parameetrid'],
  ['api/formulas', 'api/valemid'],
  ['api/files', 'api/failid']
]

// Map an EN path to its ET counterpart and vice versa.
function localeCounterparts (path: string): { en: string, et: string } {
  if (path.startsWith('et/')) {
    const etPath = path.slice(3)
    const match = SLUG_MAP.find(([, et]) => etPath === `${et}/` || etPath.startsWith(`${et}/`))
    const en = match ? etPath.replace(match[1], match[0]) : etPath

    return { en, et: path }
  }

  const match = SLUG_MAP.find(([en]) => path === `${en}/` || path.startsWith(`${en}/`))
  const et = match ? path.replace(match[0], match[1]) : path

  return { en: path, et: `et/${et}` }
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
          { text: 'Alustamine', link: '/et/alustamine/' },
          { text: 'Ülevaade', link: '/et/ulevaade/' },
          { text: 'Seadistamine', link: '/et/seadistamine/objektituubid/' },
          { text: 'API', link: '/et/api/kiire-algus/' },
          { text: 'Hinnakiri', link: '/et/#hinnad' },
          { text: 'Logi sisse', link: 'https://entu.app' }
        ],
        sidebar: [
          {
            text: 'Alustamine',
            items: [
              { text: 'Loo oma konto', link: '/et/alustamine/' },
              { text: 'Lisa esimesed kirjed', link: '/et/alustamine/andmete-lisamine/' },
              { text: 'Leia oma andmed', link: '/et/alustamine/otsimine/' },
              { text: 'Käsupalett', link: '/et/alustamine/kasupalett/' },
              { text: 'Jaga ja kutsu', link: '/et/alustamine/jagamine/' },
              { text: 'Entu sinu telefonis', link: '/et/alustamine/mobiil/' }
            ]
          },
          {
            text: 'Ülevaade',
            items: [
              { text: 'Mis on Entu', link: '/et/ulevaade/' },
              { text: 'Objektid', link: '/et/ulevaade/objektid/' },
              { text: 'Parameetrid', link: '/et/ulevaade/parameetrid/' },
              { text: 'Autentimine', link: '/et/ulevaade/autentimine/' },
              { text: 'Objektide jagamine', link: '/et/ulevaade/jagamine/' }
            ]
          },
          {
            text: 'Seadistamine',
            items: [
              { text: 'Objektitüübid', link: '/et/seadistamine/objektituubid/' },
              { text: 'Kasutajad', link: '/et/seadistamine/kasutajad/' },
              { text: 'Menüüd', link: '/et/seadistamine/menuud/' },
              { text: 'Pluginad', link: '/et/seadistamine/pluginad/' },
              { text: 'Entu AI', link: '/et/seadistamine/ai/' },
              { text: 'Parimad praktikad', link: '/et/seadistamine/parimad-praktikad/' },
              { text: 'Kasutusnäited', link: '/et/kasutusnaited/' }
            ]
          },
          {
            text: 'API',
            items: [
              { text: 'Kiire algus', link: '/et/api/kiire-algus/' },
              { text: 'Autentimine', link: '/et/api/autentimine/' },
              { text: 'Parimad praktikad', link: '/et/api/parimad-praktikad/' },
              { text: 'Päringu viide', link: '/et/api/paringu-viide/' },
              { text: 'Parameetrid', link: '/et/api/parameetrid/' },
              { text: 'Valemid', link: '/et/api/valemid/' },
              { text: 'Failid', link: '/et/api/failid/' },
              { text: 'AI assistent', link: '/et/api/ai/' },
              { text: 'Andmebaasi mutatsioonid', link: '/et/andmebaasi-mutatsioonid/' },
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
          message: '<span class="footer-links"><a href="/et/kasutustingimused">Kasutustingimused</a> · <a href="https://climate.stripe.com/GdfbXF" target="_blank" rel="noopener">Stripe Climate</a></span><span class="footer-company"><strong>Entusiastid OÜ</strong> · Saturni 3-3, 10142 Tallinn · <a href="mailto:info@entu.ee">info@entu.ee</a></span>'
        }
      }
    }
  },
  themeConfig: {
    logo: '/logo.png',
    // EN and ET slugs differ, so prefix-swapping locale links would 404; the switcher goes to the locale's home instead.
    i18nRouting: false,
    nav: [
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Overview', link: '/overview/' },
      { text: 'Configuration', link: '/configuration/entity-types/' },
      { text: 'API', link: '/api/quickstart/' },
      { text: 'Pricing', link: '/#pricing' },
      { text: 'Sign In', link: 'https://entu.app' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Create Your Account', link: '/getting-started/' },
          { text: 'Add Your First Entries', link: '/getting-started/add-data/' },
          { text: 'Find Your Data', link: '/getting-started/find/' },
          { text: 'Command Palette', link: '/getting-started/palette/' },
          { text: 'Share and Invite', link: '/getting-started/share/' },
          { text: 'Entu on Your Phone', link: '/getting-started/mobile/' }
        ]
      },
      {
        text: 'Overview',
        items: [
          { text: 'What is Entu', link: '/overview/' },
          { text: 'Entities', link: '/overview/entities/' },
          { text: 'Properties', link: '/overview/properties/' },
          { text: 'Authentication', link: '/overview/authentication/' },
          { text: 'Entity sharing', link: '/overview/sharing/' }
        ]
      },
      {
        text: 'Configuration',
        items: [
          { text: 'Entity Types', link: '/configuration/entity-types/' },
          { text: 'Users', link: '/configuration/users/' },
          { text: 'Menus', link: '/configuration/menus/' },
          { text: 'Plugins', link: '/configuration/plugins/' },
          { text: 'Entu AI', link: '/configuration/ai/' },
          { text: 'Best Practices', link: '/configuration/best-practices/' },
          { text: 'Examples', link: '/examples/' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'Quick Start', link: '/api/quickstart/' },
          { text: 'Authentication', link: '/api/authentication/' },
          { text: 'Best Practices', link: '/api/best-practices/' },
          { text: 'Query Reference', link: '/api/query-reference/' },
          { text: 'Properties', link: '/api/properties/' },
          { text: 'Formulas', link: '/api/formulas/' },
          { text: 'Files', link: '/api/files/' },
          { text: 'AI Assistant', link: '/api/ai/' },
          { text: 'Database Mutations', link: '/db-mutations/' },
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
