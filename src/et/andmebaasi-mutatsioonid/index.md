# Andmebaasi mutatsioonid

See leht dokumenteerib kõik serveri poolt tehtavad MongoDB kirjutusoperatsioonid, grupeerituna andmebaasi, kollektsiooni ja käsu järgi. Hõlmab kõiki juhtumeid, kus andmeid lisatakse, uuendatakse või kõvakustutatakse — sealhulgas objekti elutsükkel (loomine, muutmine, dubleerimine, kustutamine), parameetrite haldus, andmebaasi loomine, sisselogimise sessioonid, pääsuvõtmed, jagamise peegelobjektid, kasutusstatistika ja Stripe arvelduse uuendused.

Andmemudel eraldab töötlemata sisendi arvutatud vaatest: väljaväärtused kirjutatakse `property` kollektsiooni üksikkirjetena ja neid ei kirjutata kunagi üle — kui väärtus muutub, tehakse vana kirje pehmelt kustutatuks ja sisestatakse uus. `entity` kollektsioon salvestab ainult agregeeritud denormaliseeritud dokumendi (taastatakse pärast iga mutatsiooni) ja toimib peamise lugemisallikana.

Enamik kirjutusi käib läbi `setEntity()` funktsiooni failis `utils/entity.js`, mis sisestab parameetrikirjed ja agregeerib seejärel objekti uuesti. Seda kutsuvad:
- `POST /api/[db]/entity`
- `POST /api/[db]/entity/[_id]`
- `POST /api/[db]/entity/[_id]/duplicate` — korra iga nõutud koopia kohta
- `POST /api/[db]/ai/execute` — operatsioonid `create_entity_type`, `add_property_definition`, `create_entity`, `update_entity`
- `POST /api/graphql/[db]` — `Create` ja `Update` mutatsioonid
- `GET /api/[db]/billing` — kui andmebaasi objektil veel `billing_customer_id` puudub
- `POST /api/stripe` — sündmuse `checkout.session.completed` korral, kui sellel on `client_reference_id`
- `PUT /api/new` — uue andmebaasi iga objekt, `initializeNewDatabase()` kaudu failis `utils/setupDatabase.js`
- `GET /api/auth`, `POST /api/auth/passkey`, `POST /api/auth/passkey/register` — kutse vastuvõtmine (`inviteAccept()` failis `utils/invite.js`)
- `GET /api/auth`, `POST /api/auth/token`, `POST /api/auth/passkey`, `POST /api/auth/passkey/register` — isikuobjekti automaatne loomine esmakordsel sisselogimisel, kui andmebaasi objektil on `add_user` määratud (`createUserForAccount()` failis `utils/auth.js`)
- `GET /api/auth`, `POST /api/auth/token`, `GET /api/auth/refresh` — ainult e-postiga `entu_user` väärtuse täiendamine `uid` ja `provider` väärtustega (`findUserAccounts()` failis `utils/userAccounts.js`)

## Andmebaas: konto (`[db]`)

### Kollektsioon: `entity`

#### insertOne({})
Kutsutakse: `setEntity()` poolt objekti loomisel, `createEntityRecord()` kaudu failis `utils/entity.js`:
- `POST /api/[db]/entity`
- `POST /api/[db]/entity/[_id]/duplicate` — korra iga nõutud koopia kohta
- `POST /api/[db]/ai/execute` — `create_entity_type`, `add_property_definition`, `create_entity`
- `POST /api/graphql/[db]` — `Create` mutatsioonid
- `PUT /api/new` — korra iga malliobjekti kohta, millel on mitte-viiteparameetreid, lisaks omaniku isikuobjekt ja andmebaasi objekt
- `GET /api/auth`, `POST /api/auth/token`, `POST /api/auth/passkey`, `POST /api/auth/passkey/register` — esmakordsel sisselogimisel loodav isikuobjekt

Sisestab tühja objektidokumendi, mis toimib ID ankruna. Tegelikud väljaväärtused salvestatakse üksikkirjetena `property` kollektsiooni ja denormaliseeritakse hiljem objektile tagasi agregatsiooni kaudu.

