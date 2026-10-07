---
description: "Define entity types in Entu to categorise your data — create types like project, invoice, or product and configure their properties in the UI."
---

# Entity Types

An entity type defines a category of objects in your database. Create one for each kind of thing you need to store — for example `project`, `invoice`, or `product`. The fields each entity carries are defined by **property definitions**, which are child entities of the entity type.

All configuration happens through the Entu UI — no code or config files.

![An entity type with its property definitions listed](/screenshots/entity-type.png)

## Creating an Entity Type

1. Open **Configuration** in the sidebar
2. Add a new entity of type **Entity**
3. Fill in the parameters below

### Entity Type Parameters

**Identity**

| Param | Description |
|---|---|
| `name` | Internal identifier (e.g. `project`, `invoice`). Used in API queries — lowercase, no spaces by convention. |
| `label` | Display name shown in the UI (e.g. `Project`, `Invoice`). |
| `description` | Explanation of what this entity type represents. Shown on the edit view of entities of this type, and in a popover on the type label of their entity page. |

**Behaviour**

| Param | Description |
|---|---|
| `add_from` | Controls where entities of this type can be created. Reference a **menu** entity to show this type in the "New …" button when that menu is active. Reference an **entity type** to allow adding this type as a child on any instance of that type. Reference a **specific entity** to allow creating this type only as a child of that specific entity — an entity referenced this way is then offered only those types, not the ones added through its entity type. Without this, the "New …" and "Add …" buttons will never offer this type. |
| `default_parent` | When a new entity of this type is created, the entity set here is automatically added as an additional `_parent`. Useful for routing new records into a fixed folder regardless of where the user clicked "Add". |
| `plugin` | Attaches a plugin to run on entities of this type. See [Plugins](/configuration/plugins/). |

::: warning
If `add_from` is not set, users will have no way to create entities of this type through the UI. Reference at least one menu, entity type, or specific entity.
:::

