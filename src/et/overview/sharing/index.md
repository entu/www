---
description: "Kavandatav funktsioon objektide jagamiseks Entu andmebaaside vahel, avaldatud tagasiside kogumiseks enne teostust."
---

# Objektide jagamine andmebaaside vahel

::: warning Kontseptsiooni ettepanek
See leht kirjeldab kavandatavat funktsionaalsust. Midagi siin kirjeldatust ei ole veel teostatud — leht on avaldatud disaini kohta tagasiside kogumiseks.
:::

Igal Entu kontol on oma eraldiseisev andmebaas. See eraldatus on põhigarantii — kuid mõned organisatsioonid soovivad teha valitud objektid üksteisele nähtavaks. Raamatukogud tahavad ühist raamatute kataloogi. Muuseumid tahavad ühisvaadet oma kogudele. Organisatsioonide rühm võib soovida "turuplatsi", kus esemeid saab sirvida, kommenteerida ning laenutamiseks või vahetamiseks taotleda.

Objektide jagamine teeb selle võimalikuks eraldatust nõrgendamata: ühe andmebaasi objekti saab **peegeldada** teise andmebaasi, hoides seda automaatselt sünkroonis, samal ajal kui originaal ei lahku kunagi oma kodust.

## Kuidas see töötab

Kaks andmebaasi loovad **ühenduse** — kumbki pool loob oma andmebaasis ühe ühenduse objekti, seega nõuab jagamine alati vastastikust nõusolekut ja kumbki pool saab selle lõpetada, kustutades oma poole. Edasi ei ole midagi uut õppida: omanik annab ühendusele objektil **vaataja õigused** täpselt samamoodi nagu inimesele. Sünkroonimismootor märkab õigust ja loob vastuvõtvasse andmebaasi **peegelobjekti** — kirjutuskaitstud koopia kokkulepitud omadustest. Õiguse eemaldamine eemaldab peegelobjekti.

## Ühenduse paar

**`share_out`** — lähteandmebaasis: *"olen nõus saatma"*.

| Omadus | Tähendus |
|---|---|
| `name` | Õiguste dialoogis kuvatav nimi, nt "Turuplats" |
| `database` | Sihtandmebaasi nimi |
| `type` | Milliseid objektitüüpe võib jagada |
| `property` | Millised omadused võivad liikuda |

**`share_in`** — sihtandmebaasis: *"võtan vastu"*.

| Omadus | Tähendus |
|---|---|
| `name` | Kuvatav nimi, nt "Tartu raamatukogu" |
| `database` | Lähteandmebaasi nimi |
| `type` | Milliseid objektitüüpe vastu võtan |
| `property` | Milliseid pakutud omadusi vastu võtan |
| `parent` | Kohalik objekt (või mitu), mille alla peegelobjektid paigutatakse |
| `sharing` | Peegelobjektidele rakendatav nähtavus (`private` / `domain` / `public`) |
| `inherit` | Kui määratud, pärivad peegelobjektid nähtavuse õigused ka oma ülemobjektidelt |

`type` ja `property` loendid viitavad andmebaasi **enda definitsiooniobjektidele**, seega on lame loend üheselt mõistetav — omadus nimega `aasta` *raamatu* all on erinev definitsioon kui sama nimi *kunstiteose* all. Mootor teisendab mõlemad pooled tüübi ja omaduse nimedeks ning sünkroonib nende **ühisosa**: lähteandmebaas otsustab, mis võib lahkuda; vastuvõtja otsustab, mida ta vastu võtab, kuhu peegelobjektid paigutuvad ja kes neid näeb.

## Ühenduse loomine kutselingiga

Keegi ei pea seadistust käsitsi kopeerima. Jagav andmebaas genereerib oma `share_out` objektist **allkirjastatud lingi**; link kannab pakkumist — lähteandmebaasi nime ning pakutavate tüüpide ja omaduste nimesid. Vastuvõtja avab lingi, logib sisse, valib vastuvõtva andmebaasi, valib mida vastu võtta ja kuhu peegelobjektid paigutada, ning kinnitab. Tema `share_in` luuakse tema enda andmebaasis täpselt tema valikutega — võõrasse andmebaasi ei looda kunagi ühtegi objekti.

