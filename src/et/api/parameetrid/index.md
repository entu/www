---
description: "Entu API parameetriväärtuse objektide viide — millised väljad iga parameetri kohta tagastatakse ja kuidas väärtused on struktureeritud."
---

# Parameetrid

Iga API tagastatav parameetriväärtus on objekt järgmiste väljadega:

| Väli | Kirjeldus |
|---|---|
| `_id` | Selle parameetriväärtuse unikaalne identifikaator. Kasuta seda konkreetse väärtuse kustutamiseks. |
| `type` | Parameetri nimi (vastab definitsiooni nimele, nt `name`, `status`). Objektide lugemisel puudub — seal on parameetri nimi võti, mille all väärtused asuvad. |
| `string` | Stringiväärtus. Olemas `string`, `text` ja `counter` tüüpi parameetrite puhul. |
| `number` | Arvväärtus. Olemas `number` tüüpi parameetrite puhul ning `counter` parameetrite puhul loenduri arvulise osana. |
| `boolean` | Tõeväärtus. Olemas `boolean` tüüpi parameetrite puhul. |
| `date` | Kuupäevaväärtus. Kirjutatakse kujul `YYYY-MM-DD`, tagastatakse ISO 8601 ajatemplina (nt `1999-03-15T00:00:00.000Z`). Olemas `date` tüüpi parameetrite puhul. |
| `datetime` | Kuupäev+kellaaeg väärtus (ISO 8601). Olemas `datetime` tüüpi parameetrite puhul. |
| `reference` | Viidatava objekti ID. Olemas `reference` tüüpi parameetrite puhul. Objekti vastustes on väärtusel ka `string` (viidatava objekti nimi) ja `entity_type` (selle objektitüübi nimi). |
| `filename` | Faili nimi. Olemas `file` tüüpi parameetrite puhul. |
| `filesize` | Faili suurus baitides. Olemas `file` tüüpi parameetrite puhul. |
| `filetype` | MIME tüüp. Olemas `file` tüüpi parameetrite puhul. |
| `language` | Keelekood (nt `en`, `et`). Olemas keelega kirjutatud väärtustel — kasutatakse parameetrite puhul, mille definitsioonil on `multilingual: true`. |
| `created` | Objekt kujul `at` (ISO ajatempel) ja `by` (isikuobjekti ID) — kes selle väärtuse seadistas ja millal. Tagastatakse ainult päringuga `GET /api/{db}/property/{_id}`. |

::: tip
Salvesta nende parameetriväärtuste `_id`, mida võid hiljem uuendada või kustutada. Ilma selleta saad ainult kogu parameetri kustutada või lisada uusi väärtusi olemasolevate kõrvale.
:::

### Näide: objekt koos parameetritega

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "string": "Acme Corp"
    }
  ],
  "status": [
    {
      "_id": "507f1f77bcf86cd799439033",
      "string": "active"
    }
  ],
  "revenue": [
    {
      "_id": "507f1f77bcf86cd799439044",
      "number": 1500000
    }
  ]
}
```

## Parameetrite kirjutamine

Väärtuste loomiseks või uuendamiseks saada POST-iga massiiv parameetriobjektidest:

```json
[
  { "type": "name", "string": "Acme Corp" },
  { "type": "status", "string": "active" },
  { "type": "revenue", "number": 1500000 },
  { "type": "is_active", "boolean": true },
  { "type": "founded", "date": "1999-03-15" },
  { "type": "owner", "reference": "507f1f77bcf86cd799439099" }
]
```

Kasuta väärtuse välja, mis vastab parameetri tüübile (`string`, `number`, `boolean`, `date`, `datetime`, `reference`).

::: warning
Uue objekti loomisel (POST aadressile `/api/{db}/entity`) pead lisama `_type` parameetri, mis viitab objektitüübile. Selle väljajätmine tagastab vea `400`.
:::

## Parameetriväärtuse ülekirjutamine

Konkreetse olemasoleva väärtuse ülekirjutamiseks (mitte uue lisamiseks), lisa POST-i kehasse selle `_id`:

```json
[
  { "_id": "507f1f77bcf86cd799439033", "type": "status", "string": "inactive" }
]
```

See asendab selle täpse parameetriobjekti väärtuse: vana väärtus kustutatakse pehmelt ja uus väärtus saab uue `_id`. Ilma `_id`-ta lisatakse alati uus väärtus olemasolevate kõrvale.

## Mitme väärtusega parameetrid

Kui parameetri definitsioonil on `list: true`, võib sama parameetri nime all eksisteerida mitu väärtust. Iga väärtus on eraldi parameetriobjekt oma `_id`-ga.

**Väärtuse lisamine** — POST-i uus parameetriobjekt:
```json
{ "type": "tag", "string": "priority" }
```

**Konkreetse väärtuse eemaldamine** — DELETE parameetri `_id` järgi:
```
DELETE /api/{db}/property/{_id}
```

## Mitmekeelsed parameetrid

Kui parameetri definitsioonil on `multilingual: true`, on iga keel eraldi parameetriobjekt, mis kannab `language` koodi.

**Lugemine** — API tagastab ühe objekti iga keele kohta:
```json
"description": [
  { "_id": "...", "string": "Overview", "language": "en" },
  { "_id": "...", "string": "Ülevaade", "language": "et" }
]
```

**Kirjutamine** — lisa POST-i korral väli `language`:
```json
[
  { "type": "description", "string": "Overview", "language": "en" },
  { "type": "description", "string": "Ülevaade", "language": "et" }
]
```

Keelekood on täpselt kaks väiketähte (`en`, `et`) — kõik muu lükatakse tagasi.

## Parameetri kustutamine

Kustuta konkreetne parameetriväärtus selle `_id` järgi:

```
DELETE /api/{db}/property/{_id}
```

Tagastab eduka kustutamise korral `{ "deleted": true }`. Kustutamine on pehme kustutamine — parameeter märgistatakse kustutatuks ja arvatakse objektist välja, kuid jääb andmebaasi auditeerimise eesmärgil alles.

### Piirangud

| Parameeter | Reegel |
|---|---|
| Iga parameeter | Nõuab `_editor` õigusi objektil |
| `_type` | Ei saa kustutada |
| Muud `_`-ga algavad süsteemsed parameetrid (nt `_created`) | Ei saa kustutada |
| Serveri hallatavad arveldusparameetrid (`billing_*`) | Ei saa kustutada |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess`, `_sharing`, `_inheritrights`, `_parent` | Nõuab `_owner` õigusi objektil |
| `_owner` (viimane) | Ei saa kustutada — vähemalt üks `_owner` peab jääma |
| `_parent` | Nõuab ka `_expander` õigusi viidataval ülemobjektil |

::: warning
`_type` kustutamine tagastab alati `403`. Objekti tüübi muutmiseks kirjuta olemasolev väärtus üle, saates POST-i koos vana parameetri `_id` ja uue viitega — vaata [Parameetriväärtuse ülekirjutamine](#parameetrivaartuse-ulekirjutamine).
:::
