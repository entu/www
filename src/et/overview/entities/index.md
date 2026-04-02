# Objektid

Objektid on Entu põhilised ehituskivid. Objekt on kirje — inimene, projekt, arve, toode — mis tahes asi, mida tuleb hallata. Iga objekt kuulub **objektitüüpi**, mis toimib tema andmemallina.

Andmemudeli määratlemiseks kasutajaliideses vaata [Objektitüübid](/et/configuration/entity-types/).

## Põhiomadused

**Paindlikud parameetrid** — Erinevalt fikseeritud veergudega relatsioonitabelist kannavad objektid mis tahes parameetreid, mille nende tüüp on määratlenud. Erinevad objektitüübid võivad modelleerida täiesti erinevakujulisi andmeid samas süsteemis.

**Mitme väärtusega parameetrid** — Ühel parameetri nimel võib olla mitu väärtust. Objektil võib olla mitu silti, telefoninumbrit või failimanust, kõik salvestatuna sama parameetri nime alla.

**Hierarhiline struktuur** — Objektidel võivad olla ülem-alam seosed. Alam-objektil võib olla mitu ülemat, mis tähendab, et see ilmub samaaegselt mitmes kontekstis ilma dubleerimiseta.

**Viited** — Objektid saavad viidata teistele objektidele viiteparameetrite kaudu, luues ühendatud andmegraafi.

**Arvutatud parameetrid** — Parameetreid saab määratleda valemitena, mis arvutatakse automaatselt iga salvestamisega, tuginedes objekti enda andmetele, selle alam-objektidele või objektidele, mis sellele viitavad. Vaata [Valemid](/et/api/formulas/).

**Auditi rada** — Kõik parameetriväärtused kannavad loomise metaandmeid (ajatempel ja kasutaja), mis muudab jälgitavaks, kes mida ja millal seadistas.

## Hierarhia ja seosed

Objektid on korraldatud hierarhiatesse, kasutades süsteemparameetrit `_parent`.

**Mitu ülemat** — Objektil võib olla rohkem kui üks ülem ja see ilmub igas kontekstis alam-objektina ilma dubleerimiseta. Dokument võib samaaegselt kuuluda nii projektile kui ka osakonnale.

**Alam-objektide loomine** — Kui kasutad ülemobjekti lehel nuppu „Lisa", seatakse `_parent` automaatselt. Alam-objektide loomiseks on vaja vähemalt `_expander` õigusi ülemobjektile (`_editor` ja `_owner` sisaldavad `_expander` õigusi).

**Õiguste pärimine** — Kui alam-objektil on seatud `_inheritrights: true`, pärib see oma ülemobjekti juurdepääsuõigused. Ülemtaseme muutused kanduvad automaatselt edasi kõigile alam-objektidele, millel on pärimine lubatud.

::: tip
Soovitatav muster on anda õigused ülemkonteinerile ja lubada alam-objektidel `_inheritrights` — nii hallatakse juurdepääsu ühes kohas, mitte iga objekti peal eraldi.
:::

## Juurdepääsuõigused

Igal objektil on selgesõnaline juurdepääsukontroll. Õigused seatakse, viidates isikuobjektile vastava õiguste parameetri all. Isikul on juurdepääs, kui ta vastab mõnele kandele mis tahes õiguste parameetris.

| Parameeter | Juurdepääsu tase |
|---|---|
| `_owner` | Täielik kontroll — vaata, muuda kõiki parameetreid, kustuta objekt, halda õigusi, loo alam-objekte. |
| `_editor` | Saab vaadata ja muuta kõiki parameetreid peale õiguste parameetrite enda. |
| `_expander` | Saab vaadata objekti ja luua selle alla alam-objekte. |
| `_viewer` | Ainult lugemine — saab vaadata objekti ja selle parameetreid. |
| `_noaccess` | Selgesõnaliselt kõik juurdepääsud keelatud. Tühistab kõik teised samale objektile seatud õiguste parameetrid. Ei kandu `_inheritrights` kaudu alam-objektidele edasi. |

### Jagamine

Parameeter `_sharing` kontrollib nähtavust individuaalsete kasutajaõiguste piires:

| Väärtus | Kes saab vaadata |
|---|---|
| `private` | Ainult kasutajad, kellel on selgesõnalised õigused. See on vaikimisi. |
| `domain` | Kõik autenditud kasutajad andmebaasis, sõltumata selgesõnalistest õigustest. |
| `public` | Kõik, sealhulgas autentimata külastajad. |

Muutmiseks on alati vaja `_editor` või `_owner` õigusi, sõltumata jagamistasemest.

::: info
`domain` ja `public` jagamine annab ainult lugemisõiguse. Kirjutamisõigus nõuab alati selgesõnalist `_editor` või `_owner` õigust objektil.
:::

::: danger
`_sharing: public` seadmine muudab objekti nähtavaks kõigile internetis ilma autentimiseta. Kasuta seda ainult tahtlikult avaliku sisu jaoks.
:::

### Õiguste pärimine

Sea objektil `_inheritrights: true`, et pärida õigused oma ülemobjektilt. Otse alam-objektile määratud õigused tühistavad päritavad õigused. Kasuta `_noaccess`, et blokeerida kasutaja, kes muidu päriks juurdepääsu ülemobjektilt.

::: info
Õiguste hindamise järjekord: selgesõnalised õigused objektil → päritavad õigused ülemobjektilt → `_sharing` tase. `_noaccess` tühistab kõik teised samale objektile kehtivad õigused — sealhulgas otsesed positiivsed õigused. See ei kandu `_inheritrights` kaudu alam-objektidele edasi; pärandatakse ainult `_viewer`, `_expander`, `_editor` ja `_owner`.
:::

## Kustutamine

Kui objekt kustutatakse, lisatakse parameetrikirje `_deleted`, mis salvestab kasutaja ja täpse ajatempli. Objekti dokument eemaldatakse seejärel andmebaasist jäädavalt. Aluseks olevad toored parameetrikirjed kogumikus `property` säilitatakse auditeerimise eesmärgil, kuid objekt ei ilmu enam ühtegi API vastusesse ega kasutajaliidesesse.

Teiste objektide parameetrid, mis viitavad kustutatud objektile, märgistatakse samuti `deleted.at` / `deleted.by`-ga, et auditijälg oleks järjepidev.

::: info
Ainult `_owner` õigustega kasutajad saavad objekti kustutada.
:::
