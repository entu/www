---
description: "Ühenda Claude, ChatGPT või mõni muu MCP klient Entu andmebaasiga — lugemistööriistad ja elav skeemiressurss, filtreeritud sisselogitud kasutaja õiguste järgi."
---

# MCP server

Entu räägib [Model Context Protocol](https://modelcontextprotocol.io) keelt, nii et AI assistent saab andmebaasi otse lugeda, ilma et sa peaksid andmeid vestlusesse kopeerima. Igal andmebaasil on oma otspunkt:

```
https://mcp.entu.app/{andmebaas}
```

Kõik, mida assistent näeb, on filtreeritud sisselogija õiguste järgi. Ilma tokenita loeb ta ainult avalikke objekte — sama, mida näeks sinu andmebaasi anonüümne külastaja.

## Ühendamine

Enamik kliente vajab vaid URL-i. Claude Code'is:

```bash
claude mcp add --transport http entu https://mcp.entu.app/minuandmebaas
```

Privaatsete andmete jaoks logi sisse. Kliendid, mis toetavad OAuthi — nende seas Claude'i ja ChatGPT konnektorid — avastavad Entu [OAuth serveri](/et/api/autentimine/#oauth-server) URL-i põhjal ja avavad brauseri. Midagi ei kopeerita ja assistent saab ainult sinu enda ligipääsu.

Kui sinu klient OAuthi ei toeta, anna [JWT](/et/api/autentimine/) otse:

```bash
claude mcp add --transport http entu https://mcp.entu.app/minuandmebaas \
  --header "Authorization: Bearer SINU_TOKEN"
```

## Mida assistent teha saab

Viis lugemistööriista, mis peegeldavad [REST API-t](/et/api/paringu-viide/):

| Tööriist | Otstarve |
|---|---|
| `get_entity_type` | Üks objektitüüp ja kõik selle parameetrite definitsioonid |
| `search_entities` | Otsing tüübi, teksti ja parameetrite järgi — kuni 100 korraga, sorteeritult või rühmitatult |
| `get_entity` | Üks objekt ID järgi |
| `get_entity_history` | Kes mida ja millal muutis — vajab objektile otseseid õigusi |
| `get_file_url` | Lühiajaline allalaadimislink failile |

Server on **ainult lugemiseks**. Assistent oskab sinu andmete kohta vastata, neid kokku võtta ja omavahel seostada, aga ei saa midagi luua, muuta ega kustutada — selle asemel annab ta lingi objektile või otse selle muutmise või õiguste paneelile, et saaksid muudatuse ise teha.

## Skeemiressurss

Server pakub ka ressurssi `entu://schema`, mis loetleb kõik objektitüübid ja parameetrite definitsioonid, mida sisselogitud kasutaja näha tohib, koos siltidega igas seadistatud keeles. Assistendid loevad selle enne, kui vastavad küsimustele andmebaasi sisu kohta — just see lubab neil kasutada sinu enda sõnavara: `isik` jääb `isik`uks koos oma tegelike parameetritega, mitte oletuseks selle kohta, milline üks inimese kirje välja näeb.

Loetelu arvestab ka õigusi, nii et kaks sama andmebaasiga ühendunud inimest võivad näha erinevat skeemi.

## Mida oodata

Otsing tagastab korraga kuni 100 objekti. Küsimustele nagu „kümme uusimat", „suurim" või „mitu olekute kaupa" vastatakse sorteerimise või rühmitamisega ühe päringuga; ainult tõeliselt suured kokkuvõtted lappavad tulemusi läbi. Terve objekti asemel konkreetsete parameetrite küsimine hoiab vastused kiired ja jätab vestluses rohkem ruumi vastusele.

Kuna assistent pärib täpselt sinu õigused, võib objekt, mida ta ei leia, olemas olla, aga sulle nähtamatu. "Ei leitud" tähendab assistendi puhul "sulle pole nähtav", mitte "andmebaasis pole".
