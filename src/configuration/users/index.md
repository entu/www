---
description: "Manage users in Entu with person entities — each authenticates and is referenced for rights assignment and ownership across the system."
---

# Users

Person entities represent user accounts in Entu. Each person can authenticate and is referenced throughout the system for rights assignment and ownership tracking.

## Adding Users

1. Create a new entity of type **Person**
2. Enter the person's email address in the `email` field
3. Click **Send Invite** on the `entu_user` field — the invitation is emailed to that address with a link valid for 24 hours
4. The person opens the link and signs in with any option — a passkey (one they already have or a new one), Apple, Google, e-mail, Smart-ID, Mobile-ID or ID-card. The sign-in is linked to the person entity: an `entu_passkey` credential for a passkey, an `entu_user` credential for the others

Sending or cancelling an invite needs `_owner` rights on the person entity — or, on your own person entity, `_editor` rights. A pending invite shows as *Invite sent to …* with a **Cancel Invite** button.

Each invite can be accepted once. An expired invite — or a used or cancelled one opened with a sign-in not yet linked to the person — fails with *This invitation is invalid, has expired or has already been used*; send a new invite instead. If the sign-in already belongs to another person in the database, the invite is not accepted and the person is asked to use a different login method.

To add another sign-in method to your own person entity, click **Add Login Method** on its `entu_user` field and sign in with the new option — including a new passkey. It works like an invite to yourself.

### User Rights

By default, a newly created person entity has no specific rights. They can only access entities shared at the `domain` or `public` level or rights inherited from a parent entity. To grant additional access, reference the person in the appropriate rights property on the relevant entities.

See [Entities → Access Rights](/overview/entities/#access-rights) for the full rights table and sharing options.

## Automatic User Creation

If you want to allow access to everyone who signs in, Entu can automatically create a person entity for them on first login — no manual setup required. A passkey sign-in creates the person with an `entu_passkey` credential, every other sign-in option with an `entu_user` credential. The person's `email` and `name` are filled in when the sign-in provides them.

::: warning
Auto-created users are regular users. They will have access to all entities and properties that use `domain` sharing. Make sure your sharing settings are intentional before enabling this.
:::

### Access Control

The new person entity is created under the `add_user` target with `_inheritrights: true`, so whoever has rights on that parent gets the same rights on the new person. The person also becomes `_editor` of its own entity.

What a new user can open is decided the same way as for any user: by `domain` sharing and by rights properties that reference their person entity.

See [Entities → Access Rights](/overview/entities/#access-rights) for more.

### Requirements

All of the following must be true for auto-creation to trigger:

1. The `database` entity has an `add_user` property referencing the parent entity where new person entities will be created (e.g. a "Users" folder)
2. A person entity type definition exists in the database (`_type: entity`, `name: person`)
3. The authentication request includes the `db` query parameter
4. No person entity in the database is linked to this sign-in yet — no matching `entu_user` (same provider account, or an email-only entry with the same email) and no matching `entu_passkey`
5. The sign-in is not accepting an invite

After creation, the new person entity is automatically set as its own `_editor` — so users can update their own profile properties right away.
