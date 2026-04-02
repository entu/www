# Objektitüübid

Objektitüüp määratleb objektide kategooria sinu andmebaasis. Loo üks iga asja kohta, mida pead salvestama — näiteks `project`, `invoice` või `product`. Välju, mida iga objekt kannab, määratlevad **parameetrite definitsioonid**, mis on objektitüübi alam-objektid.

Kogu seadistamine toimub Entu kasutajaliideses — koodi ega konfiguratsioonifaile pole vaja.

## Objektitüübi loomine

1. Ava külgribal **Seadistamine**
2. Lisa uus objekt tüübiga **Entity**
3. Täida alltoodud parameetrid

### Objektitüübi parameetrid

**Identiteet**

| Parameeter | Kirjeldus |
|---|---|
| `name` | Sisemine identifikaator (nt `project`, `invoice`). Kasutatakse API päringutes — väiketähtedena, ilma tühikuteta. |
| `label` | Kasutajaliideses kuvatav nimetus (nt `Projekt`, `Arve`). |
| `description` | Selgitus, mida see objektitüüp esindab. Kuvatakse selle tüübi objektide muutamisvaates. |

**Käitumine**

| Parameeter | Kirjeldus |
|---|---|
| `add_from` | Kontrollib, kust seda tüüpi objekte saab luua. Viita **menüü** objektile, et kuvada see tüüp tööriistaribal nupus „Uus …", kui see menüü on aktiivne. Viita **objektitüübile**, et lubada selle tüüpi objekte lisada alam-objektina mis tahes selle tüübi eksemplari alla. Viita **konkreetsele objektile**, et lubada luua seda tüüpi ainult selle konkreetse objekti alam-objektina. Ilma selleta ei paku nupp „Lisa" kunagi seda tüüpi. |
| `default_parent` | Kui luuakse seda tüüpi uus objekt, lisatakse siin määratud objekt automaatselt täiendava `_parent`-na. Kasulik uute kirjete suunamiseks fikseeritud kausta sõltumata sellest, kuhu kasutaja klikkis „Lisa". |
| `plugin` | Lisab plugina selle tüüpi objektidele. Vaata [Pluginad](/et/configuration/plugins/). |

::: warning
Kui `add_from` ei ole seatud, pole kasutajatel kasutajaliidesest võimalust seda tüüpi objekte luua. Viita vähemalt ühele menüüle, objektitüübile või konkreetsele objektile.
:::

