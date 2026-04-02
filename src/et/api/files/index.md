# Failid

Failiparameetrid võimaldavad objektidel salvestada manuseid, dokumente, pilte ja muid binaarseid andmeid. Failid salvestatakse objektisalvestusse (S3-ühilduv) ja neile pääseb ligi allkirjastatud, ajalimiitidega URLide kaudu.

Failide üleslaadimise lubamiseks objektitüübil lisa parameetri definitsioon `type: file` kujul.

## Failiparameetri struktuur

Failiparameetri väärtusel on kolm kohustuslikku metaandmete välja:

| Väli | Kirjeldus |
|---|---|
| `filename` | Faili algne nimi (nt `cover.jpg`, `report.pdf`) |
| `filesize` | Suurus baitides |
| `filetype` | MIME tüüp (nt `image/jpeg`, `application/pdf`) |

Kõik kolm peavad olema failiparameetri loomisel olemas. Igal failiparameetril on oma unikaalne salvestusasukoht, mida identifitseerib selle `_id`.

## Üleslaadimise protsess

Failide üleslaadimine kasutab turvalist kahesammulist voogu:

**1. samm — Loo failiparameeter**

Postita faili metaandmed objektile. API vastab parameetriobjektiga, mis sisaldab välja `upload` allkirjastatud URL-i ja nõutavate päistega.

```json
{
  "type": "photo",
  "filename": "cover.jpg",
  "filesize": 1937,
  "filetype": "image/jpeg"
}
```

Vastus:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "photo",
  "filename": "cover.jpg",
  "filesize": 1937,
  "filetype": "image/jpeg",
  "upload": {
    "url": "https://s3.amazonaws.com/bucket/path?signature...",
    "method": "PUT",
    "headers": {
      "ACL": "private",
      "Content-Disposition": "inline;filename=\"cover.jpg\"",
      "Content-Length": 1937,
      "Content-Type": "image/jpeg"
    }
  }
}
```

**2. samm — Lae fail üles**

PUT-i faili sisu otse allkirjastatud URL-ile, kasutades **täpselt vastuses tagastatud päiseid** — kõik neli on nõutavad:

```bash
curl -X PUT "SIGNED_S3_URL" \
  -H "ACL: private" \
  -H "Content-Disposition: inline;filename=\"cover.jpg\"" \
  -H "Content-Length: 1937" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@cover.jpg"
```

Allkirjastatud üleslaadimise URL aegub **60 sekundi** pärast. Lõpeta S3 PUT enne aegumist. Ühes POST-is on võimalik luua mitu failiparameetrit — igaüks saab vastuses oma `upload` objekti.

::: warning
Kui üleslaadimise URL aegub enne S3 PUT-i lõpetamist, kustuta parameeter ja alusta otsast.
:::

## Allalaadimise protsess

Faili allalaadimiseks tee GET päring parameetri ID järgi:

```
GET /api/{db}/property/{_id}
```

Vastus sisaldab välja `url` ajalimiitidega allkirjastatud URL-iga — kehtib 60 sekundit. Ära vahemällu salvesta ega jaga seda; genereeri iga kord uus.

Otsese brauseri allalaadimise käivitamiseks lisa `?download=true` — see suunab kohe allkirjastatud URL-ile.

## Failiparameetri kustutamine

Kustuta failiparameeter samal viisil nagu mis tahes muu parameetriväärtus:

```
DELETE /api/{db}/property/{_id}
```

See teeb parameetrikirje pehmelt kustutatuks (märgistatuna `deleted.at` ja `deleted.by`-ga). Aluseks olevat faili objektisalvestuses ei eemaldata — kustutatakse ainult parameetriviide.
