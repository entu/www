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

Five read tools, mirroring the [REST API](/api/query-reference/):

| Tool | Purpose |
|---|---|
| `get_entity_type` | One entity type and all its property definitions |
| `search_entities` | Search by type, text and property filters — up to 100 per call, sorted or grouped |
| `get_entity` | A single entity by id |
| `get_entity_history` | Who changed what and when — needs direct rights on the entity |
| `get_file_url` | A short-lived download link for a file |

The server is **read-only**. An assistant can answer questions about your data, summarise it and cross-reference it, but cannot create, change or delete anything — instead it links you to the entity, or straight to its edit or rights drawer, so you can make the change yourself.

## Schema resource

The server also exposes a resource, `entu://schema`, listing every entity type and property definition the signed-in user may see, with labels in each configured language. Assistants read this before answering questions about what a database contains, which is what lets them use your own terminology — your `isik` type stays `isik`, with its real properties, rather than a guess at what a person record looks like.

The listing reflects rights too, so two people connecting to the same database can see different schemas.

## What to expect

A search returns up to 100 entities at a time. Questions like "the newest ten", "the largest" or "how many per status" are answered in one call by sorting or grouping; only genuinely large summaries page through results. Asking for specific properties rather than whole entities keeps answers fast and leaves more of the conversation for the reply.

Since the assistant inherits your rights exactly, an entity it cannot find may exist but be invisible to you. "Not found" from an assistant means "not visible to you", not "not in the database".
