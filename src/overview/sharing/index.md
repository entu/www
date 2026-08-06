---
description: "A planned feature for sharing entities between Entu databases, published to gather design feedback before implementation."
---

# Entity Sharing Between Databases

::: warning Concept proposal
This page describes a planned feature. Nothing on this page is implemented yet — it is published to collect feedback on the design.
:::

Every Entu account has its own isolated database. That isolation is a core guarantee — but some organisations want to make selected entities visible to each other. Libraries want a shared catalogue of books. Museums want a common view of their collections. A group of organisations may want a "marketplace" where items can be browsed, commented on, and requested for lending or exchange.

Entity sharing makes this possible without weakening isolation: an entity in one database can be **mirrored** into another database, kept in sync automatically, while the original never leaves its home.

## The idea in one paragraph

Two databases establish a **connection** — each side creates a connection entity in its own database, so sharing always requires mutual consent. After that, sharing an entity is nothing new to learn: the owner grants the connection **viewer rights**, exactly as they would for a person. The sync engine notices the grant and creates a **mirror** — a read-only copy of the whitelisted properties — in the target database. Removing the viewer right removes the mirror.

## The connection pair

A connection consists of two ordinary entities, one in each database. Data flows only while **both** exist.

**`share_out`** — created in the source database: *"I am willing to send."*

| Property | Meaning |
|---|---|
| `name` | Display name shown in the rights dialog, e.g. "Marketplace" |
| `database` | Target database name |
| `type` | Which of my entity types may be shared |
| `property` | Whitelist: which property definitions may travel |

**`share_in`** — created in the target database: *"I accept from."*

| Property | Meaning |
|---|---|
| `name` | Display name, e.g. "Tartu Library" |
| `database` | Source database name |
| `type` | Which entity types I accept |
| `parent` | Local entity under which incoming mirrors are placed |
| `sharing` | Default visibility (`private` / `domain` / `public`) applied to mirrors |

The source controls **what leaves** (whitelist plus per-entity grants). The target controls **where it lands and who sees it** (parent, default visibility). Neither side controls the other's half, and either side can revoke by deleting its own connection entity.

## Setting up a connection from a link

The connection pair does not have to be created by hand. The receiving database — say, the marketplace — composes the agreement in the UI (types, property whitelist, mirror parent, visibility) and mints a **signed invite link**. The link's token carries the entire agreement; minting it stores nothing, and ignoring it does nothing. It is a proposal, not an object.

Accepting it:

1. Open the link and sign in with your existing Entu identity.
2. Choose which of your databases joins.
3. Choose what to accept. The proposal is shown as a selection — entity types with their properties, resolved against your own definitions. Untick anything you do not want to share; types you don't have are shown as not applicable.
4. Confirm — both connection entities are created automatically, and the `share_out` contains exactly your selection: the accepted subset, not the proposal, is what can ever leave your database. Optionally grant the new connection viewer rights on a collection right away.

Because what syncs is always the **intersection** of both connection halves, different participants can accept different subsets of the same link — the proposer's side needs no per-participant configuration.

The same link can be sent to any number of participants. **Amending the agreement** is simply a new link: because each database pair has one connection, accepting a newer link updates the existing connection entities. The selection screen opens pre-filled with your current agreement, with newly proposed items marked as new and unticked — an amendment can never silently widen what you send. Existing viewer grants remain valid — nothing needs to be re-shared — and the sync engine re-projects all mirrors to the new agreement. Each connection remembers the issue time of the agreement it was created from, so an old link cannot downgrade a newer agreement. Outstanding links expire on their own and become invalid if the issuing administrator loses their rights.

## Sharing an entity

Grant the connection `_viewer` rights on the entity — the same drawer, the same mechanism as sharing with a person. Two familiar rules follow automatically:

- **Rights inheritance works.** Granting the connection viewer rights on a parent with `_inheritrights` children shares the whole subtree. One grant can publish an entire collection.
- **`_noaccess` works.** Individual children can be excluded from an inherited share.

Only `_viewer` is meaningful for a connection. Granting a connection `_editor`, `_expander`, or `_owner` is rejected — mirroring is strictly one-way.