Lingid on olemuselt madala riskiga: need aeguvad, vananenud pakkumine saab kõige rohkem loetleda asju, mida lähteandmebaas enam ei saada (ja need ei sünkroonita midagi), ning lekkinud link on teistele kasutu, sest `share_out` nimetab oma sihtandmebaasi. Kokkuleppe hilisem muutmine ei vaja uut linki — kumbki pool muudab oma poolt igal ajal ja peegelobjektid arvutatakse ümber. Uut linki on vaja ainult laienenud pakkumise näitamiseks vastuvõtjale.

## Objektide jagamine

Anna ühendusele objektil `_viewer` õigus — sama dialoog ja sama mehhanism nagu inimesega jagamisel. Kaks tuttavat reeglit toimivad automaatselt:

- **Õiguste pärimine toimib.** Vaataja õigus ülemobjektil, mille alam-objektidel on `_inheritrights`, jagab kogu haru — ühe õigusega saab avaldada terve kogu.
- **`_noaccess` toimib.** Üksikuid alam-objekte saab päritud jagamisest välja jätta.

Ühenduse jaoks on tähenduslik ainult `_viewer`; muud õigused lükatakse tagasi — peegeldamine on rangelt ühesuunaline.

## Peegelobjektid

Peegelobjekt on vastuvõtva andmebaasi objekt kolme teadliku disainivalikuga:

**Sama `_id` mis originaalil.** Id-d on globaalselt unikaalsed, seega kasutab peegelobjekt originaali oma. Jaga → lõpeta → jaga uuesti annab alati sama identiteedi ning kõik, mis peegelobjektile viitas, taastub automaatselt.

**Kopeeritakse ainult objekti dokument — mitte omaduste dokumendid.** Peegelobjekt kannab projekteeritud väärtusi ning välju `_origin_db` (päritolu) ja `_origin_hash` (muudatuste tuvastus). Omaduste ajalugu jääb originaali juurde. Otsene kirjutamine peegelobjektile lükatakse tagasi viitega originaalile.

**Kirjutuskaitstud sisu, kohalik kontekst.** Vastuvõttev andmebaas saab peegelobjektile lisada omi **alam-objekte** — kommentaare, taotlusi, märkmeid. Need on tavalised kohalikud objektid ega sünkroniseeru kuhugi.

Peegelobjektide õigused määravad ainult **nähtavuse**, tuletatuna `share_in` seadetest: `sharing` tase ning, kui `inherit` on määratud, seadistatud ülemobjektidelt päritud õigused. Vastuvõtja haldab peegelobjektide nähtavust nagu iga muud kogumit — määrates õigused ülemobjektil. Kuid isegi kasutaja, kes saab pärimise kaudu toimetaja või omaniku taseme, ei saa peegelobjekti muuta; päritolu kaitse on õigustest tugevam.

### Millised süsteemsed omadused liiguvad?

