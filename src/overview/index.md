---
description: "What Entu is: a no-code object database for storing, organising, and querying structured data without migrations or backend code."
---

# What is Entu

Entu is a place to keep organised records of the things that matter to you — books, artefacts, invoices, people, equipment, photos. Like a card file, each thing gets its own card with exactly the fields you choose; unlike a card file, everything is searchable, linkable, and shareable.

In technical terms, Entu is a **no-code object database**: you design and change your data structure entirely in the browser, without programmers, database migrations, or schema files.

## Core Idea

Everything in Entu is an **entity** — one record of any kind: a person, a project, a document, a product. What an entity can hold is decided by its fields, called **properties**, and you define those yourself, through the UI. Change them any time — no deploy, no restart.

Properties are typed (`string`, `number`, `date`, `file`, `reference`, …), can hold multiple values or translations, and can even be computed automatically with **formulas** — a total from invoice lines, a due date, a warranty countdown.

Entities are organised in a **parent–child hierarchy**, like folders — books under a bookshelf, invoice lines under an invoice. A child can have multiple parents, so the same record can appear in several contexts without being duplicated. Access rights are set per entity, and entities can be set to inherit rights from their parent — so you manage sharing in one place.

The same data model powers the built-in UI — there is no separate admin interface; configuration and content live in the same entity tree. Developers can reach everything through the REST API, but nothing in Entu requires one.

