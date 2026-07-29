---
layout: page
title: Structured data, without backend code
description: Entu is a no-code object database. Model entities, properties, and access rights in the UI — no migrations, no schema files, no backend code.
sidebar: false

hero:
  kicker: Build your own database — no code
  heading: Structured data, without backend code.
  lead: Books, invoices, artefacts, people — Entu stores them all as entities with the fields you choose. Build and change your data model right in the UI. No migrations, no schema files, no deployments.
  signup: Sign Up
  signupLink: https://entu.app/new?locale=en
  docs: See how it's used
  docsLink: '#use-cases'
  graph:
    type: project
    name: Spring exhibition 2027
    props:
      - name: lead
        value: reference → Person
      - name: budget used
        value: = formula · 64%
        accent: true
    children:
      - type: tasks
        name: Hang gallery A
        note: + 23 more
      - type: documents
        name: Loan agreement
        note: file × 8
      - type: expenses
        name: Transport invoice
        note: €2,140 total
    rights: 'editor: project team · viewer: management'

personas:
  heading: What can you build with Entu?
  intro: Almost anything you need to keep track of. The same flexible model scales from a personal collection to an entire organisation's records.
  hint: Hover an example — how it looks in Entu
  personalLabel: Private persons
  orgLabel: Organisations
  personal:
    - name: Home library
      text: Catalogue your books and records, note who borrowed what, and find any title in seconds.
      graph:
        root:
          name: Bookshelf at home
          type: collection
        child:
          name: Steve Jobs
          type: book
          props:
            - k: author
              t: reference
              v: W. Isaacson
            - k: borrowed by
              t: reference
              v: Hanna V.
            - k: back on shelf
              t: formula
              v: 12 Aug
              accent: true
        rights:
          - 'viewer: family'
    - name: Collections
      text: Stamps, vinyl, art, memorabilia — track provenance, condition, photos, and value per item.
      graph:
        root:
          name: Vinyl records
          type: collection
        child:
          name: Queen Studio Collection
          type: record
          props:
            - k: condition
              t: string
              v: near mint
            - k: photos
              t: file
              v: 3 files
            - k: est. value
              t: formula
              v: €450
              accent: true
        grands:
          - t: LP
            n: 2 · Queen II
          - t: LP
            n: 7 · News of the World
          - t: LP
            n: 12 · Innuendo
        rights:
          - 'viewer: just me'
    - name: Household inventory
      text: Keep receipts, warranties, and serial numbers of everything you own — ready for insurance claims.
      graph:
        root:
          name: Apartment, Tallinn
          type: home
        child:
          name: Washing machine
          type: item
          props:
            - k: receipt
              t: file
              v: receipt.pdf
            - k: serial no
              t: string
              v: WM-88412
            - k: warranty left
              t: formula
              v: 14 months
              accent: true
        rights:
          - 'shared: insurer'
    - name: Family archive
      text: Organise photos, letters, and documents by person, place, and date. Share chosen parts with relatives.
      graph:
        root:
          name: Tamm family archive
          type: archive
        child:
          name: Wedding, 1954
          type: photo
          props:
            - k: people
              t: reference
              v: 6 persons
            - k: place
              t: string
              v: Viljandi
            - k: scan
              t: file
              v: 600 dpi
        grands:
          - t: print
            n: 13×18 cm
          - t: negative
            n: 6×6
        rights:
          - 'shared: relatives'
  org:
    - name: Museum collections
      text: Catalogue artefacts with rich metadata and media; structure them to mirror your physical collections.
      graph:
        root:
          name: City Museum
          type: museum
        child:
          name: Personal computer JUKU
          type: artefact
          props:
            - k: acquired
              t: date
              v: 05.1989
            - k: photos
              t: file
              v: 12 files
            - k: insured value
              t: formula
              v: €12,000
              accent: true
        grands:
          - t: part
            n: Monitor
          - t: part
            n: Disk drive
        rights:
          - 'viewer: public'
          - 'editor: curators'
    - name: Business records
      text: Bookkeeping entries, supplier and customer records, stock inventory — one database instead of three tools.
      graph:
        root:
          name: Roots Robotics TÜ
          type: company
        child:
          name: Invoice № 2026-0142
          type: invoice
          props:
            - k: supplier
              t: reference
              v: Roots Robotics
            - k: lines
              t: child × 5
              v: 5 lines
            - k: total
              t: formula
              v: €1,840
              accent: true
        grands:
          - t: invoice line
            n: Motor controller × 2
          - t: invoice line
            n: Encoder cable × 4
          - t: invoice line
            n: Aluminium frame kit
        rights:
          - 'viewer: accounting'
          - 'owner: CFO'
    - name: School & library lending
      text: Track items, patrons, and loans; desk staff see what they need, rights cascade automatically.
      graph:
        root:
          name: School library
          type: library
        child:
          name: The Hobbit
          type: book
          props:
            - k: copies
              t: child × 3
              v: 3 copies
            - k: borrowed by
              t: reference
              v: Liis, 7B
            - k: on shelf
              t: formula
              v: 1 of 3
              accent: true
        grands:
          - t: copy
            n: № 1 · shelf 4B
          - t: copy
            n: № 2 · on loan
          - t: copy
            n: № 3 · shelf 4B
        rights:
          - 'editor: desk staff'
    - name: Custom web back-ends
      text: Power portals and apps via the REST API — Entu is the admin UI, so you never build one.
      graph:
        root:
          name: Ticket portal
          type: website
        child:
          name: Spring concert
          type: event
          props:
            - k: venue
              t: reference
              v: Alexela Hall
            - k: date
              t: date
              v: 14.05.2027
            - k: tickets left
              t: formula
              v: '212'
              accent: true
        grands:
          - t: ticket
            n: № A-0412
          - t: ticket
            n: № A-0413
        rights:
          - 'API: read-only key'

