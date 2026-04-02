# Parameetrid

Iga objekti kirjeldavad selle **parameetrid** — nimega väljad, mis hoiavad väärtusi. Parameetrid on see, mis teeb iga objektitüübi ainulaadseks: `person` objektil on `name` ja `email`; `invoice` objektil on `amount` ja `due_date`.

Parameetrid on määratletud objektitüübil (objektitüübi `property` tüüpi alam-objektidena). Vaata, kuidas neid kasutajaliideses seadistada [Objektitüübid](/et/configuration/entity-types/#parameetrite-definitsioonide-lisamine) alt.

## Põhimõisted

**Mitme väärtusega** — Ühel parameetri nimel võib olla mitu väärtust. Objektil võib olla mitu silti, telefoninumbrit või manust, kõik salvestatuna sama parameetri nime alla. Luba `list` parameetri definitsioonil, et see võimaldada.

**Tüüpidega** — Igal parameetril on andmetüüp (`string`, `number`, `date`, `file`, `reference` jne), mis määrab kasutajaliidese sisestusviisi ja kuidas väärtused salvestatakse.

**Mitmekeelne** — Luba parameetri definitsioonil `multilingual`, et salvestada eraldi väärtus iga keele jaoks. Muutmisvormis ilmub keelevalija iga sisestusvälja kõrvale ja API tagastab koos väärtustega keelekoodid.

**Arvutatud** — Sea parameetri definitsioonil `formula`, et arvutada selle väärtus automaatselt iga salvestamisega. Vaata [Valemid](/et/api/formulas/).

**Auditi rada** — Kõik parameetriväärtused kannavad loomise metaandmeid (ajatempel ja kasutaja), mis muudab jälgitavaks, kes mida ja millal seadistas.

**Süsteemparameetrid** — Parameetrid, mis algavad `_`-ga (`_id`, `_type`, `_parent`, `_owner` jne), on Entu hallatavad ja kontrollivad identiteeti, hierarhiat ja juurdepääsuõigusi.

::: info
Kohandatud parameetrite nimed ei tohi alata `_`-ga. See prefiks on reserveeritud süsteemparameetritele. Parameetrite nimed peavad koosnema ainult tähtedest, numbritest ja allkriipsudest (`A–Z`, `a–z`, `0–9`, `_`). Kriipsud, punktid, tühikud ja muud märgid ei ole lubatud ja lükatakse tagasi.
:::

## Parameetrite tüübid

| Tüüp | Sisestus | Märkused |
|---|---|---|
| `string` | Ühereasisestus | Vaikimisi tekstisisestus. Kui parameetri definitsioonil on määratud `set`, kuvatakse rippmenüüna. |
| `text` | Mitmereasisestus | Automaatselt suureneb 3–15 reani. Luba `markdown` rikkalikuks vormindamiseks. |
| `number` | Arvsisestus | Lokaadipõhine formaat. Kasuta parameetri definitsioonil `decimals`, et kontrollida täpsust. |
| `boolean` | Lüliti | Salvestab `true` või `false`. |
| `date` | Kuupäevavalija | Salvestab ainult kuupäeva — ilma kellaaja komponendita. |
| `datetime` | Kuupäev + kellaaeg | Salvestab täieliku ajatempli. |
| `file` | Faili üleslaadimine | Salvestab failimanuse. Vaata üleslaadimisprotsessi kohta [Failid](/et/api/files/). |
| `reference` | Objektivalija | Lingib teisele objektile. Kasuta definitsioonil `reference_query`, et filtreerida valitavaid valikuid. |
| `counter` | Automaatselt genereeritud kood | Ainult lugemine kasutajaliideses. Näitab genereerimisnuppu, kui tühi; kuvab väärtuse pärast omistamist. Kasuta arvenumbrite, projektikoodide jaoks. |

## Mitme väärtusega parameetrid

Kui parameetri definitsioonil on `list: true`, saab objekt selle parameetri jaoks sisaldada mitut väärtust. Muutmisvormis ilmuvad täiendavad tühjad sisestusväljad automaatselt, kui kasutaja neid täidab.

API kaudu on iga väärtus eraldi parameetriobjekt — lisa väärtusi POST-i abil, eemalda konkreetseid väärtusi, kustutades nende `_id` järgi.

## Mitmekeelsed parameetrid

Kui parameetri definitsioonil on seatud `multilingual: true`, kannab iga väärtus `language` koodi. Muutmisvorm näitab iga sisestusvälja kõrvale keelevalijat.

Eri keelte väärtused salvestatakse eraldi parameetriobjektidena, millest igaüks kannab `language` koodi. Vaata API formaadi kohta [API → Parameetrid](/et/api/properties/).

## Failiparameetrid

Failiparameetrid võimaldavad objektidel salvestada manuseid, dokumente, pilte ja muid binaarseid andmeid. Failid salvestatakse objektisalvestusse (S3-ühilduv) ja neile pääseb ligi allkirjastatud, ajalimiitidega URLide kaudu.

Failide üleslaadimise lubamiseks objektitüübil lisa parameetri definitsioon `type: file` kujul.

::: tip
Kui objektil on olemas `photo` nimeline failiparameeter, kasutab Entu kasutajaliides seda objekti pisipildina.
:::

## Vaikeväärtused

Parameetri definitsioon võib kanda `default` väärtust, mida rakendatakse automaatselt serveri poolt objekti esmaloomisel. See eeltäidetakse ka loomisvormis, et kasutajad näeksid seda kohe. Kasutaja saab eeltäidetud väärtust enne salvestamist muuta või tühjendada — kui ta seda teeb, on tema väärtus ülimuslik.

Toetatud kõigile tüüpidele peale `file` ja `counter`. `date` ja `datetime` jaoks saab kasutada suhtelisi nihkeid nagu `+1d` või `-7d` fikseeritud kuupäeva asemel.

Täieliku formaadi kohta vaata [Parameetrite vaikeväärtused](/et/configuration/entity-types/#parameetrite-vaikevaartused).

## Arvutatud parameetrid

Sea parameetri definitsioonil `formula`, et arvutada selle väärtus automaatselt teistest andmetest — objekti enda parameetritest, alam-objektidest või sellele viitavatest objektidest. Arvutatud parameetrid arvutatakse iga salvestamisega uuesti ega ole käsitsi muudetavad.

::: tip
Kasuta arvutatud parameetreid kogusummade, loenduste ja agregatsioonide jaoks, et tuletatud andmed oleksid alati sünkroonitud allikaga.
:::

Täieliku süntaksi kohta vaata [Valemid](/et/api/formulas/).

## Entu kasutajaliidese kasutatavad parameetrid

Järgmistel parameetrite nimedel on kasutajaliideses eriline tähendus. Saad neid määratleda mis tahes objektitüübil ja süsteem kasutab neid automaatselt.

| Parameeter | Tüüp | Käitumine |
|---|---|---|
| `name` | string | Kasutatakse objekti kuvanimedena kogu kasutajaliideses — loendites, leivarajas, otsingutulemetes ja lehe pealkirjana. Kui see puudub, kuvatakse objekti `_id`. |
| `photo` | file | Esimest väärtust kasutatakse objekti pisipildina loendites ja objekti lehe päises. Süsteem teeb selle kättesaadavaks ka `_thumbnail`-na — valmis kasutamiseks mõeldud allkirjastatud allalaadimise URL. |

## Süsteemparameetrid

Süsteemparameetrid algavad `_`-ga ja kontrollivad objekti käitumist, juurdepääsuõigusi ja metaandmeid. Kohandatud parameetrite nimed ei tohi alata `_`-ga.

| Parameeter | Kirjeldus |
|---|---|
| `_id` | Unikaalne objekti identifikaator. Ainult lugemine, automaatselt genereeritud. |
| `_type` | Viide objektitüübi definitsioonile. Nõutav igal objektil. |
| `_parent` | Viide ülemobjektile. Objektil võib olla mitu `_parent` väärtust. |
| `_sharing` | Nähtavuse tase: `private` (vaikimisi), `domain` või `public`. |
| `_inheritrights` | Kui väärtus on `true`, pärib objekt juurdepääsuõigused oma ülemobjektilt. |
| `_owner` | Täielik kontroll — vaata, muuda, kustuta, halda õigusi, loo alam-objekte. |
| `_editor` | Saab vaadata ja muuta kõiki parameetreid peale õiguste. |
| `_expander` | Saab vaadata ja luua alam-objekte. |
| `_viewer` | Ainult lugemisõigus. |
| `_noaccess` | Selgesõnaliselt kõik juurdepääsud keelatud. Tühistab ülemobjektilt päritavad õigused. |
| `_created` | Loomise ajatempel ja kasutaja. Ainult lugemine, automaatselt genereeritud. |
| `_deleted` | Kustutamise ajatempel ja kasutaja. Seadistatakse objekti kustutamisel. |
| `_thumbnail` | Allkirjastatud, ajalimiitidega allalaadimise URL, genereeritud objekti `photo` parameetrist. Ainult lugemine, automaatselt genereeritud. |

## Kustutamine

Parameetreid ei **eemaldata kunagi füüsiliselt** andmebaasist. Kui parameetriväärtus kustutatakse:

- See märgistatakse `deleted.at` (ajatempel) ja `deleted.by` (kustutuse sooritanud kasutaja) kujul.
- See jäetakse automaatselt välja kõigist API vastustest ja kasutajaliidesest.
- Kustutamiskirje on püsiv — alati on teada, mis eemaldati, millal ja kelle poolt.

::: info
Kuna parameetriväärtused on ainult pehmelt kustutatud, säilitatakse kogu ajalugu selle kohta, kes iga väärtuse seadistas või eemaldas, isegi pärast ülemobjekti kadumist.
:::
