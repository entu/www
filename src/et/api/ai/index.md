---
description: "Entu AI assistendi REST-otspunktid — kahesammuline voog, kus vestlus pakub muudatused ja need rakenduvad pärast kinnitust."
---

# AI assistent

Need lõpp-punktid on [Entu AI](/et/configuration/ai/) assistendi aluseks. Voog koosneb kahest sammust: vestluse lõpp-punkt tagastab assistendi vastuse ja — kui ta pakub muudatusi — kirjutamistoimingute ettepaneku, kuid midagi veel ei rakendata. Pärast kasutaja kinnitust edastatakse ettepaneku toimingud muutmata kujul käivitamise lõpp-punktile, mis need rakendab.

Mõlemad lõpp-punktid nõuavad JWT tokenit päises `Authorization: Bearer <token>` ja töötavad kutsuva kasutaja õigustega — assistent näeb ja saab muuta ainult seda, mida kasutaja saaks näha ja muuta käsitsi.

## Vestlus

Saadab vestluse assistendile ja tagastab tema vastuse. Assistent saab lugeda konto seadistust ja andmeid ning pakkuda (kuid mitte kunagi rakendada) kirjutamistoiminguid.

```
POST /api/{db}/ai/chat
```

| Parameeter | Asukoht | Kirjeldus |
|---|---|---|
| `db` | tee | Andmebaasi nimi |

Päringu keha:

```json
{
  "messages": [
    { "role": "user", "content": "Lisa isikule sünniaasta parameeter" }
  ]
}
```

| Väli | Kirjeldus |
|---|---|
| `messages` | Vestluse ajalugu, uusim viimasena — 1 kuni 40 sõnumit. Igal sõnumil on `role` (`user` või `assistant`) ja `content` (maksimaalselt 8000 tähemärki). Kõigi sõnumite sisu kokku on piiratud 100 000 tähemärgiga. |

Vestlusi serveris ei säilitata — saada iga päringuga kogu ajalugu.

Vastus — assistendi vastus, valikuliselt koos pakutud toimingutega:

```json
{
  "message": "Lisan objektitüübile person sünniaasta parameetri.",
  "proposal": {
    "operations": [
      {
        "op": "add_property_definition",
        "tempId": "$1",
        "params": { "...": "..." },
        "description": "Lisa numbriparameeter \"birthyear\" objektitüübile \"person\""
      }
    ]
  }
}
```

- `message` — assistendi vastuse tekst
- `proposal` — olemas ainult siis, kui assistent pakkus kirjutamistoiminguid
- `op` — toimingu tüüp, üks allolevatest tüüpidest
- `tempId` — ajutine id (`$1`, `$2`, …), millele hilisemad toimingud võivad viidata, nt uus parameetri definitsioon, mis osutab samas ettepanekus varem loodud objektitüübile
- `params` — toimingu parameetrid, mille genereerib assistent
- `description` — inimloetav kirjeldus, mis kuvatakse kasutajale ülevaatamiseks

Toimingute tüübid:

| Toiming | Kirjeldus |
|---|---|
| `create_entity_type` | Loo uus objektitüüp |
| `add_property_definition` | Lisa objektitüübile parameetri definitsioon |
| `create_entity` | Loo andmeobjekt |
| `update_entity` | Muuda andmeobjekti parameetreid |
| `delete_property` | Kustuta parameetri väärtus |

Vead:

| Staatus | Kirjeldus |
|---|---|
| `400` | Vigane päringu keha (puuduvad, vigased või limiiti ületavad sõnumid) |
| `402` | Kuu AI tokenite limiit on täis |
| `403` | Autentimata |
| `502` | AI-teenus tagastas vea |

## Käivitamine

Rakendab kinnitatud ettepaneku. Edasta vestluse vastuse `operations` massiiv **muutmata kujul** — toimingud valideeritakse uuesti ja käivitatakse järjest kutsuva kasutaja õigustes.

```
POST /api/{db}/ai/execute
```

| Parameeter | Asukoht | Kirjeldus |
|---|---|---|
| `db` | tee | Andmebaasi nimi |

Päringu keha:

```json
{
  "operations": [
    {
      "op": "add_property_definition",
      "tempId": "$1",
      "params": { "...": "..." },
      "description": "Lisa numbriparameeter \"birthyear\" objektitüübile \"person\""
    }
  ]
}
```

| Väli | Kirjeldus |
|---|---|
| `operations` | Toimingud vestluse ettepanekust — 1 kuni 25 kirjet, käivitatakse järjekorras |

Vastus:

```json
{
  "results": [
    { "tempId": "$1", "_id": "6798938432faaba00f8fc72f", "op": "add_property_definition" }
  ]
}
```

- `results` — edukalt rakendatud toimingud järjekorras; `_id` on mõjutatud objekti id (puudub `delete_property` puhul)
- `error` — olemas, kui käivitamine peatus ebaõnnestunud toimingul: `{ index, statusCode, statusMessage }`

::: warning
Käivitamine peatub esimesel tõrkel ja juba rakendatud toiminguid **ei** võeta tagasi. Kui `error` on olemas, on toimingud enne `error.index`-it rakendatud, toiming kohal `error.index` ebaõnnestus ja ülejäänud jäeti vahele.
:::

Vead:

| Staatus | Kirjeldus |
|---|---|
| `400` | Vigane toimingute massiiv |
| `403` | Autentimata |
