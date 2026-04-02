# Properties

Every entity is described by its **properties** — named fields that hold values. Properties are what make each entity type unique: a `person` entity has a `name` and an `email`; an `invoice` has an `amount` and a `due_date`.

Properties are defined on the entity type (as child entities of type `property`). See [Entity Types](/configuration/entity-types/#adding-property-definitions) for how to set them up in the UI.

## Core Concepts

**Multi-valued** — A single property name can hold multiple values. An entity can have several tags, phone numbers, or attachments all stored under the same property name. Enable `list` on the property definition to allow this.

**Typed** — Every property has a data type (`string`, `number`, `date`, `file`, `reference`, etc.) that determines the UI input and how values are stored.

**Multilingual** — Enable `multilingual` on a property definition to store a separate value per language. A language selector appears in the edit form, and the API returns language codes alongside values.

**Computed** — Set `formula` on a property definition to compute its value automatically on every save. See [Formulas](/api/formulas/).

**Audit trail** — All property values carry creation metadata (timestamp and user), making it traceable who set what and when.

**System properties** — Properties beginning with `_` (`_id`, `_type`, `_parent`, `_owner`, etc.) are managed by Entu and control identity, hierarchy, and access rights.

::: info
Custom property names cannot start with `_`. That prefix is reserved for system properties. Property names must also consist only of letters, digits, and underscores (`A–Z`, `a–z`, `0–9`, `_`). Hyphens, dots, spaces, and other characters are not allowed and will be rejected.
:::

## Property Types

| Type | Input | Notes |
|---|---|---|
| `string` | Single-line text | Default text input. If `set` is defined on the property definition, renders as a dropdown. |
| `text` | Multi-line textarea | Auto-resizes between 3–15 rows. Enable `markdown` to allow rich formatting. |
| `number` | Number input | Locale-formatted. Use `decimals` on the property definition to control precision. |
| `boolean` | Toggle switch | Stores `true` or `false`. |
| `date` | Date picker | Stores date only — no time component. |
| `datetime` | Date + time picker | Stores a full timestamp. |
| `file` | File upload | Stores a file attachment. See [Files](/api/files/) for the upload process. |
| `reference` | Entity selector | Links to another entity. Use `reference_query` on the definition to filter selectable options. |
| `counter` | Auto-generated code | Read-only in the UI. Shows a generate button when empty; displays the value once assigned. Use for invoice numbers, project codes. |

## Multi-Value Properties

When a property definition has `list: true`, the entity can hold multiple values for that property. In the edit form, extra empty inputs appear automatically as the user fills them in.

Via the API, each value is a separate property object — add values by POSTing, remove specific values by DELETEing their `_id`.

## Multilingual Properties

When `multilingual: true` is set on a property definition, each value carries a `language` code. The edit form shows a language selector next to each input.

Values for different languages are stored as separate property objects, each carrying a `language` code. See [API → Properties](/api/properties/) for the API format.

## File Properties

File properties let entities store attachments, documents, images, and other binary data. Files are stored in object storage (S3-compatible) and accessed via signed, time-limited URLs.

To enable file uploads on an entity type, add a property definition with `type: file`.

::: tip
If a file property named `photo` exists on an entity, the Entu UI will use it as the entity's thumbnail.
:::

## Default Values

A property definition can carry a `default` value that is applied automatically by the server when the entity is first created. It is also pre-filled in the create form so users see it immediately. The user can edit or clear the pre-filled value before saving — if they do, their value takes precedence.

Supported for all types except `file` and `counter`. For `date` and `datetime`, relative offsets like `+1d` or `-7d` can be used instead of a fixed date.

See [Property Defaults](/configuration/entity-types/#property-defaults) for the full format reference.

## Computed Properties

Set `formula` on a property definition to compute its value automatically from other data — the entity's own properties, child entities, or entities that reference it. Computed properties are recalculated on every save and cannot be edited manually.

::: tip
Use computed properties for totals, counts, and aggregations so derived data always stays in sync with the source.
:::

See [Formulas](/api/formulas/) for the full syntax reference.

## Properties Used by Entu UI

The following property names have special meaning in the UI. You can define them on any entity type and the system will use them automatically.

| Property | Type | Behaviour |
|---|---|---|
| `name` | string | Used as the entity's display title throughout the UI — in lists, breadcrumbs, search results, and as the page heading. If absent, the entity `_id` is shown instead. |
| `photo` | file | The first value is used as the entity's thumbnail image in lists and the entity page header. The system also exposes it as `_thumbnail` — a ready-to-use signed download URL. |

## System Properties

System properties begin with `_` and control entity behavior, access rights, and metadata. Custom property names cannot begin with `_`.

| Property | Description |
|---|---|
| `_id` | Unique entity identifier. Read-only, auto-generated. |
| `_type` | Reference to the entity type definition. Required on every entity. |
| `_parent` | Reference to a parent entity. An entity can have multiple `_parent` values. |
| `_sharing` | Visibility level: `private` (default), `domain`, or `public`. |
| `_inheritrights` | When `true`, the entity inherits access rights from its parent. |
| `_owner` | Full control — view, edit, delete, manage rights, create children. |
| `_editor` | Can view and edit all properties except rights. |
| `_expander` | Can view and create child entities. |
| `_viewer` | Read-only access. |
| `_noaccess` | Explicitly denied all access. Overrides inherited rights from parents. |
| `_created` | Creation timestamp and user. Read-only, auto-generated. |
| `_deleted` | Deletion timestamp and user. Set when the entity is deleted. |
| `_thumbnail` | Signed, time-limited download URL generated from the entity's `photo` property. Read-only, auto-generated. |

## Deletion

Properties are **never physically removed** from the database. When a property value is deleted:

- It is marked with `deleted.at` (timestamp) and `deleted.by` (the user who performed the deletion).
- It is automatically excluded from all API responses and the UI.
- The deletion record is permanent — you always know what was removed, when, and by whom.

::: info
Because property values are only soft-deleted, the full history of who set or removed every value is always preserved, even after the parent entity is gone.
:::

