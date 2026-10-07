# Database Mutations

This page documents every MongoDB write operation performed by the server, grouped by database, collection and command. It covers all cases where data is inserted, updated or hard-deleted — including entity lifecycle (create, edit, duplicate, delete), property management, database creation, sign-in sessions, passkeys, sharing mirrors, usage statistics and Stripe billing updates.

The data model separates raw input from computed views: field values are written to the `property` collection as individual records and never overwritten — when a value changes, the old record is soft-deleted and a new one is inserted. The `entity` collection stores only the aggregated denormalized document (rebuilt after every mutation) and acts as the primary read target.

Most writes go through `setEntity()` in `utils/entity.js`, which inserts the property records and then re-aggregates the entity. It is called by:
- `POST /api/[db]/entity`
- `POST /api/[db]/entity/[_id]`
- `POST /api/[db]/entity/[_id]/duplicate` — once per requested copy
- `POST /api/[db]/passkey` — as the system user, on the caller's own person entity
- `POST /api/[db]/ai/execute` — operations `create_entity_type`, `add_property_definition`, `create_entity`, `update_entity`
- `POST /api/graphql/[db]` — `Create` and `Update` mutations
- `GET /api/[db]/billing` — when the database entity has no `billing_customer_id` yet
- `POST /api/stripe` — on `checkout.session.completed`
- `PUT /api/new` — every entity of a new database, via `initializeNewDatabase()` in `utils/setupDatabase.js`
- `GET /api/auth` — invite acceptance (`replaceInviteWithCredentials()` in `utils/auth.js`)
- `GET /api/auth`, `POST /api/auth/token` — automatic person creation on first sign-in when the database entity has `add_user` set (`createUserForAccount()` in `utils/auth.js`)
- `GET /api/auth`, `POST /api/auth/token`, `GET /api/auth/refresh` — legacy `entu_user` migration (`findUserAccounts()` in `utils/userAccounts.js`)

## Database: account (`[db]`)

### Collection: `entity`

#### insertOne({})
Called by: `setEntity()` when it creates an entity, via `createEntityRecord()` in `utils/entity.js`:
- `POST /api/[db]/entity`
- `POST /api/[db]/entity/[_id]/duplicate` — once per requested copy
- `POST /api/[db]/ai/execute` — `create_entity_type`, `add_property_definition`, `create_entity`
- `POST /api/graphql/[db]` — `Create` mutations
- `PUT /api/new` — once per template entity, plus the owner's person entity and the database entity
- `GET /api/auth`, `POST /api/auth/token` — the person entity created on first sign-in

Inserts a blank entity document that serves as an ID anchor. Its actual field values are stored as individual records in the `property` collection and later denormalized back onto the entity via aggregation.

#### replaceOne({ _id }, newEntity, { upsert: true })
Called by: `aggregateEntity()` in `utils/aggregate.js`:
- every `setEntity()` call
- `DELETE /api/[db]/property/[_id]` and the AI `delete_property` operation
- `GET /api/[db]/entity/[_id]/aggregate`
- the background aggregation worker (`plugins/aggregation.js`) for queued entities
- `PUT /api/new` — once more for every entity at the end of database setup
- `POST /api/auth/passkey` — each person whose passkey counter was updated

Recomputes the full denormalized `private`/`domain`/`public` views, access list, search index and hash from the raw properties and replaces the stored entity document. The new document carries no `queued` field, so this also takes the entity off the aggregation queue.

#### updateOne({ _id, _origin_db }, { $set: { access }, $unset: { queued } })
Called by: `aggregateEntity()` in `utils/aggregate.js`, when the entity is a sharing mirror

