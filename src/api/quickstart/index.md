# API Quick Start

Get started with the Entu API in 5 minutes. This guide walks through getting a token, creating your first entity, and querying data.

## 1. Get a Token

Generate an API key from your person entity in the Entu UI, then exchange it for a JWT token:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
{
  "accounts": [
    {
      "_id": "mydatabase",
      "name": "mydatabase",
      "user": {
        "_id": "npfwb8fv4ku7tzpq5yjarncc",
        "name": "John Doe"
      }
    }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

The JWT token is valid for 48 hours. Use it in all subsequent requests. For OAuth and Passkey flows, see [Authentication](/api/authentication/).

::: tip
Cache the JWT and reuse it across requests. Only refresh when the token expires.
:::

## 2. Create an Entity

The `_type` property is mandatory — it references the entity type that determines what kind of entity you're creating.

::: info
To find the entity type ID, query `GET /api/{db}/entity?_type.string=entity&name.string=project` or look it up in the Entu UI on the entity type's page.
:::

```bash
curl -X POST "https://entu.app/api/mydatabase/entity" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "_type", "reference": "507f1f77bcf86cd799439011" },
    { "type": "name", "string": "My First Entity" },
    { "type": "description", "string": "Created via API" }
  ]'
```

Response returns the created entity ID and all created property objects (file properties also include a signed S3 upload URL):

```json
{
  "_id": "6798938432faaba00f8fc72f",
  "properties": {
    "_type": [{ "_id": "...", "reference": "507f1f77bcf86cd799439011" }],
    "name":  [{ "_id": "...", "string": "My First Entity" }],
    "description": [{ "_id": "...", "string": "Created via API" }]
  }
}
```

## 3. Query Entities

List entities with filtering:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?_type.reference=507f1f77bcf86cd799439011&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Full-text search:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?q=test&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. Get a Single Entity

```bash
curl -X GET "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The response wraps the entity under an `entity` key:

```json
{
  "entity": {
    "_id": "6798938432faaba00f8fc72f",
    "name": [{ "_id": "...", "type": "name", "string": "My First Entity" }]
  }
}
```

## 5. Add Properties to an Entity

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "status", "string": "active" },
    { "type": "priority", "number": 5 }
  ]'
```

## 6. Upload a File

Create a file property to get an upload URL:

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "photo", "filename": "image.jpg", "filesize": 245678, "filetype": "image/jpeg" }
  ]'
```

The response includes a signed S3 upload URL. PUT the file directly using the **exact headers returned in the response** (ACL, Content-Disposition, Content-Length, Content-Type are all required):

::: tip
A file property named `photo` is used by the Entu UI as the entity thumbnail.
:::

```bash
curl -X PUT "SIGNED_S3_URL" \
  -H "ACL: private" \
  -H "Content-Disposition: inline;filename=\"image.jpg\"" \
  -H "Content-Length: 245678" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@image.jpg"
```

::: warning
The signed upload URL expires after 60 seconds. Complete the PUT immediately after receiving the URL.
:::

## 7. Delete a Property

```bash
curl -X DELETE "https://entu.app/api/mydatabase/property/PROPERTY_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

- [Entities](/overview/entities/) — Understand the entity-property model
- [Query Reference](/api/query-reference/) — Full filter and sort syntax
- [Best Practices](/api/best-practices/) — Optimization tips and patterns
- [Formulas](/api/formulas/) — Computed properties
- [Files](/api/files/) — File upload and download