#### replaceOne({ _id }, newEntity, { upsert: true })
Kutsutakse: `aggregateEntity()` poolt failis `utils/aggregate.js`:
- iga `setEntity()` kutse
- `DELETE /api/[db]/property/[_id]` ja AI operatsioon `delete_property`
- `GET /api/[db]/entity/[_id]/aggregate`
- taustal töötav agregeerija (`plugins/aggregation.js`) järjekorras olevatele objektidele
- `PUT /api/new` — andmebaasi seadistamise lõpus veel korra iga objekti jaoks
- `POST /api/auth/passkey` — iga isikuobjekt, mille pääsuvõtme loendurit uuendati

Arvutab toorparameetritest uuesti täieliku denormaliseeritud `private`/`domain`/`public` vaate, ligipääsuloendi, otsinguindeksi ja räsi ning asendab salvestatud objektidokumendi. Uuel dokumendil puudub `queued` väli, nii et see eemaldab objekti ühtlasi agregeerimise järjekorrast.

#### updateOne({ _id, _origin_db }, { $set: { access }, $unset: { queued } })
Kutsutakse: `aggregateEntity()` poolt failis `utils/aggregate.js`, kui objekt on jagamise peegelobjekt

Peegelobjektidel pole parameetrikirjeid, seega tuletatakse uuesti ainult nende ligipääsuloend (`_sharing` põhjal ja `_inheritrights` korral ülemobjektide õigustest) ning peegelobjekt eemaldatakse järjekorrast. Tühja ligipääsuloendi korral `access` eemaldatakse.

#### updateMany({ _id: { $in: ids } }, { $set: { queued: now } })
Kutsutakse: `addAggregateQueue()` kaudu failis `utils/aggregate.js`:
- `aggregateEntity()` — kui objekt muutus: viitajad (nime muutus), `_inheritrights` alam-objektid (õiguste muutus) ning ülemobjektid, viitajad ja viidatud objektid, mille objektitüübil on valemiparameetreid
- `DELETE /api/[db]/entity/[_id]` ja GraphQL `Delete` mutatsioonid — objektid, mille viited kustutatud objektile eemaldati

Märgib seotud objektid uuesti agregeerimiseks taustakäitaja poolt pärast muutuse levimist neile.

#### updateMany({ 'private._reference.reference': entityId }, { $set: { queued: now } })
Kutsutakse: `upsertMirror()` poolt failis `utils/sharing.js`, kui olemasoleva peegelobjekti `name` muutus

Paneb järjekorda kohalikud objektid, mis peegelobjektile viitavad, sest need hoiavad selle nime koopiat.

#### deleteOne({ _id: entityId })
Kutsutakse: `aggregateEntity()` poolt failis `utils/aggregate.js`

Eemaldab objektidokumendi jäädavalt, kui agregatsioon tuvastab sellel kehtiva `_deleted` parameetri — selle kirjutavad `DELETE /api/[db]/entity/[_id]` ja GraphQL `Delete` mutatsioonid.

#### replaceOne({ _id, _origin_db }, mirror, { upsert: true })
Kutsutakse: `upsertMirror()` poolt failis `utils/sharing.js`, taustal töötavast jagamise sünkroonijast (`plugins/sharing.js`)

Kirjutab jagamise peegelobjekti — lähteobjekti kokkulepitud parameetrid koos `_origin_db`, `_origin_hash`, ligipääsuloendi ja otsinguindeksiga — ainult siis, kui selle `_origin_hash` muutus. Filter `_origin_db` järgi tagab, et sama `_id`-ga kohalikku objekti ei kirjutata kunagi üle; upsert ebaõnnestub hoopis duplikaatvõtme veaga.

#### deleteMany({ _origin_db: { $exists: true }, $nor: [{ _origin_db, 'private._type.string' }, …] })
Kutsutakse: `syncMirrors()` poolt failis `utils/sharing.js`, taustal töötavast jagamise sünkroonijast

Kõvakustutab peegelobjektid, mida ükski ühenduse ja objektitüübi paar enam ei kata — ühendus või objektitüüp eemaldati.

#### deleteMany({ _id: { $in: removeIds }, _origin_db })
Kutsutakse: `syncShare()` poolt failis `utils/sharing.js`, taustal töötavast jagamise sünkroonijast

Kõvakustutab peegelobjektid, mille lähteobjekt pole ühendusele enam antud — õigus eemaldati või originaalobjekt kustutati.

#### createIndexes([…])
Kutsutakse: `PUT /api/new` poolt, `createDatabaseIndexes()` kaudu failis `utils/setupDatabase.js`

Loob uue andmebaasi `entity` indeksid.

### Kollektsioon: `property`

