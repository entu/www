# Database Mutations

This page documents every MongoDB write operation performed by the server, grouped by collection and command. It covers all cases where data is inserted, updated or hard-deleted — including entity lifecycle (create, edit, duplicate, delete), property management, account bootstrapping, passkey registration and Stripe billing updates.

The data model separates raw input from computed views: field values are written to the `property` collection as individual records and never overwritten — when a value changes, the old record is soft-deleted and a new one is inserted. The `entity` collection stores only the aggregated denormalized document (rebuilt after every mutation) and acts as the primary read target.

## Collection: `entity`

### insertOne({})
Called by:
- `POST /api/[db]/entity` — creates a new entity
- `POST /api/[db]/entity/[_id]/duplicate` — once per requested copy
- `PUT /api/[db]` — once per seed entity during account bootstrap

Inserts a blank entity document that serves as an ID anchor. Its actual field values are stored as individual records in the `property` collection and later denormalized back onto the entity via aggregation.

### replaceOne({ _id }, newEntity, { upsert: true })
Called by: every mutation, via `aggregateEntity()` in `server/utils/aggregate.js`

Recomputes the full denormalized `public`/`private` views from raw properties and replaces the stored entity document.

### updateMany({ _id: { $in: ids } }, { $set: { queued: now } })
Called by: any deletion or reference change, via `addAggregateQueue()` in `server/utils/aggregate.js`

Marks related entities for re-aggregation by the background worker after a change propagates to them.

### deleteOne({ _id: entityId })
Called by: `aggregateEntity()` in `server/utils/aggregate.js`

Permanently removes the entity document when aggregation detects a `_deleted` property on it.

## Collection: `property`

### insertOne(property)
Called by:
- `DELETE /api/[db]/entity/[_id]` — inserts `{ entity: entityId, type: '_deleted', reference: user, datetime: now, created: { at: now, by: user } }`
- `POST /api/[db]/entity` — one per submitted property + auto `_owner` and `_created`
- `POST /api/[db]/entity/[_id]` — one per submitted property
- `POST /api/[db]/entity/[_id]/duplicate` — one per copied property per duplicate
- `POST /api/[db]/passkey` — inserts `{ type: 'entu_passkey', passkey_id, passkey_public_key, passkey_counter }`
- `POST /api/stripe` — one per billing property updated from the Stripe webhook

Appends a new property record to an entity. Existing values are never overwritten — old ones are soft-deleted instead.

### insertMany(properties)
Called by: `PUT /api/[db]`

Bulk-inserts all property records for each seed entity during account bootstrap.

### updateMany({ _id: { $in: oldPIds } }, { $set: { deleted: { at, by } } })
Called by: any `setEntity()` call that replaces existing values, via `markPropertiesDeleted()` in `server/utils/entity.js`:
- `POST /api/[db]/entity/[_id]`
- `POST /api/[db]/entity/[_id]/duplicate`
- `POST /api/[db]/passkey`
- `POST /api/stripe`
- `PUT /api/[db]`

Soft-deletes the superseded property records when values are replaced, preserving the full history.

### updateOne({ _id: propertyId }, { $set: { deleted: { at, by } } })
Called by: `DELETE /api/[db]/property/[_id]`

Soft-deletes a single specific property value. The record stays in the DB for audit purposes.

### updateMany({ reference: entityId }, { $set: { deleted: { at, by } } })
Called by: `DELETE /api/[db]/entity/[_id]`

Soft-deletes all properties across all entities referencing the deleted entity, preventing stale references.

### updateMany({ entity, type: 'entu_passkey', passkey_id }, { $set: { passkey_counter } })
Called by: `POST /api/auth/passkey`

Increments the WebAuthn signature counter after a successful passkey authentication to detect cloned authenticators.

### updateMany({ reference: oldOid }, { $set: { reference: newId } })
Called by: `PUT /api/[db]`

After bulk import, rewrites all reference values from legacy OIDs to the new MongoDB ObjectIds assigned at import time.

### deleteMany({ reference: { $nin: allEntityIds } })
Called by: `PUT /api/[db]`

Hard-deletes property records whose reference target no longer exists, keeping data consistent after DB creation or import.
