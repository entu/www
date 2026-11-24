---
description: "Autendi Entu API päringud JWT bearer-tokeniga, mis kehtib 12 tundi — kuidas seda hankida ja kasutada."
---

# Autentimine

Autenditud API päringud edastavad JWT tokeni päises `Authorization: Bearer <token>` — ilma selleta saab lugeda ainult avalikke andmeid (objektid, millel on `_sharing: public`). Tokenid kehtivad 12 tundi. Autentimisvastus sisaldab `expires` välja (ISO 8601 kuupäev-kellaaeg), mis näitab, millal token tuleb uuendada.

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

Toetatud pakkujad: `passkey`, `apple`, `google`, `e-mail`, `smart-id`, `mobile-id`, `id-card`

Ilma `next` URL-ita (vaata [Kolmanda osapoole rakenduse integratsioon](#kolmanda-osapoole-rakenduse-integratsioon)) tuleb ajutine token tagasi JSON-ina `{ "key": "..." }`. Lisa `lang=en` või `lang=et`, et määrata OAuth.ee sisselogimislehe keel; ilma selleta valib OAuth.ee ise. `passkey` puhul see ei rakendu.

Pakkuja tagastab kasutaja ID ja profiiliinfo, mis viiakse vastavusse objekti `entu_user` parameetriga. Esmakordsel sisselogimisel saab isikuobjekti luua automaatselt — vaata [Kasutajad → Kasutajate automaatne loomine](/et/seadistamine/kasutajad/#kasutajate-automaatne-loomine). Sisselogimine, mis ei vasta ühelegi andmebaasile, saab samuti tokeni, tühja `accounts` loendiga; selle tokeniga saab luua uue andmebaasi.

Kutse vastuvõtmiseks lisa ajutise tokeni vahetamisel `invite={INVITE_TOKEN}`: sisselogimine seotakse kutsutud isikuobjektiga ja ilma `db`-ta piiratakse JWT kutse andmebaasiga. Kui sisselogimine on selles andmebaasis juba teise isikuga seotud, kutset vastu ei võeta ja vastuses on `"conflict": "invite"`. Vigane, aegunud või juba kasutatud kutse — või kutse, mis on `db`-st erineva andmebaasi jaoks — lükatakse tagasi veaga `400 Invalid or expired invite`; kasutatud kutse logib sisse ainult isiku, kellele see oli mõeldud.

Pääsuvõti ise nime ei hoia, seega on `passkey` sisselogimise järel `user.name` isiku nimi esimeses andmebaasis tähestiku järjekorras, kus isikul nimi on.

Entu kasutajatoe töötajatele loetleb vastus eraldi massiivis `support` ka andmebaasid, mille omanik on andnud [kasutajatoe ligipääsu](/et/seadistamine/kasutajad/#entu-kasutajatoe-ligipaas): `[{ "_id": "db", "name": "db", "until": "2026-12-01T10:00:00.000Z", "user": { "_id": "..." } }]`. `user._id` on andmebaasi objekt, mille nimel kasutajatugi seal tegutseb. Need andmebaasid pole kunagi `accounts` loendis ega tokenis: iga päringut kontrollitakse loa vastu, nii et loa lõpetamine mõjub kohe. Kasutajatoeks loetakse ainult Smart-ID sisselogimist ja [OAuth serveri](#oauth-server) token ei ole seda kunagi.

## Autentimise voog

1. Autendi OAuth-pakkuja või API võtmega
2. Vaheta mandaat aadressil `GET /api/auth` JWT tokeni vastu
3. Kasuta JWT-d päisena `Authorization: Bearer <token>` kõigis järgnevates päringutes
4. Enne 12-tunnise kehtivuse lõppu [uuenda](#tokeni-uuendamine) pakkuja või pääsuvõtmega sisselogimist või vaheta API võti uuesti

::: warning
JWT tokenid on seotud IP-aadressiga, mida kasutati tokeni väljastamisel. Kui su IP muutub (nt võrgu vahetus, VPN või mobiilroaming), lükatakse token kohe tagasi veaga `401 Invalid token`. Pakkuja või pääsuvõtmega sisselogimine [uuendab](#tokeni-uuendamine) siis tokenit ja kordab päringut; API võtme puhul vaheta võti uuesti. Erand on [OAuth serveri](#oauth-server) tokenid — need ei ole IP-aadressiga seotud.
:::

::: tip
Vahemällu salvesta JWT ja kasuta seda uuesti päringutes. Mandaadi vahetamine iga kõne puhul on ebaotstarbekas — uuenda ainult siis, kui token läheneb aegumisele või lükatakse tagasi.
:::

Iga Entu JWT kannab `use` väidet, mis ütleb, milleks token on. REST API ja MCP avanevad ainult `use: access` tokeniga — need tulevad aadressidelt `GET /api/auth`, `/api/auth/refresh` ja [OAuth serverist](#oauth-server); sessioonitoken või kutse lükatakse seal tagasi. Enne selle väite lisamist väljastatud tokenitel `use` puudub ja neid aktsepteeritakse kuni 2026-11-06.

## Tokeni uuendamine

Pakkuja või pääsuvõtmega sisselogimine aadressil `GET /api/auth` tagastab ka `refreshToken` väärtuse. Vaheta see värske 12-tunnise tokeni vastu enne, kui vana aegub, või pärast seda, kui see tagasi lükati (näiteks kui su IP muutus):

```bash
curl -X GET "https://entu.app/api/auth/refresh" \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

Vastusel on sama kuju nagu `GET /api/auth` puhul — `accounts`, `support`, `user`, `token`, `expires` — ning lisaks järgmine `refreshToken`. Uus token on seotud IP-aadressiga, kust uuendus tuli. Andmebaasid otsitakse igal uuendamisel sisselogimise järgi uuesti, nii et token sisaldab pärast sisselogimist lisandunud või loodud andmebaase ja jätab välja need, kust sind eemaldati.

Iga uuendustoken töötab ühe korra: salvesta uus ja ära uuenda kahest kohast korraga — juba kasutatud uuendustokeni esitamist käsitletakse vargusena ja see lõpetab sisselogimise. Uuendustoken kehtib 7 päeva ja ükski sisselogimine ei kesta üle 30 päeva, sõltumata sellest, kui tihti seda uuendatakse. Kummagi järel või siis, kui ükski andmebaas pole enam ligipääsetav, ebaõnnestub uuendamine veaga `401 Invalid refresh token` ja kasutaja logib uuesti sisse.

API võti uuendustokenit ei saa — võti ise on pikaajaline mandaat, nii et vaheta see uuesti aadressil `GET /api/auth`. Entu kasutajatugi ei saa seda samuti ja logib tokeni aegudes uuesti sisse, sest uuendustoken töötab igalt aadressilt.

## Väljalogimine

Tühista uuendustoken, et sisselogimine lõpetada ja seda ei saaks kasutada ka siis, kui see on kopeeritud:

```bash
curl -X POST "https://entu.app/api/auth/revoke" \
  -H "Content-Type: application/json" \
  -d '{ "token": "YOUR_REFRESH_TOKEN" }'
```

Juba väljastatud juurdepääsutoken töötab kuni aegumiseni, kõige rohkem 12 tundi. Vastus on `200` sõltumata sellest, kas token veel kehtis. OAuth kliendid kasutavad sama otspunkti — vaata [OAuth kliendi väljalogimine](#oauth-kliendi-valjalogimine).

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

Sessioonitoken on lühiajaline (5 minutit), ühekordne ja seotud kasutaja brauseri IP-aadressiga. Sinu rakenduse **kasutajaliides** peab selle vahetama täieliku JWT vastu, kutsudes `GET /api/auth` otse brauserist:

```js
const response = await fetch('https://entu.app/api/auth', {
  headers: { Authorization: `Bearer ${sessionToken}` }
})
const { token, refreshToken } = await response.json()
```

Vahetus peab tulema samast brauserist, mis lõpetas sisselogimise — serveripoolne vahetus ebaõnnestub, kuna IP ei lange kokku. Hoia `refreshToken` alles, et tokenit [uuendada](#tokeni-uuendamine), ja [tühista](#valjalogimine) see, kui kasutaja välja logib.

::: warning Turvanõue
Kinnita oma rakenduses alati `next` URL enne tokeni kasutamist. Aktsepteeri ainult HTTPS URL-e ja keeldu suunamisest originaalile, mida sa ei kontrolli.
:::

## OAuth server

Entu on ka OAuth 2.1 autoriseerimisserver. Selle asemel et ise `next` edasi-tagasi käiku hallata, saab sinu rakendus kasutada tavalist OAuth teeki: kasutaja logib sisse Entus, sinu rakendus saab tokeni ja ükski salasõna ei liigu läbi sinu koodi.

Kõik OAuth otspunktid asuvad API päritolul `https://api.entu.app` — `entu.app/api/…` alias siin ei sobi, sest avastusdokumendid peavad olema väljastaja juurkaustas.

::: info
Autoriseerimise sidumiseks ühe andmebaasiga anna selle nimi `db` parameetrina või täielik URL `resource` parameetrina, kus andmebaas on esimene teeosa (nt `https://mcp.entu.app/mydatabase`). `resource` host peab olema API enda domeenis; muud ei arvestata. Pärast sisselogimist palub Entu kasutajal alati kinnitada: nimetatud andmebaasi näidatakse üksinda, ilma selleta näeb kasutaja andmebaase, kus ta on kasutaja, ja token kehtib neis, mille ta märgib. Andmebaase, millele tal on ligipääs ainult [kasutajatoe ligipääsu](/et/seadistamine/kasutajad/#entu-kasutajatoe-ligipaas) kaudu, ei pakuta kunagi.
:::

### Avastus

```
GET https://api.entu.app/.well-known/oauth-authorization-server
```

Tagastab otspunktide URL-id. Enamik OAuth teeke pärib selle sinu eest.

### Kliendi registreerimine

Kliendid registreerivad end ise — taotlusvormi ega kliendi salasõna pole.

```bash
curl -X POST "https://api.entu.app/auth/register" \
  -H "Content-Type: application/json" \
  -d '{ "client_name": "Minu rakendus", "redirect_uris": ["https://sinu-rakendus.ee/callback"] }'
```

`redirect_uris` võtab 1 kuni 10 absoluutset URI-d mis tahes skeemiga, nii et natiivrakendused saavad kasutada oma skeemi; `client_name` on valikuline ja lühendatakse 200 märgini. Tagastatud `client_id` kannab endas oma suunamis-URL-e ja kehtib aasta. Salvesta see — igal käivitusel uuesti registreerimine loob asjatult uue.

### Autoriseerimine

Suuna kasutaja brauser aadressile:

```
https://api.entu.app/auth/authorize
  ?client_id={CLIENT_ID}
  &redirect_uri=https://sinu-rakendus.ee/callback
  &response_type=code
  &code_challenge={CHALLENGE}
  &code_challenge_method=S256
  &state={STATE}
  &db={ANDMEBAAS}
```

PKCE on kohustuslik ja aktsepteeritud on ainult `S256`. `db` ei ole kohustuslik (vaata ülal). Kasutaja logib sisse Entus ja seejärel saab sinu `redirect_uri` parameetrid `code` ja `state`. Kui kasutaja kinnituslehel keeldub, saab see hoopis `error=access_denied`.

Ilma `provider` parameetrita näitab Entu oma sisselogimislehte, kus kasutaja valib pakkuja — pääsuvõti kaasa arvatud. Selle valiku vahelejätmiseks lisa `&provider={PAKKUJA}` mõne [toetatud pakkujaga](#oauth) — näiteks `&provider=passkey` viib kasutaja otse pääsuvõtmega sisselogimisele.

Tundmatule `client_id` väärtusele või sellele registreerimata `redirect_uri` aadressile vastatakse veaga `400`. Kui mõlemad on korras, saadetakse iga muu probleem — vale `response_type`, puuduv PKCE, tundmatu pakkuja — tagasi sinu `redirect_uri` aadressile parameetritena `error` ja `error_description` koos sinu `state` väärtusega.

### Koodi vahetamine

```bash
curl -X POST "https://api.entu.app/auth/token" \
  -d "grant_type=authorization_code" \
  -d "code={CODE}" \
  -d "redirect_uri=https://sinu-rakendus.ee/callback" \
  -d "code_verifier={VERIFIER}"
```

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 43200,
  "refresh_token": "eyJhbGciOi..."
}
```

`access_token` on tavaline Entu JWT — kasuta seda täpselt nagu ülal kirjeldatud. Hoia `refresh_token` sama salajasena kui salasõna: sellega uueneb sisselogimine ilma kasutajata.

::: info
Erinevalt teistest Entu tokenitest ei ole see token IP-aadressiga seotud — sinu server võib koodi vahetada ja token töötab igast masinast. Seda uuendatakse uuendustokeniga, mitte aadressil `/api/auth/refresh`.
:::

Koodid on ühekordsed ja aeguvad viie minutiga.

### OAuth tokeni uuendamine

Enne kui juurdepääsutoken aegub, vaheta uuendustoken uue paari vastu:

```bash
curl -X POST "https://api.entu.app/auth/token" \
  -d "grant_type=refresh_token" \
  -d "refresh_token={REFRESH_TOKEN}"
```

Vastusel on sama kuju nagu koodi vahetamisel. Iga uuendustoken töötab ühe korra — salvesta uus, mille vastus tagastab. Juba kasutatud tokeni esitamist käsitletakse vargusena ja see lõpetab sisselogimise, nii et klient ei tohi uuendada kahest kohast korraga.

Andmebaasid kontrollitakse igal uuendamisel uuesti: uus token kehtib ainult neis, mille kasutaja kinnitas ja kus ta on endiselt kasutaja, ning kui ühtegi ei jää, ebaõnnestub uuendamine veaga `invalid_grant`. Uuendustoken kehtib 7 päeva ja ükski sisselogimine ei kesta üle 30 päeva, sõltumata sellest, kui tihti seda uuendatakse — kummagi järel ebaõnnestub uuendamine veaga `invalid_grant` ja kasutaja logib [Autoriseerimise](#autoriseerimine) kaudu uuesti sisse. Juurdepääsutoken ei kehti kunagi kauem kui sisselogimine, nii et viimane võib olla lühem kui 12 tundi.

### OAuth kliendi väljalogimine

```bash
curl -X POST "https://api.entu.app/auth/revoke" \
  -d "token={REFRESH_TOKEN}"
```

Lõpetab sisselogimise, nii et selle uuendustoken lakkab töötamast. Juba väljastatud juurdepääsutoken töötab kuni aegumiseni, kõige rohkem 12 tundi. Vastus on `200` sõltumata sellest, kas token veel kehtis.

## Autentimisparameetrid

Autentimisvolitused salvestatakse parameetritena objektil. Vaikimisi kasutatakse neid isikuobjektidel — iga isikuobjekt esindab inimkasutajat. Kuid samu parameetreid saab lisada mis tahes objektitüübile, mis võimaldab ka automatiseeritud toimijatel autentida. IoT seadistuses `robot` objekt, digitaalreklaami süsteemis `screen` objekt või serveripoolse integratsiooni jaoks mõeldud `service` objekt — kõigil võib olla oma API võti ja kõik saavad iseseisvalt autentida.

Salvestatud väärtusi kasutatakse ainult sisselogimiseks. Kõikjal mujal — API vastustes, GraphQL-is, filtrites, sortimisel, otsingus, valemites ja ajaloos — näidatakse sisselogimisandmetest ainult varjatud kuju:

| Parameeter | Näidatakse |
|---|---|
| `entu_user` | `string`: sisselogimise e-post (ID-kaardi puhul ilma `@eesti.ee`-ta) või pääsuvõtme seadme nimi; `provider`; ootel kutse puhul `invite: true` |
| `entu_api_key` | `string`: `***` |

Ainsad erandid on loomise ja muutmise vastused: uus API võti tagastatakse ühe korra avatekstina ja kutse token tagastatakse ainult isikule endale (**Lisa sisselogimisviis**).

### `entu_user`

- Salvestab ühe sisselogimisviisi: `provider` ja pakkuja kasutaja ID väljana `uid`, koos muu OAuth-pakkuja tagastatud infoga (nt e-post)
- Seatakse automaatselt, kui esmakordsel sisselogimisel luuakse uus isikuobjekt
- Selle kirjutamine mis tahes `string` väärtusega salvestab hoopis 24 tundi kehtiva kutse; olemasoleval objektil saadab väärtus `send-invite` kutse lingi ka objekti `email` aadressile (`400 No email`, kui seda pole) — vaata [Kasutajad → Kasutajate lisamine](/et/seadistamine/kasutajad/#kasutajate-lisamine)
- Sisselogimise väljad seatakse ainult sisselogimisel — kutse vastuvõtmisel (sh oma isikuobjektil **Lisa sisselogimisviis**), kasutaja automaatsel loomisel või uue andmebaasi loomisel — otse neid kirjutada ei saa; ühel objektil võib olla mitu sisselogimisviisi
- Saab kustutada nagu iga parameetri väärtust

### `entu_api_key`

- Loo parameeter mis tahes `string` väärtusega (näiteks `{ "type": "entu_api_key", "string": "generate" }`) — Entu jätab selle kõrvale ja genereerib krüptograafiliselt turvalise 32-märgilise võtme
- Räsi salvestatakse; tavaline võti tagastatakse ainult üks kord, loomise vastuses väljana `string`
- Seda saab lisada ainult objekti `_owner` või objekt ise
- Samal objektil võib olla mitu võtit
