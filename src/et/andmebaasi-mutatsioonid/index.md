# Andmebaasi mutatsioonid

See leht dokumenteerib kõik serveri poolt tehtavad MongoDB kirjutusoperatsioonid, grupeerituna kollektsiooni ja käsu järgi. Hõlmab kõiki juhtumeid, kus andmeid lisatakse, uuendatakse või kõvakustutatakse — sealhulgas objekti elutsükkel (loomine, muutmine, dubleerimine, kustutamine), parameetrite haldus, konto alglaadimine, Passkey registreerimine ja Stripe arvelduse uuendused.

Andmemudel eraldab töötlemata sisendi arvutatud vaatest: väljaväärtused kirjutatakse `property` kollektsiooni üksikkirjetena ja neid ei kirjutata kunagi üle — kui väärtus muutub, tehakse vana kirje pehmelt kustutatuks ja sisestatakse uus. `entity` kollektsioon salvestab ainult agregeeritud denormaliseeritud dokumendi (taastatakse pärast iga mutatsiooni) ja toimib peamise lugemisallikana.

## Kollektsioon: `entity`

### insertOne({})
Kutsutakse:
- `POST /api/[db]/entity` — loob uue objekti
- `POST /api/[db]/entity/[_id]/duplicate` — korra iga nõutud koopia kohta
- `PUT /api/[db]` — korra iga alglaadimise algandmeobjekti kohta

Sisestab tühja objektidokumendi, mis toimib ID ankruna. Tegelikud väljaväärtused salvestatakse üksikkirjetena `property` kollektsiooni ja denormaliseeritakse hiljem objektile tagasi agregatsiooni kaudu.

### replaceOne({ _id }, newEntity, { upsert: true })
Kutsutakse: iga mutatsiooni korral, `aggregateEntity()` kaudu failis `server/utils/aggregate.js`

Arvutab uuesti täieliku denormaliseeritud `public`/`private` vaate toorparameetritest ja asendab salvestatud objektidokumendi.

### updateMany({ _id: { $in: ids } }, { $set: { queued: now } })
Kutsutakse: mis tahes kustutamise või viite muutmise korral, `addAggregateQueue()` kaudu failis `server/utils/aggregate.js`

Märgib seotud objektid uuesti agregeerimiseks taustakäitaja poolt pärast muutuse levimist neile.

### deleteOne({ _id: entityId })
Kutsutakse: `aggregateEntity()` poolt failis `server/utils/aggregate.js`

Eemaldab objektidokumendi jäädavalt, kui agregatsioon tuvastab sellel `_deleted` parameetri.

## Kollektsioon: `property`

### insertOne(property)
Kutsutakse:
- `DELETE /api/[db]/entity/[_id]` — sisestab `{ entity: entityId, type: '_deleted', reference: user, datetime: now, created: { at: now, by: user } }`
- `POST /api/[db]/entity` — üks iga esitatud parameetri kohta + automaatne `_owner` ja `_created`
- `POST /api/[db]/entity/[_id]` — üks iga esitatud parameetri kohta
- `POST /api/[db]/entity/[_id]/duplicate` — üks iga kopeeritud parameetri kohta iga duplikaadi jaoks
- `POST /api/[db]/passkey` — sisestab `{ type: 'entu_passkey', passkey_id, passkey_public_key, passkey_counter }`
- `POST /api/stripe` — üks iga Stripe veebikonksust uuendatud arveldusparameetri kohta

Lisab objektile uue parameetrikirje. Olemasolevaid väärtusi ei kirjutata kunagi üle — vanad tehakse pehme kustutamisega eemaldatuks.

### insertMany(properties)
Kutsutakse: `PUT /api/[db]` poolt

Massisestab kõik parameetrikirjed iga algandmeobjekti jaoks konto alglaadimise käigus.

### updateMany({ _id: { $in: oldPIds } }, { $set: { deleted: { at, by } } })
Kutsutakse: mis tahes `setEntity()` kutsutuse korral, mis asendab olemasolevaid väärtusi, `markPropertiesDeleted()` kaudu failis `server/utils/entity.js`:
- `POST /api/[db]/entity/[_id]`
- `POST /api/[db]/entity/[_id]/duplicate`
- `POST /api/[db]/passkey`
- `POST /api/stripe`
- `PUT /api/[db]`

Teeb asendatavad parameetrikirjed pehmelt kustutatuks, säilitades täieliku ajaloo.

### updateOne({ _id: propertyId }, { $set: { deleted: { at, by } } })
Kutsutakse: `DELETE /api/[db]/property/[_id]` poolt

Teeb üksiku konkreetse parameetriväärtuse pehmelt kustutatuks. Kirje jääb andmebaasi auditeerimise eesmärgil alles.

### updateMany({ reference: entityId }, { $set: { deleted: { at, by } } })
Kutsutakse: `DELETE /api/[db]/entity/[_id]` poolt

Teeb kõigi objektide kõik parameetrid, mis viitavad kustutatud objektile, pehmelt kustutatuks, vältides aegunud viiteid.

### updateMany({ entity, type: 'entu_passkey', passkey_id }, { $set: { passkey_counter } })
Kutsutakse: `POST /api/auth/passkey` poolt

Suurendab WebAuthn allkirjaloendurit pärast edukat Passkey autentimist kloonitud autentijaite tuvastamiseks.

### updateMany({ reference: oldOid }, { $set: { reference: newId } })
Kutsutakse: `PUT /api/[db]` poolt

Pärast mahtu importimist kirjutab kõik viiteväärtused ümber pärandus-OID-dest uuteks importimisel määratud MongoDB ObjectId-deks.

### deleteMany({ reference: { $nin: allEntityIds } })
Kutsutakse: `PUT /api/[db]` poolt

Kõvakustutab parameetrikirjed, mille viite sihtmärk ei eksisteeri enam, hoides andmed konsistentsena pärast andmebaasi loomist või importimist.
