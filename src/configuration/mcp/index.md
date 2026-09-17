---
description: "Connect Claude, ChatGPT or any MCP client to an Entu database — read-only tools and a live schema resource, filtered by the signed-in user's rights."
---

# MCP Server

Entu speaks the [Model Context Protocol](https://modelcontextprotocol.io), so an AI assistant can read a database directly instead of you pasting data into a chat. Each database has its own endpoint:

```
https://mcp.entu.app/{database}
```

Everything the assistant sees is filtered by the rights of whoever signed in. Without a token it reads public entities only — the same data an anonymous visitor to your database would see.

## Connecting

Most clients only need the URL. In Claude Code:

```bash
claude mcp add --transport http entu https://mcp.entu.app/mydatabase
```

For private data, sign in. Clients that support OAuth — Claude and ChatGPT connectors among them — discover Entu's [OAuth server](/api/authentication/#oauth-server) from the URL and open a browser for you. Nothing is pasted, and the assistant only ever gets your own access.

If your client cannot do OAuth, pass a [JWT](/api/authentication/) directly:

```bash
claude mcp add --transport http entu https://mcp.entu.app/mydatabase \
  --header "Authorization: Bearer YOUR_TOKEN"
```

## What the assistant can do

Three read tools, mirroring the [query API](/api/query-reference/):

| Tool | Purpose |
|---|---|
| `get_entity_type` | One entity type and all its property definitions |
| `search_entities` | Search by type, text and property filters, 20 results per call |
| `get_entity` | A single entity by id |

The server is **read-only**. An assistant can answer questions about your data, summarise it and cross-reference it, but cannot create, change or delete anything.

## Schema resource

The server also exposes a resource, `entu://schema`, listing every entity type and property definition the signed-in user may see, with labels in each configured language. Assistants read this before answering questions about what a database contains, which is what lets them use your own terminology — your `isik` type stays `isik`, with its real properties, rather than a guess at what a person record looks like.

The listing reflects rights too, so two people connecting to the same database can see different schemas.

## What to expect

Results are capped at 20 entities per search, so an assistant asked to summarise thousands of records will page through them or work from a sample. Ask for specific properties rather than whole entities when a question only needs a few fields — it is faster and keeps more of the conversation available for the answer.

Since the assistant inherits your rights exactly, an entity it cannot find may exist but be invisible to you. "Not found" from an assistant means "not visible to you", not "not in the database".
