---
description: "Read an Entu database's usage and limits over the API — entities, properties, files, API requests and AI tokens."
---

# Database

Returns the database's usage and limits. Requires a JWT token with a user in this database.

```
GET /api/{db}
```

```json
{
  "organization": [{ "language": "en", "string": "Example Museum" }],
  "entities": { "usage": 15230, "deleted": 412, "limit": 50000 },
  "properties": { "usage": 210554, "deleted": 18320 },
  "requests": { "usage": 1234, "limit": 2000 },
  "tokens": { "usage": 25480, "limit": 100000 },
  "files": { "usage": 5368709120, "deleted": 104857600, "limit": 10000000000 },
  "dbSize": 187695104
}
```

| Field | Description |
|---|---|
| `organization` | The database entity's `organization` values |
| `entities` | `usage` — existing entities (an estimate); `deleted` — entities ever deleted; `limit` — entity limit, `0` if not set |
| `properties` | `usage` — current property values; `deleted` — soft-deleted values |
| `requests` | `usage` — API requests this month; `limit` — only a scale for display (the usage rounded up on its leading digit), not an enforced limit |
| `tokens` | `usage` — [AI](/api/ai/) tokens used this month; `limit` — the monthly AI token limit, 100 000 if not set |
| `files` | `usage` — bytes in live files; `deleted` — bytes in deleted files still in storage; `limit` — storage limit in bytes, `0` if not set |
| `dbSize` | Database data plus index size in bytes |

Months are calendar months in UTC. The result is cached for 5 minutes, so recent changes may not show yet.