## How the sync works

The engine runs inside the existing background aggregation worker. Every property change already queues an entity for re-aggregation; sharing simply adds a final step:

1. **Detect** — after aggregation, is a `share_out` connection in the entity's access list?
2. **Validate** — is the connection pair active, and is the entity's type allowed by both sides?
3. **Project** — keep only whitelisted properties. Credentials and rights properties never cross, regardless of configuration.
4. **Write the mirror** — insert or update the mirror document in the target database, skipping the write when nothing changed (hash comparison).
5. **Retract** — if the check fails but a mirror exists (right removed, entity deleted, whitelist narrowed, connection revoked), the mirror is removed.

When a connection pair *becomes* active, a one-time backfill sweep queues every entity already granted to it. When a pair becomes inactive, all its mirrors are removed the same way.

## Mirror entities

A mirror is an entity in the target database with three deliberate design choices:

**Same `_id` as the original.** Object ids are globally unique, so the mirror reuses the original's id. This makes sharing idempotent: share → unshare → share again always produces the same identity, and everything that pointed at the mirror reconnects automatically.

**Only the entity document is copied — no property documents.** The mirror carries the projected values, plus `_origin_db` (where it came from) and `_origin_hash` (change detection). History stays at the origin, where it belongs. Consequently mirrors are skipped by the target's own aggregation, and direct property writes to a mirror are rejected with a pointer to the origin.

**Read-only content, local context.** The mirrored content cannot be edited in the target — but the target database can attach its own **child entities** to a mirror: comments, requests, annotations. These are ordinary local entities and never sync anywhere.

### Which system properties cross?

| Property | Crosses? | Notes |
|---|---|---|
| `_id` | yes | Same id as origin |
| `_type` | remapped | Resolved by name to the target's own type definition |
| `_parent` | conditional | Kept if the parent is also mirrored (subtrees reproduce their hierarchy); otherwise the `share_in` parent is used |
| `_created` | yes | Origin creation time is honest metadata |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess` | never | Rights never cross; mirror visibility comes from `share_in` |
| `_sharing`, `_inheritrights` | never | Target decides its own visibility |
| `_deleted` | never | Deletion at origin removes the mirror instead |

## References

Because mirrors keep original ids, reference properties are copied **as-is** — no remapping tables:

- If the referenced entity is also shared, the reference resolves in the target.
- If not, it displays as plain text (the reference's display name is stored alongside it).
- If the referenced entity is shared *later*, the reference starts resolving immediately — retroactively, with no rewrites.

## Unsharing, deletion, resharing

Removing the viewer right, deleting the origin entity, or revoking the connection all converge on the same outcome: the mirror document is removed. Local child entities (comments, requests) are **not** touched — they go dormant. If the entity is shared again, the mirror reappears under the same `_id` and everything reconnects.

## Security guarantees

- Consent is mutual and independently revocable, in each side's own database, with immediate effect.
- Mirroring is strictly one-way; no write access ever crosses a database boundary.
- Credentials (API keys, passkeys) and rights properties can never be shared — enforced in the engine, not by configuration.
- The whitelist is explicit: nothing crosses unless the source listed it *and* granted it *and* the target accepted the type.

## Example: a marketplace

A group of libraries and museums creates a shared `market` database. Each institution connects to it and grants the connection viewer rights on the items it wants to list — mirrors become the catalogue, searchable like any Entu database. Visitors log in with their existing Entu identity and browse the catalogue; comments and lending requests are local child entities of the mirrors. A reverse connection can share each request back into the owning institution's own database, so staff handle requests without leaving their own Entu.

## Open questions

- **Files and images** — file properties reference storage objects in the source account; mirrors need either a proxy that re-checks access at the origin per request, or thumbnail copies made at sync time.
- **Per-mirror visibility overrides** — v1 applies one default visibility to all mirrors of a connection; per-mirror overrides would require merging local rights over the synced document.
- **Type mapping** — v1 requires the same type name on both sides; explicit source-type → target-type mapping could come later.

Feedback is welcome — this design aims to make cross-organisation collaboration possible while keeping each database fully in control of its own data.