| Omadus | Liigub? | Märkused |
|---|---|---|
| `_id` | jah | Sama id mis originaalil |
| `_type` | teisendatakse | Leitakse nime järgi sihtandmebaasi enda objektitüübi definitsioon |
| `_parent` | tingimuslikult | Säilib, kui ülemobjekt on samuti peegeldatud (harud säilitavad hierarhia); muidu kasutatakse `share_in` ülemobjekti |
| `_created` | jah | Originaali loomisaeg |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess` | mitte kunagi | Õigused ei liigu; peegelobjekti nähtavus tuleb `share_in` seadetest |
| `_sharing`, `_inheritrights` | mitte kunagi | Vastuvõtja otsustab oma nähtavuse ise |
| `_deleted` | mitte kunagi | Kustutamine originaalis eemaldab hoopis peegelobjekti |

### Viited

Kuna peegelobjektid säilitavad originaali id-d, kopeeritakse viiteomadused muutmata kujul:

- Kui viidatud objekt on samuti jagatud, toimib viide sihtandmebaasis.
- Kui ei ole, kuvatakse see tavalise tekstina (kuvanimi salvestatakse väärtuse kõrvale).
- Kui viidatud objekt jagatakse *hiljem*, hakkab viide kohe toimima.

## Sünkroonimine ja elutsükkel

Mootor töötab olemasoleva taustatöötleja sees — iga omaduse muudatus paneb objekti niigi ümberarvutamise järjekorda ja jagamine lisab viimase sammu:

1. **Tuvasta** — kas objekti ligipääsuloendis on `share_out` ühendus?
2. **Kontrolli** — kas ühenduse paar on aktiivne ja kas objekti tüüp on mõlemal pool vastu võetud?
3. **Projekteeri** — jäta alles ainult kokkulepitud omadused. Ligipääsuvõtmed ja õigused ei liigu kunagi, sõltumata seadistusest.
4. **Kirjuta** — lisa või uuenda peegelobjekt sihtandmebaasis; kui midagi ei muutunud, jäetakse vahele.
5. **Eemalda** — kui kontroll ebaõnnestub, aga peegelobjekt on olemas, siis see eemaldatakse.

Kõik jagamise lõppemise viisid — vaataja õigus eemaldatud, originaal kustutatud, kokkulepe kitsendatud, ühendus lõpetatud — jõuavad samasse eemaldamise sammu. Kohalikke alam-objekte ei puututa kunagi: need jäävad ootele ja taastuvad, kui objekt jagatakse uuesti sama `_id` all. Kui ühenduse paar muutub aktiivseks, sünkroonib ühekordne läbikäik kõik juba jagatud objektid; kui paar muutub mitteaktiivseks, eemaldatakse kõik selle peegelobjektid.

## Turvagarantiid

- Nõusolek on vastastikune ja kummagi poole poolt sõltumatult tagasivõetav, kumbki oma andmebaasis, kohese mõjuga.
- Peegeldamine on rangelt ühesuunaline; kirjutusõigus ei ületa kunagi andmebaasi piiri.
- Ligipääsuvõtmeid (API võtmed, pääsuvõtmed) ja õigusi ei saa kunagi jagada — see on tagatud mootoris, mitte seadistuses.
- Midagi ei liigu, kui lähteandmebaas pole seda pakkunud *ja* õigust andnud *ja* vastuvõtja seda vastu võtnud.

## Näide: turuplats

Rühm raamatukogusid ja muuseume loob ühise `market` andmebaasi. Iga asutus loob sellega ühenduse ja annab ühendusele vaataja õigused esemetel, mida soovib välja panna — peegelobjektidest saab kataloog, mis on otsitav nagu iga Entu andmebaas. Külastajad logivad sisse oma olemasoleva Entu identiteediga ja sirvivad; kommentaarid ja laenutustaotlused on peegelobjektide kohalikud alam-objektid. Vastassuunaline ühendus võib jagada iga taotluse tagasi omaniku enda andmebaasi, nii et töötajad käsitlevad taotlusi oma Entust lahkumata.

## Lahtised küsimused

- **Failid ja pildid** — failiomadused viitavad lähtekonto failihoidla objektidele; peegelobjektid vajavad kas vahendajat, mis kontrollib ligipääsu originaali juures, või sünkroonimisel tehtavaid pisipiltide koopiaid.
- **Peegelobjektipõhine nähtavus** — esimeses versioonis kehtib ühenduse kõigile peegelobjektidele üks nähtavus; objektipõhised erandid nõuaksid kohalike õiguste liitmist sünkroonitud dokumendiga.
- **Tüüpide vastendamine** — esimene versioon eeldab sama tüübinime mõlemal pool; selgesõnaline lähtetüüp → sihttüüp vastendamine võib lisanduda hiljem.

Tagasiside on teretulnud — selle disaini eesmärk on teha organisatsioonidevaheline koostöö võimalikuks nii, et iga andmebaas jääb oma andmete üle täielikult otsustajaks.
