---
description: "Entu API endpoints for duplicating an entity, reading its change history, and listing the changes a person has made."
---

# Entities

Entities are listed with [`GET /api/{db}/entity`](/api/query-reference/) and written as described in [Properties](/api/properties/). The endpoints below duplicate an entity and read its change history. All of them require a JWT token in the `Authorization: Bearer <token>` header.

## Duplicate

Creates copies of an entity.

```
POST /api/{db}/entity/{_id}/duplicate
```

Request body — required; send `{}` for the defaults:

```json
{
  "count": 3,
  "ignoredProperties": ["code"]
}
```

| Field | Description |
|---|---|
| `count` | Number of copies, 1 to 100 (default: 1) |
| `ignoredProperties` | Property names not to copy (default: none) |

You need `_owner` rights on the entity, and `_expander` rights on every `_parent` that is copied.

Every current property value is copied — including `_parent`, `_sharing` and the rights properties — and you are added as `_owner`. Counter values are copied as they are, not renumbered. Formula values are not copied; each copy computes its own. Like any new entity, a copy also gets the entity type's default parents and the default values of properties it does not have. Not copied: files, `entu_user` and `entu_api_key` credentials, billing properties, `_created` (each copy gets its own), `_mid` and the names in `ignoredProperties`. Duplicating does not trigger [webhooks](/configuration/plugins/#plugin-types).

The response is an array with one item per copy, each shaped like the response of `POST /api/{db}/entity`: the new `_id` and the written `properties`.

## History

Returns the change log of an entity's property values, oldest first.

```
GET /api/{db}/entity/{_id}/history
```

| Parameter | In | Description |
|---|---|---|
| `limit` | query | Entries to return, 1 to 1000 (default: 100); larger values are capped |
| `skip` | query | Entries to skip (default: 0) |

```json
{
  "changes": [
    {
      "type": "status",
      "at": "2025-01-28T08:21:25.637Z",
      "by": "6798938432faaba00f8fc72f",
      "old": { "_id": "...", "string": "draft" },
      "new": { "_id": "...", "string": "active" }
    }
  ],
  "count": 14
}
```

- `type` — property name
- `at`, `by` — when and by whom (person entity ID, or `entu` for server changes), if recorded
- `old` — the removed value, `new` — the added value; a removal and an addition with the same `type`, `at` and `by` are one entry with both
- `count` — total number of entries

For reference values, `string` holds the referenced entity's name. Credential values are masked. `_created` and `_mid` are left out.

History needs your own rights on the entity — set directly or inherited via `_inheritrights`. Reading it through `domain` or `public` [sharing](/overview/entities/#sharing) is not enough, because history can show values that have since been hidden; such requests get `403`.

## Activity

Returns the changes an entity — usually a person — has made, newest first.

```
GET /api/{db}/entity/{_id}/activity
```

| Parameter | In | Description |
|---|---|---|
| `limit` | query | Entries to return, 1 to 1000 (default: 100); larger values are capped |
| `skip` | query | Entries to skip, 0 to 10 000 (default: 0); larger values are capped |

The response is `{ "changes": [...] }` with the same entries as [History](#history), each with an extra `entity` object — the `_id` and `name` of the changed entity. There is no `count`.

Only changes on entities you have your own rights on (as for History) are listed. The entity whose activity you ask for must be readable to you; otherwise the response is `404`.
