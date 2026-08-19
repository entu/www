---
description: "Objektide kirjutuskaitstud peegeldamine Entu andmebaaside vahel, seadistatav share_out ja share_in objektidega."
---

# Objektide jagamine andmebaaside vahel

Igal Entu kontol on oma eraldiseisev andmebaas. See eraldatus on põhigarantii — kuid organisatsioonid soovivad mõnikord teha valitud objektid üksteisele nähtavaks: raamatukogud ühise raamatute kataloogi, muuseumid ühisvaate oma kogudele, organisatsioonide rühm turuplatsi.

Objektide jagamine teeb selle võimalikuks eraldatust nõrgendamata. Ühe andmebaasi objekti saab **peegeldada** teise: vastuvõttev andmebaas saab kokkulepitud omadustest kirjutuskaitstud koopia, mida hoitakse automaatselt sünkroonis, samal ajal kui originaal ei lahku kunagi oma kodust. Peegelobjektid on otsitavad ja sirvitavad nagu iga kohalik objekt ning kohalikud objektid saavad neile viidata — kuid vastuvõtvas andmebaasis ei saa peegelobjekti juures midagi muuta. Originaal jääb ainsaks muutmise kohaks.

## Seadistamine

Jagamine käib üle **ühenduse**: kaks tavalist objekti, üks kummaski andmebaasis. Andmed liiguvad ainult siis, kui mõlemad on olemas, seega nõuab jagamine alati vastastikust nõusolekut — ja kumbki pool saab selle lõpetada, kustutades oma poole.

**`share_out`** — jagavas andmebaasis: *"olen nõus saatma"*.

| Omadus | Tähendus |
|---|---|
| `name` | Õiguste dialoogis kuvatav nimi, nt "Turuplats" |
| `database` | Vastuvõtva andmebaasi nimi |
| `type` | Milliseid objektitüüpe võib jagada |
| `property` | Millised omadused võivad liikuda |

**`share_in`** — vastuvõtvas andmebaasis: *"võtan vastu"*.

| Omadus | Tähendus |
|---|---|
| `name` | Kuvatav nimi, nt "Tartu raamatukogu" |
| `database` | Jagava andmebaasi nimi |
| `type` | Milliseid objektitüüpe vastu võtan |
| `property` | Milliseid pakutud omadusi vastu võtan |
| `parent` | Kohalik objekt (või mitu), mille alla peegelobjektid paigutatakse |
| `sharing` | Peegelobjektidele rakendatav nähtavus (`private` / `domain` / `public`) |
| `inherit` | Kui määratud, pärivad peegelobjektid nähtavuse õigused ka oma ülemobjektidelt |

`type` ja `property` loendid viitavad andmebaasi **enda definitsiooniobjektidele**. Pakkumine on täpne — omadus nimega `aasta` *raamatu* all on erinev definitsioon kui sama nimi *kunstiteose* all ning pakutakse ainult loetletud paare. Vastuvõtmine käib nime järgi: vastuvõetud omadus kehtib igal vastuvõetud tüübil, mis seda pakub. Sama kahe andmebaasi vahel võib olla mitu kattuvat ühendust — peegeldatakse kõik, mida jagatakse ükskõik millise kaudu, ning vastuvõtja seaded liituvad: peegelobjektid paigutatakse kõigi seadistatud ülemobjektide alla, saavad kõige avatuma nähtavuse ja pärivad õigusi, kui kasvõi üks `share_in` seda määrab.

Kui ühendus on olemas, jaga objekte, andes `share_out` objektile **vaataja õigused** — sama dialoog ja sama mehhanism nagu inimesega jagamisel:

- **Õiguste pärimine toimib.** Vaataja õigus ülemobjektil, mille alam-objektidel on `_inheritrights`, jagab kogu haru — ühe õigusega saab avaldada terve kogu.
- **`_noaccess` toimib.** Üksikuid alam-objekte saab päritud jagamisest välja jätta.

Õiguse eemaldamine eemaldab peegelobjekti. `_viewer` on ühenduse jaoks loomulik õigus; iga muu õigus tähendab sedasama, sest ühendus ei ole kunagi tegutseja — peegeldamine on igal juhul rangelt ühesuunaline.

## Mida üle kantakse

Üle liiguvad ainult kokkulepitud omadused — pakkumine, filtreerituna vastuvõtuga. Ligipääsuvõtmed (API võtmed, pääsuvõtmed), õigused, süsteemsed seaded (arvelduspiirangud) ja failiväärtused ei liigu kunagi, sõltumata seadistusest.

Süsteemseid omadusi käsitletakse ükshaaval:

