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

Kolm lugemistööriista, mis peegeldavad [päringu API-t](/et/api/paringu-viide/):

| Tööriist | Otstarve |
|---|---|
| `get_entity_type` | Üks objektitüüp ja kõik selle parameetrite definitsioonid |
| `search_entities` | Otsing tüübi, teksti ja parameetrite järgi, 20 tulemust korraga |
| `get_entity` | Üks objekt ID järgi |

Server on **ainult lugemiseks**. Assistent oskab sinu andmete kohta vastata, neid kokku võtta ja omavahel seostada, aga ei saa midagi luua, muuta ega kustutada.

## Skeemiressurss

Server pakub ka ressurssi `entu://schema`, mis loetleb kõik objektitüübid ja parameetrite definitsioonid, mida sisselogitud kasutaja näha tohib, koos siltidega igas seadistatud keeles. Assistendid loevad selle enne, kui vastavad küsimustele andmebaasi sisu kohta — just see lubab neil kasutada sinu enda sõnavara: `isik` jääb `isik`uks koos oma tegelike parameetritega, mitte oletuseks selle kohta, milline üks inimese kirje välja näeb.

Loetelu arvestab ka õigusi, nii et kaks sama andmebaasiga ühendunud inimest võivad näha erinevat skeemi.

## Mida oodata

Otsingutulemused on piiratud 20 objektiga korraga, nii et tuhandete kirjete kokkuvõtte küsimisel lappab assistent neid läbi või töötab valimi pealt. Küsi konkreetseid parameetreid terve objekti asemel, kui vastus vajab vaid mõnda välja — see on kiirem ja jätab vastuse jaoks rohkem ruumi.

Kuna assistent pärib täpselt sinu õigused, võib objekt, mida ta ei leia, olemas olla, aga sulle nähtamatu. "Ei leitud" tähendab assistendi puhul "sulle pole nähtav", mitte "andmebaasis pole".
