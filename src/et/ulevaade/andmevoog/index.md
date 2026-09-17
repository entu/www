---
description: "Mida Entu kirjutamisel arvutab, mis on kohe valmis ja mis järgneb hetk hiljem — ajastus, millega sinu rakendus peab arvestama."
---

# Andmevoog

Entu salvestab selle, mida sa kirjutad, ja arvutab sellest tublisti rohkem: objekti avaliku ja domeeni vaate, valemite väärtused, ligipääsuloendi, otsinguindeksi ja päritud õigused. Suurem osa sellest on valmis hetkeks, mil kirjutamine vastuse tagastab. Osa mitte.

Selle vahe teadmine eristab rakendust, mis loeb tagasi äsja arvutatu, sellest, mis näitab aeg-ajalt eilset summat.

## Mis juhtub kirjutamisel

Kirjutamine — `POST /api/{db}/entity` või `POST /api/{db}/entity/{_id}` — teeb kaks asja.

**Esiteks arvutab ta enne vastamist üle objekti, mille sa kirjutasid.** Parameetrite väärtused salvestatakse ja objekt tuletatakse neist uuesti: valemiparameetrid arvutatakse, õigused liidetakse ülemobjektidelt päritutega, ligipääsuloend ehitatakse uuesti, otsinguindeks uuendatakse ning avalik ja domeeni vaade pannakse kokku nendest parameetritest, mille definitsioonid on jagatud.

Nii on äsja kirjutatud objekt vastuses ja igas järgnevas päringus täiesti värske.

**Teiseks paneb ta järjekorda kõik, mis sellest objektist sõltub.** Need arvutatakse taustal, mitte enne vastamist.

## Mis läheb järjekorda

Entu paneb objekti järjekorda siis, kui sinu kirjutamine võis muuta seda, mida see objekt arvutab:

| Sa muutsid | Entu paneb järjekorda |
|---|---|
| Objekti nime | kõik objektid, mis sellele viitavad — viited hoiavad nime koopiat |
| Õigusi (`_viewer`, `_editor`, `_owner`, `_expander`, `_noaccess`) | alam-objektid, millel on `_inheritrights` |
| Midagi, mida valem loeb | ülemobjektid `_child.*` valemitega, viitajad `viide.*` valemitega ja viidatud objektid `_referrer.*` valemitega |

Kolmandal juhul lähevad järjekorda ainult need objektid, millel tegelikult on valemiparameetreid, ja kui kirjutamine objekti ei muutnud, ei lähe järjekorda midagi.

Järjekorda tühjendatakse pidevalt, hulkade kaupa, vanimad ees. Praktikas jõuavad sõltuvad väärtused järele sekunditega.

::: warning
Kaskaadid vajavad rohkem kui üht ringi. Õiguste muutus levib ühe hierarhiataseme võrra ringi kohta, nii et sügav puu saab valmis mitme ringiga. Sama kehtib valemite kohta, mille sisendid on ise valemid.
:::

## Mida see sinu rakenduse jaoks tähendab

**Loe tagasi objekt, mille kirjutasid, mitte see, mis sellest tuletatakse.** Arve rea loomine ja arve kohene lugemine annab enamasti vana summa. Kas arvuta vajalik number oma koodis või loe see pärast taustaringi.

**Ära küsi valemi väärtust tihedas tsüklis.** Kui seda on tõesti kohe vaja, arvutab `GET /api/{db}/entity/{_id}/aggregate` selle objekti kohapeal üle ja vastab siis, kui valmis. See on õige tööriist pärast välist muudatust ja vale tööriist tavakasutuseks — tavapäringud teenindatakse juba arvutatud andmetest, mis teebki need kiireks.

**Arvesta, et ümbernimetatud objekt jääb viidetes lühikeseks ajaks vana nimega.** Viite väärtus kannab viidatud objekti nime, et loendeid saaks kuvada ilma lisapäringuteta. Pärast ümbernimetamist tuletatakse viitajad taustal uuesti.

**Õiguste muudatused ei jõusta kõikjal kohe.** Objekt, mida sa muutsid, jõustab need kohe, sest ligipääsuloend ehitatakse uuesti sünkroonselt. Alam-objektid, mis neid õigusi pärivad, järgnevad taustal — nii võib äsja eemaldatud õigus alam-objektidel veel hetke kehtida. Kui see on oluline, muuda õigusi seal hierarhia kohas, kust kasutaja tegelikult loeb, või oota levimine ära, enne kui teatad, et valmis.

## Mida kunagi edasi ei lükata

Ligipääsukontroll lugemisel on alati värske. Iga päring lahendab päringu hetkel objekti salvestatud ligipääsuloendist selle, mida kutsuja näha tohib — kasutaja kohta ei puhverdata midagi ja aegunud arvutus ei laienda kunagi seda, mida keegi lugeda saab. Ülalkirjeldatud viivitus on alam-objektide õiguste **ümberarvutamises**, mitte nende rakendamises.

Kirjutamised on samuti kohesed: miski, mille saadad, ei lähe hilisemaks salvestamiseks järjekorda. Järjekorras on ümberarvutus, mitte sinu andmed.
