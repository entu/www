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

Ilma `next` URL-ita (vaata [Kolmanda osapoole rakenduse integratsioon](#kolmanda-osapoole-rakenduse-integratsioon)) tuleb ajutine token tagasi JSON-ina `{ "key": "..." }`. Lisa `lang=en` või `lang=et`, et määrata OAuth.ee sisselogimislehe keel; ilma selleta valib OAuth.ee ise.

Pakkuja tagastab kasutaja ID ja profiiliinfo, mis viiakse vastavusse objekti `entu_user` parameetriga. Esmakordsel sisselogimisel saab isikuobjekti luua automaatselt — vaata [Kasutajad → Kasutajate automaatne loomine](/et/seadistamine/kasutajad/#kasutajate-automaatne-loomine). Sisselogimine, mis ei vasta ühelegi andmebaasile, saab samuti tokeni, tühja `accounts` loendiga; selle tokeniga saab luua uue andmebaasi.

Kutse vastuvõtmiseks lisa ajutise tokeni vahetamisel `invite={INVITE_TOKEN}`: sisselogimine seotakse kutsutud isikuobjektiga ja ilma `db`-ta piiratakse JWT kutse andmebaasiga. Kui sisselogimine on selles andmebaasis juba teise isikuga seotud, kutset vastu ei võeta ja vastuses on `"conflict": "invite"`. Vigane, aegunud või juba kasutatud kutse — või kutse, mis on `db`-st erineva andmebaasi jaoks — lükatakse tagasi veaga `400 Invalid or expired invite`; kasutatud kutse logib sisse ainult isiku, kellele see oli mõeldud.

Pääsuvõti on sisselogimisviis nagu teisedki, Entu pääsuvõtme lehel (`lang` sellele ei rakendu):

- `/api/auth/passkey` logib sisse olemasoleva pääsuvõtmega. Kasutaja tuvastatakse isikuobjekti pääsuvõtme (`entu_passkey`) järgi igas andmebaasis, kus see on.
- `/api/auth/passkey/register` loob kasutaja seadmes uue pääsuvõtme ja logib sellega sisse — kasuta seda registreerumiseks, kutse vastuvõtmiseks uue pääsuvõtmega või oma isikuobjektile pääsuvõtme lisamiseks.

Mõlemad lõpevad ajutise tokeniga `GET /api/auth` jaoks ja võtavad `next` parameetri samamoodi. `uid` on pääsuvõtme ID ja `provider` on `passkey`. Kui pääsuvõtmega võetakse vastu kutse, luuakse isikuobjekt automaatselt või luuakse uus andmebaas, salvestatakse see pääsuvõti isikuobjektile. Pääsuvõti ise nime ei hoia: `user.name` on isiku nimi esimeses andmebaasis tähestiku järjekorras, kus isikul nimi on.

## Autentimise voog

1. Autendi OAuth-pakkuja või API võtmega
2. Vaheta mandaat aadressil `GET /api/auth` JWT tokeni vastu
3. Kasuta JWT-d päisena `Authorization: Bearer <token>` kõigis järgnevates päringutes
4. Uuenda enne 12-tunnise kehtivuse lõppu (vaata [Tokeni uuendamine](#tokeni-uuendamine))

::: warning
JWT tokenid on seotud IP-aadressiga, mida kasutati tokeni väljastamisel. Kui su IP muutub (nt võrgu vahetus, VPN või mobiilroaming), lükatakse token kohe tagasi veaga `401 Invalid token` ja sa pead uuesti autentima. Vahemällu salvesta tokenid IP-konteksti kohta, kui sinu keskkond vahetab sageli aadresse. Erand on [OAuth serveri](#oauth-server) tokenid — need ei ole IP-aadressiga seotud.
:::

::: tip
Vahemällu salvesta JWT ja kasuta seda uuesti päringutes. Mandaadi vahetamine iga kõne puhul on ebaotstarbekas — uuenda ainult siis, kui token läheneb aegumisele.
:::

Iga Entu JWT kannab `use` väidet, mis ütleb, milleks token on. REST API ja MCP avanevad ainult `use: access` tokeniga — need tulevad aadressidelt `GET /api/auth`, `/api/auth/refresh` ja [OAuth serverist](#oauth-server); sessioonitoken või kutse lükatakse seal tagasi. Enne selle väite lisamist väljastatud tokenitel `use` puudub ja neid aktsepteeritakse kuni 2026-11-06.

## Tokeni uuendamine

Uuesti autentimise asemel vaheta veel kehtiv (või hiljuti aegunud) token värske 12-tunnise vastu aadressil `GET /api/auth/refresh`:

```bash
curl -X GET "https://entu.app/api/auth/refresh" \
  -H "Authorization: Bearer YOUR_CURRENT_TOKEN"
```

Vastusel on sama kuju nagu `GET /api/auth` puhul — `accounts`, `user`, `token` ja `expires`. Allkiri ja IP-seos kontrollitakse ning ligipääs kontodele valideeritakse andmebaaside vastu uuesti — pakkuja või pääsuvõtmega sisselogimise korral otsitakse andmebaasid identiteedi järgi uuesti, nii et uuendatud token sisaldab ka pärast sisselogimist lisandunud või loodud andmebaase. Kui ükski andmebaas pole enam ligipääsetav, ebaõnnestub uuendamine veaga `401 No accessible accounts`. IP-seoseta tokenit — [OAuth serveri](#oauth-server) tokenit — uuendada ei saa: see lükatakse tagasi veaga `401 Invalid token`.

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

Sessioonitoken on lühiajaline (5 minutit), ühekordne ja seotud kasutaja brauseri IP-aadressiga. Sinu rakenduse **kasutajaliides** peab selle vahetama täieliku JWT vastu, kutsudes `GET /api/auth` otse brauserist:

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

## OAuth server

Entu on ka OAuth 2.1 autoriseerimisserver. Selle asemel et ise `next` edasi-tagasi käiku hallata, saab sinu rakendus kasutada tavalist OAuth teeki: kasutaja logib sisse Entus, sinu rakendus saab tokeni ja ükski salasõna ei liigu läbi sinu koodi.

Kõik OAuth otspunktid asuvad API päritolul `https://api.entu.app` — `entu.app/api/…` alias siin ei sobi, sest avastusdokumendid peavad olema väljastaja juurkaustas.

::: info
Iga autoriseerimine on seotud ühe andmebaasiga. Anna andmebaasi nimi `db` parameetrina või täielik URL `resource` parameetrina, kus andmebaas on esimene teeosa (nt `https://mcp.entu.app/mydatabase`). `resource` host peab olema API enda domeenis; muud ei arvestata.
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

PKCE on kohustuslik ja aktsepteeritud on ainult `S256`. Kasutaja logib sisse Entus ja seejärel saab sinu `redirect_uri` parameetrid `code` ja `state`.

Ilma `provider` parameetrita küsib OAuth.ee kasutajalt, millist pakkujat kasutada. Selle valiku vahelejätmiseks lisa `&provider={PAKKUJA}` mõne [toetatud pakkujaga](#oauth) — näiteks `&provider=passkey` viib kasutaja otse pääsuvõtmega sisselogimisele. Pääsuvõtmega sisselogimine algab ainult nii.

Tundmatule `client_id` väärtusele või sellele registreerimata `redirect_uri` aadressile vastatakse veaga `400`. Kui mõlemad on korras, saadetakse iga muu probleem — vale `response_type`, puuduv PKCE, puuduv andmebaas, tundmatu pakkuja — tagasi sinu `redirect_uri` aadressile parameetritena `error` ja `error_description` koos sinu `state` väärtusega.

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
  "expires_in": 43200
}
```

`access_token` on tavaline Entu JWT — kasuta seda täpselt nagu ülal kirjeldatud.

::: info
Erinevalt teistest Entu tokenitest ei ole see token IP-aadressiga seotud — sinu server võib koodi vahetada ja token töötab igast masinast. Samal põhjusel ei saa seda uuendada aadressil `/api/auth/refresh` (vaata [Tokeni uuendamine](#tokeni-uuendamine)).
:::

Koodid on ühekordsed ja aeguvad viie minutiga. Kui token aegub, käivita voog uuesti.

## Autentimisparameetrid

Autentimisvolitused salvestatakse parameetritena objektil. Vaikimisi kasutatakse neid isikuobjektidel — iga isikuobjekt esindab inimkasutajat. Kuid samu parameetreid saab lisada mis tahes objektitüübile, mis võimaldab ka automatiseeritud toimijatel autentida. IoT seadistuses `robot` objekt, digitaalreklaami süsteemis `screen` objekt või serveripoolse integratsiooni jaoks mõeldud `service` objekt — kõigil võib olla oma API võti ja kõik saavad iseseisvalt autentida.

### `entu_user`

- Salvestab pakkuja kasutaja ID koos muu OAuth-pakkuja tagastatud infoga (nt e-post)
- Seatakse automaatselt, kui esmakordsel sisselogimisel luuakse uus isikuobjekt
- Selle kirjutamine mis tahes `string` väärtusega salvestab hoopis 24 tundi kehtiva kutse; olemasoleval objektil saadab väärtus `send-invite` kutse lingi ka objekti `email` aadressile (`400 No email`, kui seda pole) — vaata [Kasutajad → Kasutajate lisamine](/et/seadistamine/kasutajad/#kasutajate-lisamine)

### `entu_passkey`

- Salvestab pääsuvõtme ID ja avaliku võtme — privaatvõti ei lahku kunagi kasutaja seadmest
- Lisatakse, kui pääsuvõtmega logitakse sisse kutse vastuvõtmiseks (sh oma isikuobjektil **Lisa sisselogimisviis**), kasutaja automaatsel loomisel või uue andmebaasi loomisel — otse seda kirjutada ei saa; ühel objektil võib olla mitu pääsuvõtit
- Saab kustutada nagu iga parameetri väärtust
- Sama pääsuvõtit saab hoida mitmes andmebaasis, ühe identiteedina üle kogu Entu; pääsuvõtme ID, mis on Entus juba teise avaliku võtmega registreeritud, lükatakse tagasi

### `entu_api_key`

- Loo parameeter mis tahes `string` väärtusega (näiteks `{ "type": "entu_api_key", "string": "generate" }`) — Entu jätab selle kõrvale ja genereerib krüptograafiliselt turvalise 32-märgilise võtme
- Räsi salvestatakse; tavaline võti tagastatakse ainult üks kord, loomise vastuses väljana `string`
- Seda saab lisada ainult objekti `_owner` või objekt ise
- Samal objektil võib olla mitu võtit
