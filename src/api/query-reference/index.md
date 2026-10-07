---
description: "Query Entu entities over the REST API with URL parameters — the full filter syntax for lists, menus, and reference queries."
---

# Query Reference

Entities are queried via `GET /api/{db}/entity` using URL query parameters. The same filter syntax is used in menu `query` parameters and in `reference_query` on reference property definitions.

## Filters

Filters follow the pattern `propertyName.type=value`. The type is the value field that holds the value: `string` for `string`, `text` and `counter` properties, `number` for `number` properties and the numeric part of a counter, `filesize`, `filename` or `filetype` for files. A `reference` value also carries the referenced entity's name in `string`.

| Filter | Example | Description |
|---|---|---|
| `prop.string=value` | `_type.string=invoice` | Exact string match |
| `prop.string.regex=/pattern/flags` | `name.string.regex=/acme/i` | Regular expression match |
| `prop.string.in=a,b,c` | `status.string.in=active,pending` | Match any of the listed values |
| `prop.string.exists=true\|false` | `email.string.exists=true` | Check whether a string property has a value |
| `prop.reference=id` | `owner.reference=abc123` | Exact reference match |
| `prop.reference.in=id1,id2` | `owner.reference.in=abc,def` | Match any of the listed entity IDs |
| `prop.reference.exists=true\|false` | `owner.reference.exists=true` | Check whether a reference property has a value |
| `prop.number=n` | `budget.number=1000` | Exact number match |
| `prop.number.gt=n` | `budget.number.gt=500` | Greater than |
| `prop.number.gte=n` | `budget.number.gte=500` | Greater than or equal |
| `prop.number.lt=n` | `budget.number.lt=1000` | Less than |
| `prop.number.lte=n` | `budget.number.lte=1000` | Less than or equal |
| `prop.number.ne=n` | `budget.number.ne=0` | Not equal |
| `prop.number.in=a,b,c` | `quantity.number.in=10,20,30` | Match any of the listed numbers |
| `prop.number.exists=true\|false` | `price.number.exists=true` | Check whether a number property has a value |
| `prop.boolean=true\|false` | `active.boolean=true` | Boolean match |
| `prop.boolean.in=true,false` | `active.boolean.in=true,false` | Match any of the listed booleans |
| `prop.boolean.exists=true\|false` | `active.boolean.exists=true` | Check whether a boolean property has a value |
| `prop.date=YYYY-MM-DD` | `due_date.date=2025-01-01` | Exact date match |
| `prop.date.gt=date` | `due_date.date.gt=2025-01-01` | Greater than |
| `prop.date.gte=date` | `due_date.date.gte=2025-01-01` | Greater than or equal |
| `prop.date.lt=date` | `due_date.date.lt=2025-12-31` | Less than |
| `prop.date.lte=date` | `due_date.date.lte=2025-12-31` | Less than or equal |
| `prop.date.in=d1,d2` | `event_date.date.in=2025-01-01,2025-02-01` | Match any of the listed dates |
| `prop.date.exists=true\|false` | `due_date.date.exists=true` | Check whether a date property has a value |
| `prop.datetime=ISO8601` | `created_at.datetime=2025-01-28T08:21:25Z` | Exact datetime match |
| `prop.datetime.gt=ISO8601` | `created_at.datetime.gt=2025-01-01T00:00:00Z` | Greater than |
| `prop.datetime.gte=ISO8601` | `created_at.datetime.gte=2025-01-01T00:00:00Z` | Greater than or equal |
| `prop.datetime.lt=ISO8601` | `created_at.datetime.lt=2025-12-31T00:00:00Z` | Less than |
| `prop.datetime.lte=ISO8601` | `created_at.datetime.lte=2025-12-31T00:00:00Z` | Less than or equal |
| `prop.datetime.in=d1,d2` | `created_at.datetime.in=2025-01-01T00:00:00Z,...` | Match any of the listed datetimes |
| `prop.datetime.exists=true\|false` | `created_at.datetime.exists=true` | Check whether a datetime property has a value |
| `prop.filesize=n` | `attachment.filesize=1024` | Exact file size match (bytes) |
| `prop.filesize.gt=n` | `attachment.filesize.gt=1000000` | File size greater than |
| `prop.filesize.gte=n` | `attachment.filesize.gte=1000000` | File size greater than or equal |
| `prop.filesize.lt=n` | `attachment.filesize.lt=5000000` | File size less than |
| `prop.filesize.lte=n` | `attachment.filesize.lte=5000000` | File size less than or equal |
| `prop.filesize.in=a,b` | `attachment.filesize.in=1024,2048` | Match any of the listed file sizes |
| `prop.filesize.exists=true\|false` | `photo.filesize.exists=true` | Check whether a file property has a value |

