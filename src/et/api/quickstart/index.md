# API kiire algus

Alusta Entu API-ga 5 minutiga. See juhend käib läbi tokeni hankimise, esimese objekti loomise ja andmete pärimise.

## 1. Hangi token

Genereeri API võti oma isikuobjektist Entu kasutajaliideses, seejärel vaheta see JWT tokeniga:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Vastus:

```json
{
  "accounts": [
    {
      "_id": "mydatabase",
      "name": "mydatabase",
      "user": {
        "_id": "npfwb8fv4ku7tzpq5yjarncc",
        "name": "John Doe"
      }
    }
  ],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

JWT token kehtib 48 tundi. Kasuta seda kõigis järgnevates päringutes. OAuth ja Passkey voogude kohta vaata [Autentimine](/et/api/authentication/).

::: tip
Vahemällu salvesta JWT ja kasuta seda uuesti päringutes. Uuenda ainult siis, kui token aegub.
:::

## 2. Loo objekt

Parameeter `_type` on kohustuslik — see viitab objektitüübile, mis määratleb, mis tüüpi objekti lood.

::: info
Objektitüübi ID leidmiseks päri `GET /api/{db}/entity?_type.string=entity&name.string=project` või otsi seda Entu kasutajaliideses objektitüübi lehel.
:::

```bash
curl -X POST "https://entu.app/api/mydatabase/entity" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "_type", "reference": "507f1f77bcf86cd799439011" },
    { "type": "name", "string": "Minu esimene objekt" },
    { "type": "description", "string": "Loodud API kaudu" }
  ]'
```

Vastus tagastab loodud objekti ID ja kõik loodud parameetriobjektid (failiparameetrid sisaldavad ka allkirjastatud S3 üleslaadimise URL-i):

```json
{
  "_id": "6798938432faaba00f8fc72f",
  "properties": {
    "_type": [{ "_id": "...", "reference": "507f1f77bcf86cd799439011" }],
    "name":  [{ "_id": "...", "string": "Minu esimene objekt" }],
    "description": [{ "_id": "...", "string": "Loodud API kaudu" }]
  }
}
```

## 3. Päri objekte

Loetle objekte filtreerimisega:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?_type.reference=507f1f77bcf86cd799439011&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Täistekstotsing:

```bash
curl -X GET "https://entu.app/api/mydatabase/entity?q=test&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. Hangi üksik objekt

```bash
curl -X GET "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Vastus tagastab objekti `entity` võtme all:

```json
{
  "entity": {
    "_id": "6798938432faaba00f8fc72f",
    "name": [{ "_id": "...", "type": "name", "string": "Minu esimene objekt" }]
  }
}
```

## 5. Lisa parameetreid objektile

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "status", "string": "active" },
    { "type": "priority", "number": 5 }
  ]'
```

## 6. Lae fail üles

Loo failiparameeter üleslaadimise URL hankimiseks:

```bash
curl -X POST "https://entu.app/api/mydatabase/entity/6798938432faaba00f8fc72f" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    { "type": "photo", "filename": "image.jpg", "filesize": 245678, "filetype": "image/jpeg" }
  ]'
```

Vastus sisaldab allkirjastatud S3 üleslaadimise URL-i. PUT-i fail otse, kasutades **täpselt vastuses tagastatud päiseid** (ACL, Content-Disposition, Content-Length, Content-Type on kõik nõutavad):

::: tip
`photo` nimelist failiparameetrit kasutab Entu kasutajaliides objekti pisipildina.
:::

```bash
curl -X PUT "SIGNED_S3_URL" \
  -H "ACL: private" \
  -H "Content-Disposition: inline;filename=\"image.jpg\"" \
  -H "Content-Length: 245678" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@image.jpg"
```

::: warning
Allkirjastatud üleslaadimise URL aegub 60 sekundi pärast. Lõpeta PUT kohe pärast URL-i saamist.
:::

## 7. Kustuta parameeter

```bash
curl -X DELETE "https://entu.app/api/mydatabase/property/PROPERTY_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Järgmised sammud

- [Objektid](/et/overview/entities/) — Mõista objekti-parameetri mudelit
- [Päringu viide](/et/api/query-reference/) — Täielik filtrite ja sortimise süntaks
- [Parimad praktikad](/et/api/best-practices/) — Optimeerimisnäpunäited ja mustrid
- [Valemid](/et/api/formulas/) — Arvutatud parameetrid
- [Failid](/et/api/files/) — Failide üleslaadimine ja allalaadimine
