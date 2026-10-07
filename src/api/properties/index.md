---
description: "Reference for Entu API property value objects — the fields returned for each property and how values are structured."
---

# Properties

Each property value returned by the API is an object with the following fields:

| Field | Description |
|---|---|
| `_id` | Unique identifier for this property value. Use it to delete a specific value. |
| `type` | The property name (matches the definition name, e.g. `name`, `status`). Not included when reading entities — there the property name is the key that holds the values. |
| `string` | String value. Present for `string`, `text` and `counter` type properties. |
| `number` | Number value. Present for `number` type properties, and for `counter` properties as the numeric part of the counter. |
| `boolean` | Boolean value. Present for `boolean` type properties. |
| `date` | Date value. Written as `YYYY-MM-DD`, returned as an ISO 8601 timestamp (e.g. `1999-03-15T00:00:00.000Z`). Present for `date` type properties. |
| `datetime` | Datetime value (ISO 8601). Present for `datetime` type properties. |
| `reference` | Referenced entity ID. Present for `reference` type properties. In entity responses the value also carries `string` (the referenced entity's name) and `entity_type` (its entity type name). |
| `filename` | File name. Present for `file` type properties. |
| `filesize` | File size in bytes. Present for `file` type properties. |
| `filetype` | MIME type. Present for `file` type properties. |
| `language` | Language code (e.g. `en`, `et`). Present on values written with a language — used for properties whose definition has `multilingual: true`. |
| `created` | Object with `at` (ISO timestamp) and `by` (person entity ID) — who set this value and when. Returned only by `GET /api/{db}/property/{_id}`. |

::: tip
Save the `_id` of property values you may want to update or delete later. Without it, you can only delete the property entirely or add new values alongside existing ones.
:::

### Example: Entity with Properties

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "string": "Acme Corp"
    }
  ],
  "status": [
    {
      "_id": "507f1f77bcf86cd799439033",
      "string": "active"
    }
  ],
  "revenue": [
    {
      "_id": "507f1f77bcf86cd799439044",
      "number": 1500000
    }
  ]
}
```

## Writing Properties

POST an array of property objects to create or update values:

```json
[
  { "type": "name", "string": "Acme Corp" },
  { "type": "status", "string": "active" },
  { "type": "revenue", "number": 1500000 },
  { "type": "is_active", "boolean": true },
  { "type": "founded", "date": "1999-03-15" },
  { "type": "owner", "reference": "507f1f77bcf86cd799439099" }
]
```

Use the value field that matches the property type (`string`, `number`, `boolean`, `date`, `datetime`, `reference`).

::: warning
When creating a new entity (POST to `/api/{db}/entity`), you must include a `_type` property referencing the entity type. Omitting it returns a `400` error.
:::

## Overwriting a Property Value

To overwrite a specific existing value rather than adding a new one, include its `_id` in the POST body:

```json
[
  { "_id": "507f1f77bcf86cd799439033", "type": "status", "string": "inactive" }
]
```

This replaces the value of that exact property object: the old value is soft-deleted and the new value gets a new `_id`. Without `_id`, a new value is always added alongside any existing ones.

## Multi-Value Properties

When a property definition has `list: true`, multiple values can exist under the same property name. Each value is a separate property object with its own `_id`.

**Adding a value** — POST a new property object:
```json
{ "type": "tag", "string": "priority" }
```

**Removing a specific value** — DELETE the property by its `_id`:
```
DELETE /api/{db}/property/{_id}
```

## Multilingual Properties

When a property definition has `multilingual: true`, each language is a separate property object carrying a `language` code.

**Reading** — the API returns one object per language:
```json
"description": [
  { "_id": "...", "string": "Overview", "language": "en" },
  { "_id": "...", "string": "Ülevaade", "language": "et" }
]
```

**Writing** — include the `language` field when POSTing:
```json
[
  { "type": "description", "string": "Overview", "language": "en" },
  { "type": "description", "string": "Ülevaade", "language": "et" }
]
```

The language code is exactly two lowercase letters (`en`, `et`) — anything else is rejected.

## Deleting a Property

Delete a specific property value by its `_id`:

```
DELETE /api/{db}/property/{_id}
```

Returns `{ "deleted": true }` on success. Deletion is a soft-delete — the property is marked as deleted and excluded from the entity, but remains in the database for audit purposes.

### Restrictions

| Property | Rule |
|---|---|
| Any property | Requires `_editor` rights on the entity |
| `_type` | Cannot be deleted |
| Other system properties starting with `_` (e.g. `_created`) | Cannot be deleted |
| Server-managed billing properties (`billing_*`) | Cannot be deleted |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess`, `_sharing`, `_inheritrights`, `_parent` | Requires `_owner` rights on the entity |
| `_owner` (last one) | Cannot be deleted — at least one `_owner` must remain |
| `_parent` | Also requires `_expander` rights on the referenced parent entity |

::: warning
Deleting `_type` always returns `403`. To change an entity's type, overwrite the existing value by POSTing with the old property `_id` and a new reference — see [Overwriting a Property Value](#overwriting-a-property-value).
:::
