# API Best Practices

Patterns and recommendations for working efficiently with the Entu API.

## Efficient Querying

**Use specific filters instead of client-side filtering:**
```http
# Good — filter on server
GET /api/{db}/entity?status.string=active&_type.reference=TYPE_ID

# Avoid — fetching all and filtering client-side
GET /api/{db}/entity?_type.reference=TYPE_ID
```

**Limit returned properties to reduce response size:**
```http
GET /api/{db}/entity?props=name,status,_created&limit=100
```

**Use `.in` for multiple value filtering in a single request:**
```http
GET /api/{db}/entity?status.string.in=active,pending,review
```

**Use pagination for large datasets:**
```http
GET /api/{db}/entity?limit=100&skip=0    # first page
GET /api/{db}/entity?limit=100&skip=100  # second page
```

See [Query Reference](/api/query-reference/) for full filter syntax.

## Batch Operations

Create entities with multiple properties in a single request rather than separate calls:

```json
[
  { "type": "name", "string": "Product" },
  { "type": "price", "number": 99.99 },
  { "type": "status", "string": "active" }
]
```

## File Uploads

Always specify correct MIME types:
```json
{ "type": "document", "filename": "report.pdf", "filesize": 1245678, "filetype": "application/pdf" }
```

Upload directly to S3 using the signed URL — don't proxy files through your own server. The signed upload URL expires after **60 seconds** — complete the PUT immediately.

## Token Management

**Cache JWT tokens** — valid for 48 hours. Reuse them instead of requesting new ones per operation. Implement refresh before expiry.

::: warning
Never commit API keys to source control. Use environment variables or a secrets manager. If a key is exposed, delete it from the person entity and generate a new one immediately.
:::

## Performance

**Index frequently queried properties** by enabling `search` on the property definition. System properties `_type` and `_parent` are already indexed.

**Avoid unnecessary aggregation** — regular GET requests return cached data. Only use `GET /api/{db}/entity/{_id}/aggregate` when you need fresh formula values after external changes.

## Error Handling

**Check status codes:**
- `401` — Refresh authentication token
- `403` — User lacks permissions; check entity rights
- `404` — Entity/property not found or no access
- `400` — Validate request body structure

Retry `5xx` errors with exponential backoff. Do not retry `4xx` errors.

## Security

- Use HTTPS only
- Validate and sanitize user input before creating properties
- Don't rely on client-side access control — verify rights server-side

::: danger
`_sharing: public` exposes entity data to anyone on the internet, including search engine crawlers. Never use it for sensitive or internal data.
:::
