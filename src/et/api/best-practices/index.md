# API parimad praktikad

Mustrid ja soovitused Entu API-ga tõhusaks töötamiseks.

## Tõhus pärimine

**Kasuta konkreetseid filtreid klientpoolse filtreerimise asemel:**
```http
# Hea — filtreeri serveris
GET /api/{db}/entity?status.string=active&_type.reference=TYPE_ID

# Väldi — kõigi toomine ja klientpoolne filtreerimine
GET /api/{db}/entity?_type.reference=TYPE_ID
```

**Piira tagastatavaid parameetreid vastuse suuruse vähendamiseks:**
```http
GET /api/{db}/entity?props=name,status,_created&limit=100
```

**Kasuta `.in` mitme väärtuse filtreerimiseks ühe päringuga:**
```http
GET /api/{db}/entity?status.string.in=active,pending,review
```

**Kasuta lehitsemist suurte andmekoguste jaoks:**
```http
GET /api/{db}/entity?limit=100&skip=0    # esimene lehekülg
GET /api/{db}/entity?limit=100&skip=100  # teine lehekülg
```

Täieliku filtrisüntaksi kohta vaata [Päringu viide](/et/api/query-reference/).

## Pakettoperatsioonid

Loo objekte mitme parameetriga ühe päringuga, mitte eraldi kõnedena:

```json
[
  { "type": "name", "string": "Toode" },
  { "type": "price", "number": 99.99 },
  { "type": "status", "string": "active" }
]
```

## Failide üleslaadimine

Kasuta alati täpseid MIME-tüüpe:
```json
{ "type": "document", "filename": "report.pdf", "filesize": 1245678, "filetype": "application/pdf" }
```

Lae failid otse S3-sse üles, kasutades allkirjastatud URL-i — ära vahenda faile oma serveri kaudu. Allkirjastatud üleslaadimise URL aegub **60 sekundi** pärast — lõpeta PUT kohe.

## Tokeni haldamine

**Vahemällu salvesta JWT tokenid** — kehtivad 48 tundi. Kasuta neid uuesti, ära küsi operatsiooni kohta uusi. Rakenda aegumise eelse uuendamise loogika.

::: warning
Ära lisa kunagi API võtmeid lähtekoodi. Kasuta keskkonna muutujaid või saladuste haldurit. Kui võti on paljastunud, kustuta see isikuobjektist ja genereeri kohe uus.
:::

## Jõudlus

**Indekseeri sageli päritavaid parameetreid**, lubades parameetri definitsioonil `search`. Süsteemiparameetrid `_type` ja `_parent` on juba indekseeritud.

**Väldi tarbetuid agregatsioone** — tavalised GET-päringud tagastavad vahemällu salvestatud andmeid. Kasuta `GET /api/{db}/entity/{_id}/aggregate` ainult siis, kui vajad pärast väliseid muutusi värskeid valemi väärtusi.

## Vigade käitlemine

**Kontrolli olekukoode:**
- `401` — Uuenda autentimistokenit
- `403` — Kasutajal puuduvad õigused; kontrolli objekti õigusi
- `404` — Objekt/parameeter ei leitud või puudub juurdepääs
- `400` — Kontrolli päringu keha struktuuri

Proovi `5xx` vigu uuesti eksponentsiaalse taandumisega. Ära proovi `4xx` vigu uuesti.

## Turvalisus

- Kasuta ainult HTTPS-i
- Valideeri ja puhasta kasutaja sisend enne parameetrite loomist
- Ära toetu klientpoolsele juurdepääsukontrollile — kontrolli õigused serveripoolselt

::: danger
`_sharing: public` avalikustab objekti andmed kõigile internetis, sealhulgas otsingumootori robotitele. Ära kasuta seda tundlike või sisemiste andmete jaoks.
:::
