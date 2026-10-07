---
description: "Loe API kaudu Entu andmebaasi kasutust ja limiite — objektid, parameetrid, failid, API päringud ja AI tokenid."
---

# Andmebaas

Tagastab andmebaasi kasutuse ja limiidid. Nõuab JWT tokenit, millel on selles andmebaasis kasutaja.

```
GET /api/{db}
```

```json
{
  "organization": [{ "language": "en", "string": "Example Museum" }],
  "entities": { "usage": 15230, "deleted": 412, "limit": 50000 },
  "properties": { "usage": 210554, "deleted": 18320 },
  "requests": { "usage": 1234, "limit": 2000 },
  "tokens": { "usage": 25480, "limit": 100000 },
  "files": { "usage": 5368709120, "deleted": 104857600, "limit": 10000000000 },
  "dbSize": 187695104
}
```

| Väli | Kirjeldus |
|---|---|
| `organization` | Andmebaasi objekti `organization` väärtused |
| `entities` | `usage` — olemasolevad objektid (hinnang); `deleted` — kunagi kustutatud objektid; `limit` — objektide limiit, `0`, kui pole määratud |
| `properties` | `usage` — kehtivad parameetriväärtused; `deleted` — kustutatud väärtused |
| `requests` | `usage` — selle kuu API päringud; `limit` — ainult kuvamise skaala (kasutus, ümardatud üles esimese numbri järgi), mitte jõustatav limiit |
| `tokens` | `usage` — selle kuu [AI](/et/api/ai/) tokenid; `limit` — kuu AI tokenite limiit, 100 000, kui pole määratud |
| `files` | `usage` — kehtivate failide maht baitides; `deleted` — kustutatud, kuid veel salvestuses olevate failide maht baitides; `limit` — salvestusmahu limiit baitides, `0`, kui pole määratud |
| `dbSize` | Andmebaasi andmete ja indeksite maht baitides |

Kuud on UTC kalendrikuud. Tulemus puhverdatakse 5 minutiks, nii et viimased muudatused ei pruugi veel näha olla.