Mirrors have no property records, so only their access list is re-derived (from `_sharing` and, with `_inheritrights`, their parents' rights) and the mirror is taken off the queue. An empty access list is unset instead.

#### updateMany({ _id: { $in: ids } }, { $set: { queued: now } })
Called by: `addAggregateQueue()` in `utils/aggregate.js`:
- `aggregateEntity()` — when the entity changed: referrers (name change), children with `_inheritrights` (rights change), and parents, referrers and referenced entities whose type has formula properties
- `DELETE /api/[db]/entity/[_id]` and GraphQL `Delete` mutations — entities whose references to the deleted entity were removed

Marks related entities for re-aggregation by the background worker after a change propagates to them.

#### updateMany({ 'private._reference.reference': entityId }, { $set: { queued: now } })
Called by: `upsertMirror()` in `utils/sharing.js`, when an existing mirror's `name` changed

Queues local entities that reference the mirror, as they cache its name.

#### deleteOne({ _id: entityId })
Called by: `aggregateEntity()` in `utils/aggregate.js`

Permanently removes the entity document when aggregation detects a live `_deleted` property on it — written by `DELETE /api/[db]/entity/[_id]` and GraphQL `Delete` mutations.

#### replaceOne({ _id, _origin_db }, mirror, { upsert: true })
Called by: `upsertMirror()` in `utils/sharing.js`, from the background sharing worker (`plugins/sharing.js`)

Writes a sharing mirror — the agreed properties of the source entity plus `_origin_db`, `_origin_hash`, access list and search index — only when its `_origin_hash` changed. Filtering on `_origin_db` means a local entity with the same `_id` is never overwritten; the upsert fails with a duplicate key error instead.

#### deleteMany({ _origin_db: { $exists: true }, $nor: [{ _origin_db, 'private._type.string' }, …] })
Called by: `syncMirrors()` in `utils/sharing.js`, from the background sharing worker

Hard-deletes mirrors no longer covered by any connection and type pair — the connection or the type was dropped.

#### deleteMany({ _id: { $in: removeIds }, _origin_db })
Called by: `syncShare()` in `utils/sharing.js`, from the background sharing worker

Hard-deletes mirrors whose source entity is no longer granted to the connection — the right was removed or the origin entity was deleted.

#### createIndexes([…])
Called by: `PUT /api/new`, via `createDatabaseIndexes()` in `utils/setupDatabase.js`

Creates the entity indexes of a new database.

### Collection: `property`

#### insertOne(property)
Called by:
- `setEntity()`, via `insertProperties()` in `utils/entity.js` — one per submitted property, for every caller listed at the top. On create it also inserts `_created` (and `_owner` when a user creates the entity), default `_parent` values from the entity type, `_sharing` and `_inheritrights` inherited from the parents, and property defaults. `entu_user` invites are stored with a signed `invite` token, `entu_api_key` values as a SHA-256 hash. Notable records:
  - `POST /api/[db]/passkey` — `{ type: 'entu_passkey', passkey_id, passkey_public, passkey_counter, passkey_device }`, with `passkey_id` taken from the verified registration, never the request body
  - `PUT /api/new`, invite acceptance and automatic person creation — `entu_user` (`uid`, `provider`, `email`) for OAuth.ee users, `entu_passkey` (`passkey_id`, `passkey_public`, `passkey_counter: 0`, `passkey_device`) for passkey users
  - `GET /api/[db]/billing`, `POST /api/stripe` — `billing_customer_id` on the database entity
- `DELETE /api/[db]/entity/[_id]` and GraphQL `Delete` mutations — `{ entity: entityId, type: '_deleted', reference: user, datetime: now, created: { at: now, by: user } }`

Appends a new property record to an entity. Existing values are never overwritten — old ones are soft-deleted instead.

#### updateMany({ _id: { $in: oldPIds }, entity, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Called by: `setEntity()`, via `markPropertiesDeleted()` in `utils/entity.js`, when submitted properties carry the `_id` of the value they replace:
- `POST /api/[db]/entity/[_id]`
- `POST /api/[db]/ai/execute` — `update_entity` with a `valueId`
- `POST /api/graphql/[db]` — `Update` mutations
- `GET /api/auth` — invite acceptance replaces the pending `entu_user` invite with the real credential
- `GET /api/auth`, `POST /api/auth/token`, `GET /api/auth/refresh` — legacy migration replaces an email-only `entu_user` with one carrying `uid` and `provider`

Soft-deletes the superseded property records when values are replaced, preserving the full history.

#### updateMany({ entity, type: { $in: userRights }, reference: { $in: users }, _id: { $nin: newIds }, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Called by: `setEntity()`, via `markReplacedUserRightsDeleted()` in `utils/entity.js`, whenever it sets `_noaccess`, `_viewer`, `_expander`, `_editor` or `_owner` for a user

Soft-deletes that user's other live right properties on the entity, so each user holds only one right per entity.

#### updateMany({ _id: { $in: extraOldIds }, entity, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Called by: `POST /api/graphql/[db]` — `Update` mutations

Soft-deletes stored values beyond the number of values in the input, so a shorter list replaces a longer one.

#### updateOne({ _id: propertyId, entity }, { $set: { deleted: { at, by } } })
Called by:
- `DELETE /api/[db]/property/[_id]`
- `POST /api/[db]/ai/execute` — `delete_property`

Soft-deletes a single specific property value. The record stays in the DB for audit purposes.

#### updateMany({ reference: entityId, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Called by: `DELETE /api/[db]/entity/[_id]`, GraphQL `Delete` mutations

Soft-deletes all properties across all entities referencing the deleted entity, preventing stale references.

#### updateOne({ _id: propertyId }, { $set: { passkey_counter } })
Called by: `POST /api/auth/passkey`, via `passkeyVerify()` in `utils/passkey.js`

Updates the WebAuthn signature counter of the `entu_passkey` value in every database where the passkey verified — to the authenticator's new counter, or the stored one plus one — and re-aggregates that person entity. The counter is updated in place, not soft-deleted and re-inserted.

#### createIndexes([…])
Called by: `PUT /api/new`, via `createDatabaseIndexes()` in `utils/setupDatabase.js`

Creates the property indexes of a new database.

### Collection: `stats`

#### bulkWrite([updateOne({ date, function: 'ALL' }, { $inc: { count: 1 } }, { upsert: true }) × 3])
Called by: `plugins/stats.js`, after every response to a request with an account database that has an `entity` collection

Counts API requests per day (`YYYY-MM-DD`), month (`YYYY-MM`) and year (`YYYY`).

#### bulkWrite([updateOne({ date, function: 'AI' }, { $inc: { count, promptTokens, completionTokens, cacheCreatedTokens, cacheReadTokens } }, { upsert: true }) × 3])
Called by: `POST /api/[db]/ai/chat`, via `recordUsage()` in `utils/ai/llm.js`, after every AI completion

Accumulates AI requests and token usage per day, month and year. The monthly record is what the AI token limit is checked against.

#### createIndex({ date: 1, function: 1 }, { unique: true })
Called by: `PUT /api/new`, via `createDatabaseIndexes()` in `utils/setupDatabase.js`

## Database: `entu`

### Collection: `session`

#### insertOne({ created, pending?, user: { ip, … } })
Called by: `oauthCreateSession()` in `utils/oauth.js`:
- `GET /api/auth/callback` — after an OAuth.ee login, with the user's `provider`, `id`, `name` and `email`
- `POST /api/auth/passkey` — after a verified passkey assertion, with `provider: 'passkey'`, the credential `id`, `publicKey`, `device` and `name`. A browser login (the request carries `state`) creates it with `pending: true`; a native sign-in creates it ready to use and exchanges it at once.

Stores a login session. Sessions are never hard-deleted by the server.

#### findOneAndUpdate({ _id, pending: true, deleted: { $exists: false } }, { $unset: { pending } })
Called by: `GET /api/auth/callback` for passkey logins, via `claimPasskeySession()` in `utils/oauth.js`

Claims the pending session named by the passkey code. The atomic update makes the code single-use.

#### findOneAndUpdate({ _id, pending: { $exists: false }, deleted: { $exists: false } }, { $set: { deleted: now } })
Called by: `consumeSession()` in `utils/auth.js`, from `authExchange()`:
- `GET /api/auth` — exchanging a session token
- `POST /api/auth/token` — exchanging an OAuth authorization code
- `POST /api/auth/passkey` — native sign-in

Marks the session as used, so a replay finds nothing.

### Collection: `reservation`

#### insertOne({ _id: databaseName, created })
Called by: `PUT /api/new`

Reserves the new database name by its unique `_id`, so two concurrent requests cannot create the same database.

#### deleteOne({ _id: databaseName })
Called by: `PUT /api/new`

Releases the reservation once database creation has finished or failed.
