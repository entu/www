---
description: "A planned feature for sharing entities between Entu databases, published to gather design feedback before implementation."
---

# Entity Sharing Between Databases

::: warning Concept proposal
This page describes a planned feature. Nothing on this page is implemented yet — it is published to collect feedback on the design.
:::

Every Entu account has its own isolated database. That isolation is a core guarantee — but some organisations want to make selected entities visible to each other. Libraries want a shared catalogue of books. Museums want a common view of their collections. A group of organisations may want a "marketplace" where items can be browsed, commented on, and requested for lending or exchange.

Entity sharing makes this possible without weakening isolation: an entity in one database can be **mirrored** into another database, kept in sync automatically, while the original never leaves its home.

## How it works

Two databases establish a **connection** — each side creates one connection entity in its own database, so sharing always requires mutual consent, and either side can end it by deleting its own half. From then on there is nothing new to learn: the owner grants the connection **viewer rights** on an entity, exactly as they would for a person. The sync engine notices the grant and creates a **mirror** — a read-only copy of the agreed properties — in the receiving database. Removing the grant removes the mirror.

## The connection pair

**`share_out`** — in the source database: *"I am willing to send."*

| Property | Meaning |
|---|---|
| `name` | Display name shown in the rights dialog, e.g. "Marketplace" |
| `database` | Target database name |
| `type` | Which entity types may be shared |
| `property` | Which properties may travel |

**`share_in`** — in the target database: *"I accept from."*

| Property | Meaning |
|---|---|
| `name` | Display name, e.g. "Tartu Library" |
| `database` | Source database name |
| `type` | Which entity types I accept |
| `property` | Which of the offered properties I accept |
| `parent` | Local entity (or several) under which mirrors are placed |
| `sharing` | Visibility (`private` / `domain` / `public`) applied to mirrors |
| `inherit` | If set, mirrors also inherit visibility rights from their parents |

The `type` and `property` lists reference the database's **own definition entities**, so a flat list is unambiguous — a property named `year` under *book* is a different definition than one under *artwork*. The engine resolves both sides to type-and-property names and syncs their **intersection**: the source decides what can leave, the receiver decides what it takes in, where mirrors land, and who sees them.

## Connecting with an invite link

Nobody has to copy configuration by hand. The sharing database mints a **signed link** from its `share_out`; the link carries the offer — the source database name and the offered type and property names. The receiver opens it, signs in, chooses which of their databases will receive, selects what to accept and where mirrors go, and confirms. Their `share_in` is created in their own database with exactly those choices — no entity is ever created in a foreign database.

Links are low-risk by construction: they expire, a stale offer can at most list things the source no longer sends (which then sync nothing), and a leaked link is useless to others because the `share_out` names its intended target database. Changing the agreement later needs no new link — each side edits its own half at any time and mirrors re-project. A new link is only useful for showing the receiver an expanded offer.

## Sharing entities

Grant the connection `_viewer` rights on the entity — the same drawer, the same mechanism as sharing with a person. Two familiar rules follow automatically:

- **Rights inheritance works.** Granting viewer rights on a parent with `_inheritrights` children shares the whole subtree — one grant can publish an entire collection.
- **`_noaccess` works.** Individual children can be excluded from an inherited share.

Only `_viewer` is meaningful for a connection; other rights are rejected — mirroring is strictly one-way.

## Mirrors

A mirror is an entity in the receiving database with three deliberate design choices:

**Same `_id` as the original.** Ids are globally unique, so the mirror reuses the original's. Share → unshare → share again always produces the same identity, and everything that pointed at the mirror reconnects automatically.

**Only the entity document is copied — no property documents.** The mirror carries the projected values plus `_origin_db` (where it came from) and `_origin_hash` (change detection). Property history stays at the origin. Direct writes to a mirror are rejected with a pointer to the origin.

**Read-only content, local context.** The receiving database can attach its own **child entities** to a mirror — comments, requests, annotations. These are ordinary local entities and never sync anywhere.

Rights on mirrors govern **visibility only**, derived from the `share_in` settings: the `sharing` level, plus rights inherited from the configured parents when `inherit` is set. The receiver manages who sees mirrors the way it manages any container — by setting rights on the parent. But even a user who gains editor or owner level through inheritance cannot edit a mirror; the origin guard outranks rights.

### Which system properties cross?

| Property | Crosses? | Notes |
|---|---|---|
| `_id` | yes | Same id as origin |
| `_type` | remapped | Resolved by name to the target's own type definition |
| `_parent` | conditional | Kept if the parent is also mirrored (subtrees keep their hierarchy); otherwise the `share_in` parent is used |
| `_created` | yes | Origin creation time |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess` | never | Rights never cross; mirror visibility comes from `share_in` |
| `_sharing`, `_inheritrights` | never | The receiver decides its own visibility |
| `_deleted` | never | Deletion at origin removes the mirror instead |

### References

Because mirrors keep original ids, reference properties are copied as-is:

- If the referenced entity is also shared, the reference resolves in the target.
- If not, it displays as plain text (the display name is stored alongside).
- If the referenced entity is shared *later*, the reference starts resolving immediately.

## Sync and lifecycle

The engine runs inside the existing background aggregation worker — every property change already queues an entity for re-aggregation, and sharing adds a final step:

1. **Detect** — is a `share_out` connection in the entity's access list?
2. **Validate** — is the connection pair active, and is the entity's type accepted by both sides?
3. **Project** — keep only the agreed properties. Credentials and rights properties never cross, regardless of configuration.
4. **Write** — insert or update the mirror in the target database, skipped when nothing changed.
5. **Retract** — if the check fails but a mirror exists, the mirror is removed.

Every way sharing can end — viewer right removed, origin entity deleted, agreement narrowed, connection revoked — lands in the same retract step. Local child entities are never touched: they go dormant, and reconnect if the entity is shared again under its unchanged `_id`. When a connection pair becomes active, a one-time sweep syncs every entity already granted to it; when it becomes inactive, all its mirrors are removed.

## Security guarantees

- Consent is mutual and independently revocable, each side in its own database, with immediate effect.
- Mirroring is strictly one-way; no write access ever crosses a database boundary.
- Credentials (API keys, passkeys) and rights can never be shared — enforced in the engine, not by configuration.
- Nothing crosses unless the source offered it *and* granted it *and* the receiver accepted it.

## Example: a marketplace

A group of libraries and museums creates a shared `market` database. Each institution connects to it and grants the connection viewer rights on the items it wants to list — the mirrors become the catalogue, searchable like any Entu database. Visitors log in with their existing Entu identity and browse; comments and lending requests are local child entities of the mirrors. A reverse connection can share each request back into the owning institution's database, so staff handle requests without leaving their own Entu.

## Open questions

- **Files and images** — file properties reference storage objects in the source account; mirrors need either a proxy that re-checks access at the origin, or thumbnail copies made at sync time.
- **Per-mirror visibility overrides** — v1 applies one visibility to all mirrors of a connection; per-mirror overrides would require merging local rights over the synced document.
- **Type mapping** — v1 requires the same type name on both sides; explicit source-type → target-type mapping could come later.

Feedback is welcome — this design aims to make cross-organisation collaboration possible while keeping each database fully in control of its own data.