Selle tüübi juurdepääsukontrolli kohta vaata [Nähtavus](#nahtavus) alt.

## Parameetrite definitsioonide lisamine

Objektitüübi lehel kasuta nuppu „Lisa", et luua alam-objekte tüübiga **Property**. Loo üks iga välja jaoks, mida selle tüübi objektid peaksid omama.

### Parameetri definitsiooni parameetrid

**Identiteet**

| Parameeter | Kirjeldus |
|---|---|
| `name` | Sisemine identifikaator (nt `status`, `due_date`). Kasutatakse API päringutes — peab sisaldama ainult tähti, numbreid ja allkriipse (`A–Z`, `a–z`, `0–9`, `_`). Peab objektitüübi sees olema unikaalne. |
| `type` | Andmetüüp — määrab kasutajaliidese sisestusviisi ja kuidas väärtused salvestatakse. Vaata [Parameetrite tüübid](#parameetrite-tuubid) alt. |
| `label` | Kasutajaliideses välja kohal kuvatav nimetus nii muutamisvormis kui objekti lehel. |
| `label_plural` | Mitmusekuju nimetus, mis kuvatakse mitme väärtuse korral (nt `Sildid` `Sildi` asemel). |
| `description` | Abitekst, mis kuvatakse välja nimeduse kõrval infopopoveris. |

**Kuvamine**

| Parameeter | Kirjeldus |
|---|---|
| `group` | Grupeerib seotud väljad nimega jaotisteks; väärtust kasutatakse jaotuse pealkirjana. Kehtib nii muutamisvormis kui objekti lehel. |
| `ordinal` | Numbriline järjestus grupis. Väiksemad numbrid ilmuvad ees. |
| `hidden` | Peidab välja muutamisvormist, kuid kuvab selle väärtuse objekti lehel endiselt. Kasuta valemipõhiste või integratsiooni hallatavate väljade jaoks. |
| `readonly` | Peidetud muutamisvormist; kuvatakse objekti lehel kirjutuskaitstud väärtusena. |
| `table` | Kaasab selle parameetri veerguna alam-objektide tabelivaates. |

**Käitumine**

| Parameeter | Kirjeldus |
|---|---|
| `mandatory` | Märgib välja kohustuslikuks — kuvatakse alati punase indikaatoriga, kui tühi. |
| `default` | Eeltäidetud väärtus uue objekti loomisel. Toetab `date`/`datetime` jaoks suhtelisi nihkeid (nt `+1d`, `-7d`, `+1m`). Vaata [Parameetrite vaikeväärtused](#parameetrite-vaikevaartused) alt. |
| `list` | Lubab mitu väärtust. Täiendavad sisestusväljad ilmuvad automaatselt, kui kasutaja neid täidab. |
| `multilingual` | Salvestab eraldi väärtuse iga keele jaoks. Iga sisestusvälja kõrvale ilmub keelevalija. |
| `plugin` | Lisab plugina välja tasemel kohandatud kasutajaliideseks või käitumiseks. |

**Arvutamine**

| Parameeter | Kirjeldus |
|---|---|
| `formula` | Serveripoolne avaldis, mis arvutatakse iga salvestamisega; tulemus asendab välja salvestatud väärtuse. Vaata [Valemid](/et/api/formulas/). |
| `search` | Indekseerib väärtused täistekstiotsinguks. Vali hoolikalt — liiga paljude väljade indekseerimine aeglustab otsimist kogu konto ulatuses. |

**Tüübi valikud**

| Parameeter | Kirjeldus |
|---|---|
| `markdown` | Lubab markdowni renderdamise `text` tüüpi väljadel. |
| `decimals` | Kümnendkohtade arv `number` tüüpi väljadel. |
| `set` | Määratleb lubatud väärtuste fikseeritud nimekirja — renderdab rippmenüü vabateksti asemel. Siin lisatud väärtused kuvatakse objekti muutamisvaates valikutena. Kasuta `string` tüübiga. |
| `reference_query` | Filtreerib, milliseid objekte saab `reference` väljal valida (nt `_type.string=person`). |

::: tip
Luba `search` parameetritel, mille järgi kasutajad sageli filtreerivad (nt `name`, `status`, `reference code`).
:::

### Parameetrite tüübid

Saadaolevad tüübid: `string`, `text`, `number`, `boolean`, `date`, `datetime`, `file`, `reference`, `counter`.

Iga tüübi kirjelduse ja kasutajaliidese käitumise kohta vaata [Parameetrid → Parameetrite tüübid](/et/overview/properties/#parameetrite-tuubid).

## Nähtavus

### Objektitüübi nähtavus

Parameetri `_sharing` väärtus objektitüübil kontrollib, millised parameetriväärtused projitseeritakse `domain` ja `public` API vastustesse. See **ei** tee objekti eksemplare iseenesest avalikult kättesaadavaks — objektitasemel juurdepääsu kontrollib endiselt iga objekti eksemplari `_sharing`.

| Parameeter | Kirjeldus |
|---|---|
| `_sharing` | Lubab ja piirab parameetrite projitseerimist selle tüübi jaoks: pole seatud (vaikimisi — domain/public projekteerimine puudub), `private` (piiramine puudub), `domain` või `public`. Vaata [Objektid → Jagamine](/et/overview/entities/#jagamine). |

::: warning
`_sharing: public` seadmine objektitüübil lubab parameetriväärtustel ilmuda avalikes API vastustes, kuid objektidele pääsevad autentimata kasutajad ligi ainult siis, kui ka objekti eksemplaril endal on `_sharing: public`. Tüüp kontrollib, *milliseid andmeid* saab avalikustada; eksemplar kontrollib, *kas* see on kättesaadav.
:::

### Parameetri nähtavus

Vaikimisi on kõik parameetrid privaatsed — need kaasatakse API vastustesse ainult kasutajatele, kellel on objektile selgesõnaline juurdepääs. Konkreetsete parameetrite avalikustamiseks laiemale publikule sea `_sharing` igal parameetri definitsioonil eraldi.

| Parameeter | Kirjeldus |
|---|---|
| `_sharing` | Selle parameetri väärtuse nähtavus: `private` (vaikimisi), `domain` või `public`. Piiratud objektitüübi `_sharing`-iga. |

### Kuidas need vastasmõjus toimivad

Objektitüübi `_sharing` piirab, kui laialdaselt parameetrite definitsioonid andmeid avalikustada saavad:

| Objektitüübi `_sharing` | Parameetri definitsiooni `_sharing` käitumine |
|---|---|
| pole seatud | Ühtegi parameetrit ei projitseerita domeeni- ega avalikesse vaatadesse, sõltumata parameetri definitsiooni seadetest. |
| `private` | Piiramist ei rakendata — parameetrid kasutavad oma `_sharing` väärtust. |
| `domain` | `domain`-ks seatud parameetrid avalikustatakse domeeni kasutajatele. `public`-ks seatud parameetrid piiratakse automaatselt `domain`-ks. |
| `public` | Piiramist ei rakendata — parameetrid kasutavad oma `_sharing` väärtust. |

::: tip
`_sharing` seadmine parameetri definitsioonil kontrollib ainult seda, kas see parameeter ilmub objekti `domain` või `public` vaates. See ei mõjuta seda, kes pääseb objektile ligi — objektitasemel juurdepääsu kontrollib `_sharing` ja õiguste parameetrid objekti eksemplaril.
:::

::: tip
Täieliku töönäite saamiseks objektitüübist koos parameetritega vaata [Kasutusnäited](/et/examples/).
:::

## Parameetrite vaikeväärtused

`default` väärtust rakendatakse automaatselt serveri poolt objekti esmaloomisel — sõltumata sellest, kas loomine toimub kasutajaliidese kaudu või otse API kaudu. See eeltäidetakse ka loomisvormis, et kasutajad näeksid seda kohe. Kui helistaja juba pakub väärtuse selle parameetri jaoks, jäetakse vaikeväärtus vahele.

**Toetatud formaadid tüübi kaupa:**

| Tüüp | Formaat | Näide |
|---|---|---|
| `string`, `text` | Mis tahes tekst | `draft`, `Untitled` |
| `number` | Arvväärtus | `0`, `100` |
| `boolean` | `true` või `false` (väike/suur täht ei loe) | `true`, `True`, `TRUE` |
| `date` | ISO kuupäev või suhteline nihe | `2025-01-01`, `+1d`, `-7d` |
| `datetime` | ISO kuupäev+kellaaeg või suhteline nihe | `2025-01-01T09:00:00`, `+2h`, `+1d` |
| `reference` | Objekti ID | `6789abc...` |

**Suhtelised nihked `date` ja `datetime` jaoks:**

Kasuta formaati `[+/-][number][unit]`, kus ühik on üks järgmistest:

| Ühik | Tähendus | Näide |
|---|---|---|
| `h` | Tunnid | `+1h`, `-2h` |
| `d` | Päevad | `+1d`, `-7d` |
| `w` | Nädalad | `+2w` |
| `m` | Kuud | `+1m`, `-3m` |
| `y` | Aastad | `+1y` |

Nihe lahendatakse objekti esmaloomisel.

::: tip
Kasuta `+0d`, et vaikeväärtuseks seada tänane kuupäev, või `+1d` homseks.
:::