why:
  heading: Why Entu?
  paragraphs:
    - Most organisations end up with a patchwork of narrow, purpose-built tools — each rigid and expensive to change, with data siloed between them.
    - 'Entu takes a different approach: you describe your data model directly in the UI, and the system adapts to you — at any time, without code or migrations.'
    - Users work through a web browser or the native Apple apps; developers connect via the REST API.

features:
  - title: Entu AI
    icon:
      src: /icons/sparkles.svg
    details: Ask in plain language to explore your data or set up entities, properties, and formulas. Entu AI proposes the changes and applies them once you confirm.
  - title: No-code data modelling
    icon:
      src: /icons/database.svg
    details: Create entity types, properties, and relationships entirely through the UI. Change your data model at any time — no migrations, no deployments.
  - title: Starter templates
    icon:
      src: /icons/layout-template.svg
    details: Pre-configured data models for contacts, documents, library, and inventory — use as-is or adapt to your needs.
  - title: Flexible access control
    icon:
      src: /icons/shield-check.svg
    details: Four permission levels per entity — owner, editor, expander, viewer. Rights cascade automatically through parent–child relationships.
  - title: Multilingual
    icon:
      src: /icons/globe.svg
    details: Add translations to any field and store values per language. Users see content in their own locale; the UI adapts accordingly.
  - title: Plugins & Webhooks
    icon:
      src: /icons/plug.svg
    details: Embed custom UI tabs (iframes) or fire webhook triggers on any entity type — extend Entu without touching the core.

pricing:
  heading: Pricing
  anchor: pricing
  labels:
    period: /month
    objects: objects
    storage: storage
    ai: AI tokens
    cta: Get Started
    badge: Most popular
    vat: '* Prices do not include VAT'
  tiers:
    - plan: 1
      price: 2
      objects: '1,000'
      storage: 1 GB
      ai: '10,000'
      extras: []
    - plan: 2
      price: 10
      objects: '10,000'
      storage: 10 GB
      ai: '100,000'
      extras: []
    - plan: 3
      price: 40
      objects: '100,000'
      storage: 100 GB
      ai: '1,000,000'
      extras:
        - ID authentication
      featured: true
    - plan: 4
      price: 200
      objects: '500,000'
      storage: 500 GB
      ai: '5,000,000'
      extras:
        - ID authentication
        - Own domain
        - Priority support

faq:
  anchor: faq
  heading: Frequently asked questions
  items:
    - q: Do I need to know how to code?
      a: No. You build your whole data model — types, fields, relationships, and rights — through the UI. Developers can optionally connect via the REST API.
    - q: How is Entu different from a spreadsheet?
      a: Spreadsheets are flat and buckle under relationships, files, and access control. Entu stores typed entities in a hierarchy, links records together, holds files, and cascades permissions.
    - q: How is it different from Airtable or a custom database?
      a: Entu is schema-less and changes live — add or alter types and fields at any time, with no migrations. It ships with both a UI and a REST API, so you never build an admin backend.
    - q: Can I import my existing data?
      a: Yes — import from CSV and other sources via plugins, or bulk-create entities through the API.
    - q: Who can see my data?
      a: You control access per entity with four levels — owner, editor, expander, viewer — that cascade down the hierarchy. Each account has its own isolated database.
    - q: Can I use it on my phone?
      a: Yes — Entu runs in any browser and has native apps for iPhone, iPad, and Mac.
    - q: What does it cost?
      a: Plans start at €2 per month. See the pricing table below for all tiers.

partners:
  heading: Partners & Customers
  names:
    - Are Põhikool
    - August Kitzbergi nimeline Gümnaasium
    - Eesti Keele Instituut
    - Eesti Kunstiakadeemia
    - Eesti Rahvusvahelise Arengukoostöö Keskus
    - Eesti Sõjamuuseum – kindral Laidoneri muuseum
    - Okupatsioonide ja vabaduse muuseum Vabamu
    - Piletilevi AS
    - Pillimuuseum MTÜ
    - TÜ Roots Robotics
    - Tallinna Ehituskool
    - Tallinna Läänemere Gümnaasium
    - Toidu- ja Fermentatsioonitehnoloogia Arenduskeskus
    - Vasalemma Põhikool
    - Wõrgu Wõlurid OÜ
---

<home-landing />
