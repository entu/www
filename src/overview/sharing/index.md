---
description: "Read-only mirroring of entities between Entu databases, configured with share_out and share_in entities."
---

# Entity Sharing Between Databases

Every Entu account has its own isolated database. That isolation is a core guarantee — but organisations sometimes want to make selected entities visible to each other: libraries a shared catalogue of books, museums a common view of their collections, a group of organisations a marketplace.

Entity sharing makes this possible without weakening isolation. An entity in one database can be **mirrored** into another: the receiving database gets a read-only copy of the agreed properties, kept in sync automatically, while the original never leaves its home. Mirrors are searchable and browsable like any local entity, and local entities can reference them — but nothing about a mirror can be changed in the receiving database. The origin stays the only place of change.

## Setting up

Sharing runs over a **connection**: two ordinary entities, one in each database. Data flows only while both exist, so sharing always requires mutual consent — and either side can end it by deleting its own half.

**`share_out`** — in the sharing database: *"I am willing to send."*

| Property | Meaning |
|---|---|
| `name` | Display name shown in the rights dialog, e.g. "Marketplace" |
| `database` | Receiving database name |
| `type` | Which entity types may be shared |
| `property` | Which properties may travel |

**`share_in`** — in the receiving database: *"I accept from."*

| Property | Meaning |
|---|---|
| `name` | Display name, e.g. "Tartu Library" |
| `database` | Sharing database name |
| `type` | Which entity types I accept |
| `property` | Which of the offered properties I accept |
| `parent` | Local entity (or several) under which mirrors are placed |
| `sharing` | Visibility (`private` / `domain` / `public`) applied to mirrors |
| `inherit` | If set, mirrors also inherit visibility rights from their parents |

The `type` and `property` lists reference the database's **own definition entities**. The offer is precise — a property named `year` under *book* is a different definition than one under *artwork*, and only the listed pairs are offered. Acceptance is by name: an accepted property applies to every accepted type that offers it. Several overlapping connections may exist between the same two databases — everything shared through any of them is mirrored, and the receiver's settings combine: mirrors are placed under all configured parents, get the most permissive visibility, and inherit rights if any `share_in` says so.

With the connection in place, share entities by granting the `share_out` entity **viewer rights** — the same dialog and mechanism as sharing with a person:

- **Rights inheritance works.** Granting viewer rights on a parent with `_inheritrights` children shares the whole subtree — one grant can publish an entire collection.
- **`_noaccess` works.** Individual children can be excluded from an inherited share.

Removing the right removes the mirror. `_viewer` is the natural right for a connection; any other right means the same thing, since a connection is never an actor — mirroring is strictly one-way regardless.

## What is transferred

Only the agreed properties cross — the offer filtered by the acceptance. Credentials (API keys, passkeys), rights, internal settings (billing limits) and file values never cross, regardless of configuration.

System properties are handled individually:

| Property | Crosses? | Notes |
|---|---|---|
| `_id` | yes | Same id as origin |
| `_type` | remapped | Resolved by name to the receiver's own type definition |
| `_parent` | conditional | Kept when the parent is also mirrored (subtrees keep their hierarchy); otherwise the `share_in` parent is used |
| `_created` | yes | Origin creation time |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess` | never | Rights never cross; mirror visibility comes from `share_in` |
| `_sharing`, `_inheritrights` | never | The receiver decides its own visibility |
| `_deleted` | never | Deletion at origin removes the mirror instead |

Because mirrors keep original ids, reference properties are copied as-is:

- If the referenced entity is also shared, the reference resolves in the receiving database.
- If not, it displays as plain text (the display name is stored alongside).
- If the referenced entity is shared *later*, the reference starts resolving immediately.

The mirror itself is an entity with three deliberate design choices. It has the **same `_id` as the original**, so share → unshare → share again always produces the same identity, and everything that pointed at the mirror reconnects automatically. It has **no property documents** — only the entity document is written, plus `_origin_db` (where it came from) and `_origin_hash` (change detection); property history stays at the origin. And it is **read-only by construction**: a mirror never has editor or owner rights, so the regular access checks reject every write and delete. Rights on mirrors govern visibility only — derived from the `share_in` settings and, with `inherit`, from the mirror's parents — and even a user who gains editor level through inheritance cannot edit one.

## What happens when entities change

A background worker periodically makes every receiving database match its sources — no lifecycle event needs special handling:

- **Edits at the origin** appear on mirrors within seconds; unchanged entities are never rewritten.
- **Granting or removing viewer rights** creates or removes mirrors, including whole subtrees via inheritance.
- **Amending a connection** — types, properties, parents, visibility — re-projects all its mirrors.
- **Deleting the origin entity** removes its mirror; **revoking a connection** (either half) removes all its mirrors.
- **Rights changes on a mirror's parents** update mirror visibility through the normal inheritance cascade.
- **Local entities referencing a mirror are never touched**: when a mirror is removed they go dormant, and reconnect if the entity is shared again under its unchanged `_id`.

## Security guarantees

- Consent is mutual and independently revocable, each side in its own database, with immediate effect.
- Mirroring is strictly one-way; no write access ever crosses a database boundary.
- Credentials (API keys, passkeys), rights, and internal settings (billing limits) can never be shared — enforced in the engine, not by configuration.
- Nothing crosses unless the source offered it *and* granted it *and* the receiver accepted it.
- Mirrors are never shared onward — sharing does not chain across databases.
- A database can never connect to itself.

## Example: a marketplace

A group of libraries and museums creates a shared `market` database. Each institution connects to it and grants the connection viewer rights on the items it wants to list — the mirrors become the catalogue, searchable like any Entu database. Visitors log in with their existing Entu identity and browse; comments and lending requests are the marketplace's own entities referencing the mirrors. A reverse connection can share each request back into the owning institution's database, so staff handle requests without leaving their own Entu.

## Limitations

- **Files and images** — file properties are not synced; mirrors carry no file values.
- **Per-mirror visibility** — all mirrors of a connection share one visibility; per-mirror overrides are not possible.
- **Type mapping** — the same type name must exist on both sides; there is no source-type to target-type mapping.

The design keeps each database fully in control of its own data while making cross-organisation collaboration possible.