#### insertOne(property)
Kutsutakse:
- `setEntity()` poolt, `insertProperties()` kaudu failis `utils/entity.js` — üks iga esitatud parameetri kohta, kõigi ülal loetletud kutsujate puhul. Loomisel sisestab see ka `_created` (ja `_owner`, kui objekti loob kasutaja), objektitüübi vaikimisi `_parent` väärtused, ülemobjektidelt päritud `_sharing` ja `_inheritrights` ning parameetrite vaikeväärtused. `entu_user` kutsed salvestatakse allkirjastatud `invite` tokeniga, `entu_api_key` väärtused SHA-256 räsina. Tähelepanuväärsed kirjed:
  - `PUT /api/new`, kutse vastuvõtmine ja isikuobjekti automaatne loomine — OAuth.ee kasutajatele `entu_user` (`uid`, `provider`, `email`), pääsuvõtme kasutajatele `entu_passkey` (`passkey_id`, `passkey_public`, `passkey_counter: 0`, `passkey_device`), kus uue pääsuvõtme `passkey_id` ja `passkey_public` võetakse kontrollitud registreerimisest, mitte kunagi päringu kehast
  - `GET /api/[db]/billing`, `POST /api/stripe` — `billing_customer_id` andmebaasi objektil
- `DELETE /api/[db]/entity/[_id]` ja GraphQL `Delete` mutatsioonid — `{ entity: entityId, type: '_deleted', reference: user, datetime: now, created: { at: now, by: user } }`

Lisab objektile uue parameetrikirje. Olemasolevaid väärtusi ei kirjutata kunagi üle — vanad tehakse pehme kustutamisega eemaldatuks.

#### updateMany({ _id: { $in: oldPIds }, entity, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Kutsutakse: `setEntity()` poolt, `markPropertiesDeleted()` kaudu failis `utils/entity.js`, kui esitatud parameetrid kannavad asendatava väärtuse `_id`-d:
- `POST /api/[db]/entity/[_id]`
- `POST /api/[db]/ai/execute` — `update_entity` koos `valueId`-ga
- `POST /api/graphql/[db]` — `Update` mutatsioonid
- `GET /api/auth`, `POST /api/auth/passkey`, `POST /api/auth/passkey/register` — kutse vastuvõtmine asendab ootel `entu_user` kutse päris sisselogimisandmetega (`entu_user` või `entu_passkey`)
- `GET /api/auth`, `POST /api/auth/token`, `GET /api/auth/refresh` — sisselogimine asendab ainult e-postiga `entu_user` väärtuse sellisega, millel on `uid` ja `provider`

Teeb asendatavad parameetrikirjed pehmelt kustutatuks, säilitades täieliku ajaloo.

#### updateMany({ entity, type: { $in: userRights }, reference: { $in: users }, _id: { $nin: newIds }, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Kutsutakse: `setEntity()` poolt, `markReplacedUserRightsDeleted()` kaudu failis `utils/entity.js`, alati kui see seab kasutajale `_noaccess`, `_viewer`, `_expander`, `_editor` või `_owner` õiguse

Teeb selle kasutaja teised kehtivad õiguste parameetrid samal objektil pehmelt kustutatuks, nii et igal kasutajal on objektil ainult üks õigus.

#### updateMany({ _id: { $in: extraOldIds }, entity, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Kutsutakse: `POST /api/graphql/[db]` — `Update` mutatsioonid

Teeb pehmelt kustutatuks salvestatud väärtused, mida on rohkem kui sisendis, nii et lühem loend asendab pikema.

#### updateOne({ _id: propertyId, entity }, { $set: { deleted: { at, by } } })
Kutsutakse:
- `DELETE /api/[db]/property/[_id]`
- `POST /api/[db]/ai/execute` — `delete_property`

Teeb üksiku konkreetse parameetriväärtuse pehmelt kustutatuks. Kirje jääb andmebaasi auditeerimise eesmärgil alles.

#### updateMany({ reference: entityId, deleted: { $exists: false } }, { $set: { deleted: { at, by } } })
Kutsutakse: `DELETE /api/[db]/entity/[_id]`, GraphQL `Delete` mutatsioonid

Teeb kõigi objektide kõik parameetrid, mis viitavad kustutatud objektile, pehmelt kustutatuks, vältides aegunud viiteid.

#### updateOne({ _id: propertyId }, { $set: { passkey_counter } })
Kutsutakse: `POST /api/auth/passkey` poolt, `passkeyVerifySignIn()` kaudu failis `utils/passkey.js`

