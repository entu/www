---
description: "Connect Claude, ChatGPT or any MCP client to your Entu databases — read and write tools and a live schema resource, with the signed-in user's rights."
---

# MCP Server

Entu speaks the [Model Context Protocol](https://modelcontextprotocol.io), so an AI assistant can read and change your databases directly instead of you pasting data into a chat. There are two endpoints:

```
https://mcp.entu.app
https://mcp.entu.app/{database}
```

The first reaches the databases you pick when you sign in; the second always reaches that one database. Everything the assistant sees and changes is limited by the rights of whoever signed in.

## Connecting

Most clients only need the URL. In Claude Code:

```bash
claude mcp add --transport http entu https://mcp.entu.app
```

Clients that support OAuth — Claude and ChatGPT connectors among them — discover Entu's [OAuth server](/api/authentication/#oauth-server) from the URL and open a browser for you. You choose how to sign in on Entu's own page, passkey included. With `https://mcp.entu.app`, Entu then lists the databases you are a user in and you tick the ones the assistant may read and change; with a database in the URL, you confirm that one. Nothing is pasted, and the assistant only ever gets your own access. Databases you can open only through [Entu support access](/configuration/users/#entu-support-access) are never offered.

The endpoint for one database also works without signing in: the assistant then reads public entities only — the same data an anonymous visitor to that database would see — and gets no write tools.

If your client cannot do OAuth, pass a [JWT](/api/authentication/) directly:

```bash
claude mcp add --transport http entu https://mcp.entu.app/mydatabase \
  --header "Authorization: Bearer YOUR_TOKEN"
```

## What the assistant can do

Read and write tools, mirroring the [REST API](/api/query-reference/). Each takes a `db` argument naming the database to read or change, limited to the databases this connection reaches:

| Tool | Purpose |
|---|---|
| `get_entity_type` | One entity type and all its property definitions |
| `search_entities` | Search by type, text and property filters — up to 100 per call, sorted or grouped |
| `get_entity` | A single entity by id |
| `get_entity_history` | Who changed what and when — needs direct rights on the entity |
| `get_file_url` | A short-lived download link for a file |
| `create_entity_type` | A new entity type |
| `create_property_definition` | A new property definition on an entity type |
| `create_entity` | A new entity |
| `update_entity` | Add values to an entity, or replace one |
| `delete_entity` | Delete an entity — needs owner rights |
| `delete_property` | Delete a single value |

Write tools are offered only once you have signed in. Each call is one change — one entity with all its values, one value, one type or one property definition — and your client asks you before it runs; once approved, it is applied immediately. Entu checks your rights for every change, exactly as in the web app. The result names the entity and its type and lists each value written or removed, with the old value next to the new one, so the assistant can tell you exactly what happened.

Some changes are refused even with full rights:

- **Entities with child entities**, and entity types that entities still use, can't be deleted — delete or move those first, or delete the entity in Entu.
- **System types** — `database`, `entity`, `menu`, `plugin`, `property` and any type carrying a `system` property — and their property definitions can't be created, changed or deleted.
- **System properties** — rights, `_parent`, `_type` and the like — can't be set or deleted. The assistant links you to the entity's rights or parents drawer instead.

## Schema resource

The server also exposes a resource per database, `entu://{database}/schema`, listing every entity type and property definition the signed-in user may see, with labels in each configured language. Assistants read this before answering questions about what a database contains, which is what lets them use your own terminology — your `isik` type stays `isik`, with its real properties, rather than a guess at what a person record looks like.

The listing reflects rights too, so two people connecting to the same database can see different schemas.

## What to expect

A search returns up to 100 entities at a time. Questions like "the newest ten", "the largest" or "how many per status" are answered in one call by sorting or grouping; only genuinely large summaries page through results. Asking for specific properties rather than whole entities keeps answers fast and leaves more of the conversation for the reply.

Since the assistant inherits your rights exactly, an entity it cannot find may exist but be invisible to you. "Not found" from an assistant means "not visible to you", not "not in the database".
