---
description: "Autendi Entu API päringud JWT bearer-tokeniga, mis kehtib 12 tundi — kuidas seda hankida ja kasutada."
---

# Autentimine

Kõik API päringud nõuavad JWT tokenit, mis edastatakse päises `Authorization: Bearer <token>`. Tokenid kehtivad 12 tundi. Autentimisvastus sisaldab `expires` välja (ISO 8601 kuupäev-kellaaeg), mis näitab, millal token tuleb uuendada.

## Tokeni hankimine

Iga autentimismeetod lõpeb ühtemoodi: vaheta mandaat aadressil `GET /api/auth` JWT tokeni vastu, seejärel kasuta seda tokenit kõigis järgnevates päringutes.

### API võti

API võtmed on pikaajalised mandaadid, mis sobivad skriptide, CI/CD torujuhtmete ja server-to-server integratsioonide jaoks. Genereeri võti mis tahes objektist, millel on `entu_api_key` parameeter — tavaliselt oma isikuobjektist — seejärel vaheta see tokeniga:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

::: info
Tulemuse JWT piiramiseks ühe andmebaasiga lisa autentimispäringule `?db=mydbname`. Ka `?account=mydbname` kuju on aktsepteeritud ja toimib identselt.
:::

::: warning
Genereeritud API võti kuvatakse ainult üks kord. Kopeeri ja hoia seda turvaliselt — salvestatakse ainult räsi ja seda ei saa uuesti näidata.
:::

Objektil võib olla mitu API võtit. Kustuta üksikuid võtmeid, kui neid enam pole vaja.

### OAuth

Interaktiivsete sessioonide jaoks suuna kasutajad aadressile `/api/auth/{provider}`. Pakkuja autendib kasutaja ja tagastab ajutise tokeni. Vaheta see aadressil `GET /api/auth`:

```bash
curl -X GET "https://entu.app/api/auth" \
  -H "Authorization: Bearer TEMPORARY_OAUTH_TOKEN"
```

Toetatud pakkujad: `e-mail`, `google`, `apple`, `smart-id`, `mobile-id`, `id-card`

Pakkuja tagastab kasutaja ID ja profiiliinfo, mis viiakse vastavusse objekti `entu_user` parameetriga. Esmakordsel sisselogimisel saab isikuobjekti luua automaatselt — vaata [Kasutajad → Kasutajate automaatne loomine](/et/configuration/users/#kasutajate-automaatne-loomine).

## Autentimise voog

1. Autendi OAuth-pakkuja või API võtmega
2. Vaheta mandaat aadressil `GET /api/auth` JWT tokeni vastu
3. Kasuta JWT-d päisena `Authorization: Bearer <token>` kõigis järgnevates päringutes
4. Uuenda enne 12-tunnise kehtivuse lõppu (vaata [Tokeni uuendamine](#tokeni-uuendamine))

::: warning
JWT tokenid on seotud IP-aadressiga, mida kasutati tokeni väljastamisel. Kui su IP muutub (nt võrgu vahetus, VPN või mobiilroaming), lükatakse token kohe tagasi veaga `401 Invalid JWT audience` ja sa pead uuesti autentima. Vahemällu salvesta tokenid IP-konteksti kohta, kui sinu keskkond vahetab sageli aadresse.
:::

::: tip
Vahemällu salvesta JWT ja kasuta seda uuesti päringutes. Mandaadi vahetamine iga kõne puhul on ebaotstarbekas — uuenda ainult siis, kui token läheneb aegumisele.
:::

## Tokeni uuendamine

Uuesti autentimise asemel vaheta veel kehtiv (või hiljuti aegunud) token värske 12-tunnise vastu aadressil `GET /api/auth/refresh`:

```bash
curl -X GET "https://entu.app/api/auth/refresh" \
  -H "Authorization: Bearer YOUR_CURRENT_TOKEN"
```

Vastusel on sama kuju nagu `GET /api/auth` puhul — `accounts`, `user`, `token` ja `expires`. Allkiri ja IP-seos kontrollitakse ning ligipääs kontodele valideeritakse andmebaaside vastu uuesti.

Uuendamine hoiab sessiooni elus, kui uuendad regulaarselt, kuid kehtib kaks piirangut:

- **Jõudeoleku piir (14 päeva)** — mõõdetakse esitatud tokeni enda väljastusajast. Token, mida pole üle 14 päeva uuendatud, lükatakse tagasi veaga `401 Token too old, re-authenticate`. Klient, mis uuendab iga 12-tunnise akna jooksul, ei jõua selle piirini.
- **Absoluutne piir (30 päeva)** — mõõdetakse algsest sisselogimisest, mille token kannab läbi iga uuenduse muutmata. Kui see on üle 30 päeva vana, lükatakse uuendus tagasi veaga `401 Session expired, re-authenticate` ja tuleb uuesti sisse logida — sõltumata sellest, kui tihti uuendasid.

## Kolmanda osapoole rakenduse integratsioon

OAuth voog toetab `next` parameetrit, mis võimaldab välisrakendusel saada tokeni pärast seda, kui kasutaja on Entus autentimise lõpetanud. See on soovitatav lähenemine rakenduste ehitamiseks, mis delegeerivad sisselogimise Entule.

Suuna kasutaja pakkuja URL-ile koos URL-kodeeritud `next` väärtusega:

```
/api/auth/{provider}?next=https://your-app.com/callback?key=
```

Pärast kasutaja autentimist lisab server sessioonitokeni `next` väärtusele ja suunab brauseri sinna:

```
https://your-app.com/callback?key={SESSION_TOKEN}
```

Sessioonitoken on lühiajaline (5 minutit) ja seotud kasutaja brauseri IP-aadressiga. Sinu rakenduse **kasutajaliides** peab selle vahetama täieliku JWT vastu, kutsudes `GET /api/auth` otse brauserist:

```js
const response = await fetch('https://entu.app/api/auth', {
  headers: { Authorization: `Bearer ${sessionToken}` }
})
const { token } = await response.json()
```

Vahetus peab tulema samast brauserist, mis lõpetas sisselogimise — serveripoolne vahetus ebaõnnestub, kuna IP ei lange kokku.

::: warning Turvanõue
Kinnita oma rakenduses alati `next` URL enne tokeni kasutamist. Aktsepteeri ainult HTTPS URL-e ja keeldu suunamisest originaalile, mida sa ei kontrolli.
:::

## Autentimisparameetrid

Autentimisvolitused salvestatakse parameetritena objektil. Vaikimisi kasutatakse neid isikuobjektidel — iga isikuobjekt esindab inimkasutajat. Kuid samu parameetreid saab lisada mis tahes objektitüübile, mis võimaldab ka automatiseeritud toimijatel autentida. IoT seadistuses `robot` objekt, digitaalreklaami süsteemis `screen` objekt või serveripoolse integratsiooni jaoks mõeldud `service` objekt — kõigil võib olla oma API võti ja kõik saavad iseseisvalt autentida.

### `entu_user`

- Salvestab pakkuja kasutaja ID koos muu OAuth-pakkuja tagastatud infoga (nt e-post)
- Seatakse automaatselt, kui esmakordsel sisselogimisel luuakse uus isikuobjekt

### `entu_api_key`

- Loo parameeter ilma väärtuseta — Entu genereerib automaatselt krüptograafiliselt turvalise 32-baidise võtme
- Räsi salvestatakse; tavaline võti tagastatakse ainult üks kord
- Samal objektil võib olla mitu võtit
