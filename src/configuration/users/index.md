---
description: "Manage users in Entu with person entities — each authenticates and is referenced for rights assignment and ownership across the system."
---

# Users

Person entities represent user accounts in Entu. Each person can authenticate and is referenced throughout the system for rights assignment and ownership tracking.

## Adding Users

1. Create a new entity of type **Person**
2. Enter the person's email address in the `email` field
3. Click **Send Invite** on the `entu_user` field — the invitation is emailed to that address with a link valid for 24 hours
4. The person opens the link and signs in with any option — passkey, Apple, Google, e-mail, Smart-ID, Mobile-ID or ID-card. The sign-in is linked to the person entity: an `entu_passkey` credential for a passkey, an `entu_user` credential for the others

### User Rights

By default, a newly created person entity has no specific rights. They can only access entities shared at the `domain` level or rights inherited from a parent entity. To grant additional access, reference the person in the appropriate rights property on the relevant entities.

See [Entities → Access Rights](/overview/entities/#access-rights) for the full rights table and sharing options.

## Automatic User Creation

If you want to allow access to everyone who signs in, Entu can automatically create a person entity for them on first login — no manual setup required. This works with every sign-in option: a passkey sign-in creates the person with an `entu_passkey` credential, any other option with an `entu_user` credential. The person's `email` and `name` are filled in when the sign-in provides them.

::: warning
Auto-created users are regular users. They will have access to all entities and properties that use `domain` sharing. Make sure your sharing settings are intentional before enabling this.
:::

### Access Control

Because the new person entity has `_inheritrights: true` and is parented under the `add_user` target, it automatically inherits whatever rights are set on that parent. Grant rights to the parent container once — all auto-created users inherit them.

To restrict a specific user after auto-creation, add `_noaccess` directly on their person entity. Explicit rights on the child always override inherited ones.

See [Entities → Access Rights](/overview/entities/#access-rights) for more.

### Requirements

All of the following must be true for auto-creation to trigger:

1. The `database` entity has an `add_user` property referencing the parent entity where new person entities will be created (e.g. a "Users" folder)
2. A person entity type definition exists in the database (`_type: entity`, `name: person`)
3. The authentication request includes the `db` query parameter
4. No person entity in the database is linked to this sign-in yet — no matching `entu_user` (same provider account, or a legacy entry with the same email) and no matching `entu_passkey`
5. The sign-in is not accepting an invite

After creation, the new person entity is automatically set as its own `_editor` — so users can update their own profile properties right away.
