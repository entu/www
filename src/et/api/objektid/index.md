---
description: "Entu API otspunktid objekti dubleerimiseks, selle muudatuste ajaloo lugemiseks ja isiku tehtud muudatuste loetlemiseks."
---

# Objektid

Objekte loetletakse päringuga [`GET /api/{db}/entity`](/et/api/paringu-viide/) ja kirjutatakse nii, nagu on kirjeldatud lehel [Parameetrid](/et/api/parameetrid/). Allolevad otspunktid dubleerivad objekti ja loevad selle muudatuste ajalugu. Kõik need nõuavad JWT tokenit päises `Authorization: Bearer <token>`.

## Dubleerimine

Loob objektist koopiad.

```
POST /api/{db}/entity/{_id}/duplicate
```

Päringu keha — kohustuslik; vaikeväärtuste jaoks saada `{}`:

```json
{
  "count": 3,
  "ignoredProperties": ["code"]
}
```

| Väli | Kirjeldus |
|---|---|
| `count` | Koopiate arv, 1 kuni 100 (vaikimisi: 1) |
| `ignoredProperties` | Parameetrinimed, mida ei kopeerita (vaikimisi: puuduvad) |

Vaja on `_owner` õigusi objektile ja `_expander` õigusi igale kopeeritavale `_parent`-ile.

Kopeeritakse iga kehtiv parameetriväärtus — ka `_parent`, `_sharing` ja õiguste parameetrid — ning sind lisatakse `_owner`-iks. Loenduri väärtused kopeeritakse nii, nagu need on, uusi numbreid ei anta. Valemite väärtusi ei kopeerita; iga koopia arvutab enda omad. Nagu iga uus objekt, saab koopia ka objektitüübi vaikimisi ülemobjektid ja nende parameetrite vaikeväärtused, mida tal pole. Ei kopeerita: faile, `entu_user`, `entu_api_key` ja `entu_passkey` volitusi, arveldusparameetreid, `_created`-i (iga koopia saab oma), `_mid`-i ega `ignoredProperties` nimesid. Dubleerimine ei käivita [veebikonkse](/et/seadistamine/pluginad/#pluginate-tuubid).

Vastus on massiiv, milles on iga koopia kohta üks element samal kujul nagu `POST /api/{db}/entity` vastus: uus `_id` ja kirjutatud `properties`.

## Ajalugu

Tagastab objekti parameetriväärtuste muudatuste logi, vanimad eespool.

```
GET /api/{db}/entity/{_id}/history
```

| Parameeter | Asukoht | Kirjeldus |
|---|---|---|
| `limit` | query | Tagastatavate kirjete arv, 1 kuni 1000 (vaikimisi: 100); suuremad väärtused piiratakse |
| `skip` | query | Vahele jäetavate kirjete arv (vaikimisi: 0) |

```json
{
  "changes": [
    {
      "type": "status",
      "at": "2025-01-28T08:21:25.637Z",
      "by": "6798938432faaba00f8fc72f",
      "old": { "_id": "...", "string": "draft" },
      "new": { "_id": "...", "string": "active" }
    }
  ],
  "count": 14
}
```

- `type` — parameetri nimi
- `at`, `by` — millal ja kes (isikuobjekti ID või serveri muudatuste puhul `entu`), kui see on salvestatud
- `old` — eemaldatud väärtus, `new` — lisatud väärtus; sama `type`, `at` ja `by` väärtusega eemaldamine ja lisamine on üks kirje mõlemaga
- `count` — kirjete koguarv

Viiteväärtuste `string` sisaldab viidatud objekti nime. Volituste väärtused on varjatud. `_created` ja `_mid` jäetakse välja.

Ajaloo lugemiseks on vaja omaenda õigusi objektile — otse määratud või `_inheritrights` kaudu päritud. `domain` või `public` [jagamise](/et/ulevaade/objektid/#jagamine) kaudu lugemisest ei piisa, sest ajalugu võib näidata väärtusi, mis on vahepeal peidetud; sellised päringud saavad vastuseks `403`.

## Tegevused

Tagastab muudatused, mille objekt — tavaliselt isik — on teinud, uusimad eespool.

```
GET /api/{db}/entity/{_id}/activity
```

| Parameeter | Asukoht | Kirjeldus |
|---|---|---|
| `limit` | query | Tagastatavate kirjete arv, 1 kuni 1000 (vaikimisi: 100); suuremad väärtused piiratakse |
| `skip` | query | Vahele jäetavate kirjete arv, 0 kuni 10 000 (vaikimisi: 0); suuremad väärtused piiratakse |

Vastus on `{ "changes": [...] }` samade kirjetega nagu [Ajaloos](#ajalugu), igaühel lisaks `entity` objekt — muudetud objekti `_id` ja `name`. `count`-i pole.

Loetletakse ainult muudatused objektidel, millele sul on omaenda õigused (nagu Ajaloo puhul). Objekt, mille tegevusi küsid, peab olema sulle loetav; muidu on vastus `404`.
