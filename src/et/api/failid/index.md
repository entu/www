---
description: "Hoia ja serveeri faile Entu API-ga — manused S3-ühilduvas salvestis, ligipääs allkirjastatud ja ajapiiranguga URL-ide kaudu."
---

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

Postita faili metaandmed objektile (`POST /api/{db}/entity/{_id}` — keha on massiiv nagu iga parameetri kirjutamisel). Loodud parameeter tuleb tagasi vastuse massiivis `properties` koos väljaga `upload`, mis sisaldab allkirjastatud URL-i ja nõutavaid päiseid.

```json
[
  {
    "type": "photo",
    "filename": "cover.jpg",
    "filesize": 1937,
    "filetype": "image/jpeg"
  }
]
```

Vastus:
```json
{
  "_id": "6798938432faaba00f8fc72f",
  "properties": [
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
  ]
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

## Pisipildid

### Objekti pisipilt

Loo objekti `photo` parameetri esimesest failist ruudukujuline pisipilt:

```
GET /api/{db}/entity/{_id}/thumbnail/{size}
```

Endpoint võtab esimese `photo` faili, renderdab selle, kärbib keskelt ruuduks (cover-sobitus) ja toodab **JPEG**-i. Toetatud on nii **pildid** (JPEG, PNG, GIF, BMP, TIFF) kui ka **PDF**-failid — PDF-i puhul renderdatakse esimene lehekülg. Üle 25 MB lähtefailid ja üle 40 megapiksli pildid lükatakse tagasi.

Tee `size` peab olema üks lubatud väärtustest (ruudu laius ja kõrgus pikslites):

```
50, 200, 400
```

Mis tahes muu väärtus tagastab `400`. Lubatud väärtuste loend piirab failikohaste vahemällu salvestatud variantide arvu.

Vastus sisaldab ajalimiidiga allkirjastatud välja `url` (kehtib 60 sekundit), sama kujul nagu faili allalaadimine:

```json
{
  "url": "https://s3.amazonaws.com/bucket/path?signature..."
}
```

Loodud pisipildid salvestatakse objektihoidlasse, seega on esimene päring antud faili ja suuruse kohta aeglasem (genereerimine) ning järgmised serveeritakse vahemälust. Igal päringul kehtivad samad juurdepääsureeglid mis lähteobjektil.

| Vastus | Tähendus |
|---|---|
| `200` | JSON `{ url }` allkirjastatud pisipildi URL-iga |
| `400` | Vigane `size`, toetamata failitüüp, liiga suur pilt või faili ei õnnestunud dekodeerida |
| `403` | Puudub juurdepääs objektile |
| `404` | Objekti ei leitud, sellel puudub `photo` või fail puudub salvestusest |
| `413` | Lähtefail on suurem kui 25 MB |

### Parameetri pisipilt

Loo ruudukujuline pisipilt **mis tahes** üksikust failiparameetrist — mitte ainult `photo`-st — viidatuna selle parameetri `_id` järgi:

```
GET /api/{db}/property/{_id}/thumbnail/{size}
```

Kui objekti endpoint kasutab alati objekti esimest `photo` faili, siis see endpoint teeb pisipildi konkreetsest failiparameetrist, millele viitad. Muus osas on käitumine identne: see kärbib keskelt ruuduks (cover-sobitus) ja toodab **JPEG**-i pildist (JPEG, PNG, GIF, BMP, TIFF) või PDF-i esimesest leheküljest. `size` peab olema `50`, `200` või `400` — mis tahes muu väärtus tagastab `400`. Vastus on `{ url }`, 60 sekundit kehtiv allkirjastatud URL, ja loodud pisipildid salvestatakse vahemäluna objektihoidlasse. See toidab kasutajaliideses failinime kohal hõljudes kuvatavat pisipildi eelvaadet.

Igal päringul kehtivad parameetri juurdepääsureeglid — sama juurdepääsukontroll nagu `GET /api/{db}/property/{_id}`.

| Vastus | Tähendus |
|---|---|
| `200` | JSON `{ url }` allkirjastatud pisipildi URL-iga |
| `400` | Vigane `size`, parameeter ei ole eelvaadatav fail (ei ole pilt ega PDF), liiga suur pilt või faili ei õnnestunud dekodeerida |
| `403` | Puudub juurdepääs parameetrile |
| `404` | Parameetrit või selle objekti ei leitud või fail puudub salvestusest |
| `413` | Lähtefail on suurem kui 25 MB |

## Failiparameetri kustutamine

Kustuta failiparameeter samal viisil nagu mis tahes muu parameetriväärtus (vaata [Parameetri kustutamine](/et/api/parameetrid/#parameetri-kustutamine)):

```
DELETE /api/{db}/property/{_id}
```

See teeb parameetrikirje pehmelt kustutatuks (märgistatuna `deleted.at` ja `deleted.by`-ga). Aluseks olevat faili objektisalvestuses ei eemaldata — kustutatakse ainult parameetriviide.
