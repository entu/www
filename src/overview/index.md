# What is Entu

Entu is a **no-code object database** — a system for storing, organising, and querying structured data without writing migrations, schema files, or backend code.

## Core Idea

Everything in Entu is an **entity**. An entity is a record of any kind — a person, a project, a document, a product — defined by the properties it carries. You decide what properties each entity type has by configuring **property definitions** through the UI. No deploy, no restart.

Properties are typed (`string`, `number`, `date`, `file`, `reference`, …), can hold multiple values, and can be computed automatically using **formulas** that reference other properties, child entities, or related records.

Entities are organised in a **parent–child hierarchy**. A child can have multiple parents, so the same record can appear in several contexts simultaneously without being duplicated. Access rights (`_owner`, `_editor`, `_expander`, `_viewer`) are set per entity and cascade down the hierarchy automatically.

The same data model powers the built-in UI — there is no separate admin interface; configuration and content live in the same entity tree.

## Next Steps

- [Entities](/overview/entities/) — hierarchy, rights, and deletion in detail
- [Properties](/overview/properties/) — types, multi-value, multilingual, and system properties
- [Entity Types](/configuration/entity-types/) — how to configure your data model
