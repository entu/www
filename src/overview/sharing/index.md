---
description: "Read-only mirroring of entities between Entu databases, configured with share_out and share_in entities."
---

# Entity Sharing Between Databases

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

The `type` and `property` lists reference the database's **own definition entities**. The offer is precise — a property named `year` under *book* is a different definition than one under *artwork*, and only the listed pairs are offered. Acceptance is by name: an accepted property applies to every accepted type that offers it. What syncs is the offer filtered by the acceptance: the source decides what can leave, the receiver decides what it takes in, where mirrors land, and who sees them.

Several overlapping connections may exist between the same two databases — everything shared through *any* of them is mirrored. A shared entity's properties are the union of what the connections offer for its type; the receiver's settings combine likewise: mirrors are placed under all configured parents, get the most permissive visibility, and inherit rights if any `share_in` says so.

## Connecting with an invite link

::: info Planned
The invite link flow is not implemented yet — today both connection entities are created by hand.
:::

Nobody has to copy configuration by hand. The sharing database mints a **signed link** from its `share_out`; the link carries the offer — the source database name and the offered type and property names. The receiver opens it, signs in, chooses which of their databases will receive, selects what to accept and where mirrors go, and confirms. Their `share_in` is created in their own database with exactly those choices — no entity is ever created in a foreign database.

Links are low-risk by construction: they expire, a stale offer can at most list things the source no longer sends (which then sync nothing), and a leaked link is useless to others because the `share_out` names its intended target database. Changing the agreement later needs no new link — each side edits its own half at any time and mirrors re-project. A new link is only useful for showing the receiver an expanded offer.

## Sharing entities

Grant the connection `_viewer` rights on the entity — the same drawer, the same mechanism as sharing with a person. Two familiar rules follow automatically:

- **Rights inheritance works.** Granting viewer rights on a parent with `_inheritrights` children shares the whole subtree — one grant can publish an entire collection.
- **`_noaccess` works.** Individual children can be excluded from an inherited share.

`_viewer` is the natural right for a connection; any other right means the same thing, since a connection is never an actor — it holds no credentials and never edits anything. Mirroring stays strictly one-way regardless.

## Mirrors

A mirror is an entity in the receiving database with three deliberate design choices:

**Same `_id` as the original.** Ids are globally unique, so the mirror reuses the original's. Share → unshare → share again always produces the same identity, and everything that pointed at the mirror reconnects automatically.

**Only the entity document is copied — no property documents.** The mirror carries the projected values plus `_origin_db` (where it came from) and `_origin_hash` (change detection). Property history stays at the origin. And because a mirror never has editor or owner rights, the regular access checks reject every write and delete — no special rule needed.

**Read-only content, local context.** Nothing can be added to a mirror itself — but ordinary local entities can **reference** it: comments, requests, annotations live as the receiving database's own entities pointing at the mirror, appear on its page among referrers, and never sync anywhere.

Rights on mirrors govern **visibility only**, derived from the `share_in` settings: the `sharing` level, plus rights inherited from the mirror's parents when `inherit` is set. The receiver manages who sees mirrors the way it manages any container — by setting rights on the parent. But no part of a mirror can be changed in the receiving database, placement included; even a user who gains editor or owner level through inheritance cannot edit one — the origin guard outranks rights.

### Which system properties cross?

| Property | Crosses? | Notes |
|---|---|---|
| `_id` | yes | Same id as origin |
| `_type` | remapped | Resolved by name to the target's own type definition |
| `_parent` | conditional | Kept when the parent is also mirrored (subtrees keep their hierarchy); otherwise the `share_in` parent is used |
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

A background worker periodically sweeps all databases. For each active connection it compares the source's shared entities — everything granted to the connection, filtered by the agreement — against the existing mirrors, and writes only the differences:

1. **Collect** — entities with the connection in their access list, of accepted types.
2. **Project** — keep only the agreed properties. Credentials and rights properties never cross, regardless of configuration.
3. **Write** — insert or update changed mirrors; a change-detection hash leaves unchanged entities untouched.
4. **Remove** — mirrors whose source is no longer shared, and all mirrors of pairs that are no longer active.

Because every sweep simply makes the target match the source, no lifecycle event needs special handling: granting rights, amending the agreement, unsharing, deleting the origin, or revoking the connection all take effect on the next sweep. Local entities referencing a mirror are never touched: they go dormant, and reconnect if the entity is shared again under its unchanged `_id`.

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