Uuendab `entu_passkey` väärtuse WebAuthn allkirjaloendurit igas andmebaasis, kus pääsuvõti kontrolli läbis — autentija uuele loenduri väärtusele või salvestatud väärtusele pluss üks — ja agregeerib selle isikuobjekti uuesti. Loendurit uuendatakse kohapeal, mitte pehme kustutamise ja uue kirje sisestamisega.

#### createIndexes([…])
Kutsutakse: `PUT /api/new` poolt, `createDatabaseIndexes()` kaudu failis `utils/setupDatabase.js`

Loob uue andmebaasi `property` indeksid.

### Kollektsioon: `stats`

#### bulkWrite([updateOne({ date, function: 'ALL' }, { $inc: { count: 1 } }, { upsert: true }) × 3])
Kutsutakse: `plugins/stats.js` poolt pärast iga vastust päringule, millel on kontoandmebaas `entity` kollektsiooniga

Loendab API päringuid päeva (`YYYY-MM-DD`), kuu (`YYYY-MM`) ja aasta (`YYYY`) kaupa.

#### bulkWrite([updateOne({ date, function: 'AI' }, { $inc: { count, promptTokens, completionTokens, cacheCreatedTokens, cacheReadTokens } }, { upsert: true }) × 3])
Kutsutakse: `POST /api/[db]/ai/chat` poolt, `recordUsage()` kaudu failis `utils/ai/llm.js`, pärast iga AI vastust

Kogub AI päringud ja tokenikasutuse päeva, kuu ja aasta kaupa. Kuu kirje järgi kontrollitakse AI tokenite limiiti.

#### createIndex({ date: 1, function: 1 }, { unique: true })
Kutsutakse: `PUT /api/new` poolt, `createDatabaseIndexes()` kaudu failis `utils/setupDatabase.js`

## Andmebaas: `entu`

### Kollektsioon: `session`

#### insertOne({ created, pending?, user: { ip, … } })
Kutsutakse: `oauthCreateSession()` poolt failis `utils/oauth.js`:
- `GET /api/auth/callback` — pärast OAuth.ee sisselogimist, kasutaja `provider`, `id`, `name` ja `email` väärtustega
- `POST /api/auth/passkey`, `POST /api/auth/passkey/register` — pärast kontrollitud pääsuvõtme kinnitust või registreerimist (`passkeyFinish()` failis `utils/passkey.js`), väärtustega `provider: 'passkey'`, võtme `id`, `publicKey` ja `device`, uue pääsuvõtme puhul ka `registered: true`. Brauseri sisselogimine (päringus on `state`) loob selle `pending: true` olekus; natiivne sisselogimine loob kohe kasutatava sessiooni ja vahetab selle kohe ära.

Salvestab sisselogimise sessiooni. Server ei kõvakustuta sessioone kunagi.

#### findOneAndUpdate({ _id, pending: true, deleted: { $exists: false } }, { $unset: { pending } })
Kutsutakse: `GET /api/auth/callback` poolt pääsuvõtmega sisselogimistel, `claimPasskeySession()` kaudu failis `utils/oauth.js`

Võtab pääsuvõtme koodis nimetatud ootel sessiooni kasutusse. Atomaarne uuendus teeb koodi ühekordseks.

#### findOneAndUpdate({ _id, pending: { $exists: false }, deleted: { $exists: false } }, { $set: { deleted: now } })
Kutsutakse: `consumeSession()` poolt failis `utils/auth.js`, `authExchange()` kaudu:
- `GET /api/auth` — sessioonitokeni vahetamine
- `POST /api/auth/token` — OAuth autoriseerimiskoodi vahetamine
- `POST /api/auth/passkey`, `POST /api/auth/passkey/register` — natiivne sisselogimine

Märgib sessiooni kasutatuks, nii et kordusrünne ei leia midagi.

### Kollektsioon: `reservation`

#### insertOne({ _id: databaseName, created })
Kutsutakse: `PUT /api/new` poolt

Broneerib uue andmebaasi nime unikaalse `_id` järgi, nii et kaks samaaegset päringut ei saa luua sama andmebaasi.

#### deleteOne({ _id: databaseName })
Kutsutakse: `PUT /api/new` poolt

Vabastab broneeringu, kui andmebaasi loomine on lõppenud või ebaõnnestunud.
