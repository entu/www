# Entities

Entities are the core building blocks of Entu. An entity is a record — a person, a project, an invoice, a product — any object you need to manage. Every entity belongs to an **entity type** that acts as a blueprint for what kind of data it holds.

To define your data model in the UI, see [Entity Types](/configuration/entity-types/).

## Key Characteristics

**Flexible properties** — Unlike a relational table with fixed columns, entities carry any set of properties defined by their type. Different entity types can model entirely different shapes of data in the same system.

**Multi-valued properties** — A single property name can hold multiple values. An entity can have several tags, phone numbers, or file attachments all stored under the same property name.

**Hierarchical structure** — Entities can have parent–child relationships. A child entity can have multiple parents, meaning it appears in several contexts simultaneously without being duplicated.

**References** — Entities can reference other entities via reference properties, creating a connected graph of data.

**Computed properties** — Properties can be defined as formulas that recalculate automatically on every save, based on the entity's own data, its children, or entities that reference it. See [Formulas](/api/formulas/).

**Audit trail** — All property values carry creation metadata (timestamp and user), making it traceable who set what and when.

## Hierarchy and Relationships

Entities are organised into hierarchies using the `_parent` system property.

**Multiple parents** — An entity can have more than one parent and appears as a child in each context without being duplicated. A document can belong to both a project and a department simultaneously.

**Creating children** — When you use the "Add" button on a parent entity's page, `_parent` is set automatically. You need at least `_expander` rights on the parent to create children (`_editor` and `_owner` include `_expander`).

**Rights inheritance** — When `_inheritrights: true` is set on a child entity, it inherits the access rights from its parent. Changes at the parent level cascade down to all children with inheritance enabled.

::: tip
The recommended pattern is to grant rights on a parent container and enable `_inheritrights` on children — this way you manage access in one place instead of on every entity individually.
:::

## Access Rights

Every entity has explicit access control. Rights are set by referencing a person entity under the appropriate rights property. A person has access if they match any entry in any rights property.

| Property | Access level |
|---|---|
| `_owner` | Full control — view, edit all properties, delete the entity, manage rights, create children. |
| `_editor` | Can view and edit all properties except the rights properties themselves. |
| `_expander` | Can view the entity and create child entities under it. |
| `_viewer` | Read-only — can view the entity and its properties. |
| `_noaccess` | Explicitly denied all access on this entity. Overrides all other rights properties set on the same entity. Not propagated to children via `_inheritrights`. |

### Sharing

The `_sharing` property controls visibility beyond individual user rights:

| Value | Who can view |
|---|---|
| `private` | Only users with explicit rights. This is the default. |
| `domain` | All authenticated users in the database, regardless of explicit rights. |
| `public` | Anyone, including unauthenticated visitors. |

Editing always requires `_editor` or `_owner` rights regardless of sharing level.

::: info
`domain` and `public` sharing only grants read access. Write access always requires explicit `_editor` or `_owner` rights on the entity.
:::

::: danger
Setting `_sharing: public` makes the entity visible to anyone on the internet without authentication. Only use it for intentionally public content.
:::

### Rights Inheritance

Set `_inheritrights: true` on an entity to inherit rights from its parent. Rights defined directly on the child override inherited ones. Use `_noaccess` to block a user who would otherwise inherit access from a parent.

::: info
Right evaluation order: explicit rights on the entity → inherited rights from parent → `_sharing` level. `_noaccess` overrides all other rights on the same entity — including direct positive rights. It is not propagated to children via `_inheritrights`; only `_viewer`, `_expander`, `_editor`, and `_owner` are inherited.
:::

## Deletion

When an entity is deleted, a `_deleted` property record is inserted, recording the user and exact timestamp. The entity document is then permanently removed from the database. The underlying raw property records in the `property` collection are retained for audit purposes, but the entity no longer appears in any API responses or the UI.

Properties in other entities that referenced the deleted entity are also marked with `deleted.at` / `deleted.by` to keep the audit trail consistent.

::: info
Only `_owner` users can delete an entity.
:::