To control who can see entities of this type, see [Visibility](#visibility) below.

## Adding Property Definitions

On the entity type's page, use the "Add" button to create child entities of type **Property**. Create one for each field entities of that type should have.

### Property Definition Parameters

**Identity**

| Param | Description |
|---|---|
| `name` | Internal identifier (e.g. `status`, `due_date`). Used in API queries — must contain only letters, digits, and underscores (`A–Z`, `a–z`, `0–9`, `_`) and can't start with `_` (reserved for system properties). Must be unique within the entity type. |
| `type` | Data type — determines the UI input and how values are stored. See [Property Types](#property-types) below. |
| `label` | Display name shown above the field in both the edit form and entity page. |
| `label_plural` | Plural label shown when the field has multiple values (e.g. `Tags` instead of `Tag`). |
| `description` | Help text shown in an info popover next to the field label. |

**Display**

| Param | Description |
|---|---|
| `group` | Groups related fields into named sections; the value is used as the section heading. Applies in both the edit form and entity page. |
| `ordinal` | Numeric sort order within the group. Lower numbers appear first. |
| `hidden` | Hides the field from both the edit form and the entity page. The value is still stored and returned by the API. Use for integration-managed or helper fields. |
| `readonly` | Hidden from the edit form; shown on the entity page as a read-only value. |
| `table` | Includes this property as a column in the child list table view. |

**Behaviour**

| Param | Description |
|---|---|
| `mandatory` | Marks the field as required — its label is red in the edit form, and on the entity page the field is shown even when empty, with a red label. Saving without a value is not blocked. |
| `default` | Pre-filled value when creating a new entity. Supports relative offsets for `date`/`datetime` (e.g. `+1d`, `-7d`, `+1m`). See [Property Defaults](#property-defaults) below. |
| `list` | Allows multiple values. Extra inputs appear automatically as the user fills them in. |
| `multilingual` | Stores a separate value per language. A language selector appears next to each input. |

**Computation**

| Param | Description |
|---|---|
| `formula` | A server-side expression computed on every save; the result replaces the field's stored value. Formula fields are left out of the edit form. See [Formulas](/api/formulas/). |
| `search` | Indexes values for full-text search. Choose carefully — indexing too many fields slows down search across the entire account. |

**Type options**

| Param | Description |
|---|---|
| `markdown` | Renders `text` (and `string`) values as markdown on the entity page. |
| `decimals` | Number of decimal places for `number` type fields. |
| `set` | Defines a fixed list of allowed values — renders a dropdown instead of free text. Values added here are presented as options in the entity edit view. Use with `string` type. |
| `reference_query` | Filters which entities are selectable in a `reference` field (e.g. `_type.string=person`). |

::: tip
Enable `search` on properties users frequently look entities up by in full-text search (e.g. `name`, `status`, `reference code`). Filtering by a property value in a query works without it.
:::

### Property Types

Available types: `string`, `text`, `number`, `boolean`, `date`, `datetime`, `file`, `reference`, `counter`.

See [Properties → Property Types](/overview/properties/#property-types) for descriptions of each type and their UI behaviour.

## Visibility

### Entity Type Visibility

The `_sharing` parameter on an entity type controls which property values are projected into `domain` and `public` API responses. It does **not** make entity instances publicly accessible by itself — entity-level access is still governed by `_sharing` on each entity instance.

| Param | Description |
|---|---|
| `_sharing` | Enables and caps property projection for this type: not set (default — no domain/public projection), `private` (no capping), `domain`, or `public`. See [Entities → Sharing](/overview/entities/#sharing). |

::: warning
Setting `_sharing: public` on an entity type enables property values to appear in public API responses, but entities are still only accessible to unauthenticated users if the entity instance itself also has `_sharing: public`. The type controls *what data* can be exposed; the instance controls *whether* it is accessible.
:::

### Property Visibility

By default, all properties are private — they are only included in API responses for users who have explicit access to the entity. To expose specific properties to a broader audience, set `_sharing` on each property definition individually.

| Param | Description |
|---|---|
| `_sharing` | Visibility of this property's value: `private` (default), `domain`, or `public`. Capped by the entity type's `_sharing`. |

### How They Interact

The entity type's `_sharing` acts as a cap on how broadly property definitions can expose data:

| Entity type `_sharing` | Property definition `_sharing` behaviour |
|---|---|
| not set | No properties are projected into domain or public views, regardless of property definition settings. |
| `private` | No capping is applied — properties use their own `_sharing` value. |
| `domain` | Properties set to `domain` are exposed to domain users. Properties set to `public` are automatically capped to `domain`. |
| `public` | No capping is applied — properties use their own `_sharing` value. |

::: tip
Setting `_sharing` on a property definition only controls whether that property appears in the `domain` or `public` view of an entity. It does not affect who can access the entity itself — entity-level access is governed by `_sharing` and rights properties on the entity instance.
:::

::: tip
For a full worked example of an entity type with properties, see [Use-Case Examples](/examples/).
:::

## Property Defaults

The `default` value is applied automatically by the server when an entity is first created — regardless of whether creation happens through the UI or directly via the API. It is also pre-filled in the create form so users see it immediately (except `reference` defaults, which only the server applies). `file` and `counter` properties have no defaults. If the caller already provides a value for that property, the default is skipped.

**Supported formats by type:**

| Type | Format | Example |
|---|---|---|
| `string`, `text` | Any text | `draft`, `Untitled` |
| `number` | Numeric value | `0`, `100` |
| `boolean` | `true` or `false` (case-insensitive) | `true`, `True`, `TRUE` |
| `date` | ISO date or relative offset | `2025-01-01`, `+1d`, `-7d` |
| `datetime` | ISO datetime or relative offset | `2025-01-01T09:00:00`, `+2h`, `+1d` |
| `reference` | Entity ID | `6789abc...` |

**Relative offsets for `date` and `datetime`:**

Use the format `[+/-][number][unit]` where unit is one of:

| Unit | Meaning | Example |
|---|---|---|
| `h` | Hours | `+1h`, `-2h` |
| `d` | Days | `+1d`, `-7d` |
| `w` | Weeks | `+2w` |
| `m` | Months | `+1m`, `-3m` |
| `y` | Years | `+1y` |

The offset is resolved when the entity is first created.

::: tip
Use `+0d` to default a date field to today, or `+1d` for tomorrow.
:::