| Omadus | Liigub? | Märkused |
|---|---|---|
| `_id` | jah | Sama id mis originaalil |
| `_type` | teisendatakse | Leitakse nime järgi vastuvõtja enda objektitüübi definitsioon |
| `_parent` | tingimuslikult | Säilib, kui ülemobjekt on samuti peegeldatud (harud säilitavad hierarhia); muidu kasutatakse `share_in` ülemobjekti |
| `_created` | jah | Originaali loomisaeg |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess` | mitte kunagi | Õigused ei liigu; peegelobjekti nähtavus tuleb `share_in` seadetest |
| `_sharing`, `_inheritrights` | mitte kunagi | Vastuvõtja otsustab oma nähtavuse ise |
| `_deleted` | mitte kunagi | Kustutamine originaalis eemaldab hoopis peegelobjekti |

Kuna peegelobjektid säilitavad originaali id-d, kopeeritakse viiteomadused muutmata kujul:

- Kui viidatud objekt on samuti jagatud, toimib viide vastuvõtvas andmebaasis.
- Kui ei ole, kuvatakse see tavalise tekstina (kuvanimi salvestatakse väärtuse kõrvale).
- Kui viidatud objekt jagatakse *hiljem*, hakkab viide kohe toimima.

Peegelobjekt ise on objekt kolme teadliku disainivalikuga. Tal on **sama `_id` mis originaalil**, seega jaga → lõpeta → jaga uuesti annab alati sama identiteedi ning kõik, mis peegelobjektile viitas, taastub automaatselt. Tal **ei ole omaduste dokumente** — kirjutatakse ainult objekti dokument koos väljadega `_origin_db` (päritolu) ja `_origin_hash` (muudatuste tuvastus); omaduste ajalugu jääb originaali juurde. Ja ta on **olemuslikult kirjutuskaitstud**: peegelobjektil ei ole kunagi toimetaja ega omaniku õigusi, seega lükkavad tavalised ligipääsukontrollid iga kirjutamise ja kustutamise tagasi. Peegelobjektide õigused määravad ainult nähtavuse — tuletatuna `share_in` seadetest ning `inherit` puhul ülemobjektidelt — ja isegi pärimise kaudu toimetaja taseme saanud kasutaja ei saa peegelobjekti muuta.

## Mis juhtub objektide muutumisel

Taustatöötleja viib iga vastuvõtva andmebaasi perioodiliselt lähteandmebaasidega vastavusse — ükski elutsükli sündmus ei vaja erikäsitlust:

- **Muudatused originaalis** jõuavad peegelobjektidele sekunditega; muutumata objekte ei kirjutata kunagi üle.
- **Vaataja õiguse andmine või eemaldamine** loob või eemaldab peegelobjektid, pärimise kaudu ka terved harud.
- **Ühenduse muutmine** — tüübid, omadused, ülemobjektid, nähtavus — arvutab kõik selle peegelobjektid ümber.
- **Originaalobjekti kustutamine** eemaldab tema peegelobjekti; **ühenduse tühistamine** (kumbki pool) eemaldab kõik selle peegelobjektid.
- **Õiguste muutmine peegelobjekti ülemobjektidel** uuendab nähtavust tavalise pärimise kaudu.
- **Peegelobjektile viitavaid kohalikke objekte ei puututa kunagi**: peegelobjekti eemaldamisel jäävad need ootele ja taastuvad, kui objekt jagatakse uuesti sama `_id` all.

## Turvagarantiid

- Nõusolek on vastastikune ja kummagi poole poolt sõltumatult tagasivõetav, kumbki oma andmebaasis, kohese mõjuga.
- Peegeldamine on rangelt ühesuunaline; kirjutusõigus ei ületa kunagi andmebaasi piiri.
- Ligipääsuvõtmeid (API võtmed, pääsuvõtmed), õigusi ja süsteemseid seadeid (arvelduspiirangud) ei saa kunagi jagada — see on tagatud mootoris, mitte seadistuses.
- Midagi ei liigu, kui lähteandmebaas pole seda pakkunud *ja* õigust andnud *ja* vastuvõtja seda vastu võtnud.
- Peegelobjekte ei jagata kunagi edasi — jagamine ei ahelda üle andmebaaside.
- Andmebaas ei saa kunagi luua ühendust iseendaga.

## Näide: turuplats

Rühm raamatukogusid ja muuseume loob ühise `market` andmebaasi. Iga asutus loob sellega ühenduse ja annab ühendusele vaataja õigused esemetel, mida soovib välja panna — peegelobjektidest saab kataloog, mis on otsitav nagu iga Entu andmebaas. Külastajad logivad sisse oma olemasoleva Entu identiteediga ja sirvivad; kommentaarid ja laenutustaotlused on turuplatsi enda objektid, mis viitavad peegelobjektidele. Vastassuunaline ühendus võib jagada iga taotluse tagasi omaniku enda andmebaasi, nii et töötajad käsitlevad taotlusi oma Entust lahkumata.

## Piirangud

- **Failid ja pildid** — failiomadusi ei sünkroonita; peegelobjektid ei kanna failiväärtusi.
- **Peegelobjektipõhine nähtavus** — ühenduse kõigil peegelobjektidel on üks nähtavus; objektipõhised erandid ei ole võimalikud.
- **Tüüpide vastendamine** — sama tüübinimi peab olema mõlemal pool; lähtetüübi ja sihttüübi vastendamist ei ole.

Disain hoiab iga andmebaasi oma andmete üle täielikult otsustajana, tehes samas organisatsioonidevahelise koostöö võimalikuks.