- `exists` takes `true` or `false` on every type; any other value means `false`.
- `gt`, `gte`, `lt`, `lte` and `ne` also work on `string` fields. `ne` also matches entities that don't have the property at all.
- Other value fields — `filename`, `filetype`, `language` and so on — are filtered as strings with the same operators, e.g. `photo.filetype=image/jpeg`.
- `regex` takes `/pattern/flags`. Only the flags `i`, `m` and `s` take effect and other flags are dropped, except `x`, which returns `400 Invalid regex` like an invalid pattern does. A value without `/` is used as the pattern as-is.
- `date` and `datetime` values can also be given as a Unix timestamp in milliseconds.
- On `boolean`, any value other than `true` means `false`.
- An unknown operator is ignored and the filter matches the value exactly.
- An invalid entity ID in a `reference` filter returns `400 Invalid ID`.

Multiple filters are combined with `&` and all must match (AND logic). There is no built-in OR between different filter keys — use `.in` to match multiple values for the same property:

```
?_type.string=project&status.string=active&owner.reference=USER_ID
```

## Sorting

Prefix the sort field with `-` for descending order.

| Parameter | Example | Description |
|---|---|---|
| `sort=prop.type` | `sort=name.string` | Sort ascending |
| `sort=-prop.type` | `sort=-date.date` | Sort descending |
| `sort=a,-b` | `sort=status.string,-date.date` | Multi-field sort |

Without `sort`, entities are returned by `_id` ascending — in creation order.

## Pagination

| Parameter | Example | Description |
|---|---|---|
| `limit=n` | `limit=50` | Max results to return (default: 100). `0` or a non-numeric value also means 100; there is no upper bound. |
| `skip=n` | `skip=100` | Results to skip (default: 0) — use with `limit` for paging |

```bash
# Page 1
GET /api/{db}/entity?limit=100&skip=0

# Page 2
GET /api/{db}/entity?limit=100&skip=100
```

## Full-Text Search

```bash
GET /api/{db}/entity?q=acme+corp
```

Searches across all properties that have `search` enabled on their definition. The query is split on spaces and every term must match; a term matches any part of a word, case-insensitively, and only its first 20 characters are used.

::: tip
Enable `search` on properties users naturally search by (name, title, code). Without it, `q=` will not find values in that field.
:::

::: info
Authenticated requests search the full private index (which includes domain-shared and public entities). Unauthenticated requests search only the public index. The domain search index is not used for queries — domain-shared entities appear in authenticated searches because their searchable values are included in the private index.
:::

## Field Selection

Return only specific properties to reduce response size:

```bash
GET /api/{db}/entity?props=name,status,_created
```

`_id` is always returned.

## Grouping

Return one row per distinct value combination instead of individual entities:

```bash
GET /api/{db}/entity?_type.string=invoice&group=status.string&props=status
```

Each row holds the `props` values of the first entity in its group and `_count`, the number of entities in the group; rows have no `_id`. The grouped values appear only if they are also listed in `props`. `count` is the number of groups. `limit` and `skip` are ignored when grouping.

## Common Patterns

```bash
# All entities of a type
?_type.string=invoice
```

::: tip
`_type.string` filters by the entity type's `name` property (e.g. `invoice`), not its display `label`. If your entity type's `name` and `label` differ, always use the `name` value here.
:::

```bash
# Children of a parent
?_parent.reference=PARENT_ID

# Entities with a file in photo
?photo.filesize.exists=true

# Case-insensitive name search
?name.string.regex=/john/i

# Date range
?due_date.date.gte=2025-01-01&due_date.date.lte=2025-12-31

# Multiple statuses
?status.string.in=active,pending,review
```
