---
description: "What Entu computes when you write, what is ready immediately and what follows a moment later — the timing your application needs to plan around."
---

# Data Flow

Entu stores what you write, then computes a good deal more from it: the public and domain views of an entity, its formula values, its access list, its search index and the rights it inherits. Most of that is ready by the time your write returns. Some of it is not.

Knowing which is which is the difference between an application that reads back what it just computed and one that occasionally shows yesterday's total.

## What happens when you write

A write — `POST /api/{db}/entity` or `POST /api/{db}/entity/{_id}` — does two things.

**First, it recomputes the entity you wrote, before responding.** Its property values are stored, then the entity is re-derived from them: formula properties are evaluated, rights are combined with any inherited from its parents, the access list is rebuilt, the search index is updated, and the public and domain views are assembled from the properties whose definitions are shared.

So the entity you just wrote is fully current in the response, and in any read that follows.

**Second, it queues everything that depends on that entity.** Those are recomputed in the background, not before responding.

## What is queued

Entu queues an entity when your write could have changed what that entity computes:

| You changed | Entu queues |
|---|---|
| The entity's name | every entity referencing it — references cache the name |
| Rights (`_viewer`, `_editor`, `_owner`, `_expander`, `_noaccess`) | its children that have `_inheritrights` |
| Anything a formula reads | parents with `_child.*` formulas, referrers with `reference.*` formulas, and referenced entities with `_referrer.*` formulas |

Only entities that actually hold formula properties are queued for the third case, and nothing is queued at all if the write left the entity unchanged.

The queue is drained continuously, in batches, oldest first. In practice dependent values catch up within seconds.

::: warning
Cascades take more than one pass. A rights change propagates one level of the hierarchy per round, so a deep tree finishes over several. The same is true of formulas whose inputs are themselves formulas.
:::

## What this means for your application

**Read back the entity you wrote, not what derives from it.** Creating an invoice row and immediately reading the invoice will usually give you the old total. Either compute the figure you need in your own code, or read it after the background pass.

**Don't poll for a formula value in a tight loop.** If you truly need one immediately, `GET /api/{db}/entity/{_id}/aggregate` recomputes that entity on the spot and returns when it is done. It is the right tool after an external change, and the wrong one to call routinely — regular reads are already served from computed data, which is what makes them fast.

**Expect a renamed entity to keep its old name in references briefly.** Reference values carry the referenced entity's name so lists can be rendered without extra lookups. After a rename, referrers are re-derived in the background.

**Rights changes are not instant everywhere.** The entity you changed enforces them immediately, because the access list is rebuilt inline. Children that inherit those rights follow in the background — so a permission you just removed can still be in effect on descendants for a short window. Where that matters, change rights at the point in the hierarchy the user actually reads from, or wait for propagation before telling them it is done.

## What is never deferred

Access control on reads is always live. Every request resolves what the caller may see from the entity's stored access list at query time — nothing is cached per user, and a stale computation never widens what someone can read. The delay described above is in *recomputing* rights for descendants, never in *applying* them.

Writes are equally immediate: nothing you send is queued for later storage. The queue holds recomputation, not your data.
