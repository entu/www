# Objektide jagamine andmebaaside vahel

::: warning Kontseptsiooni ettepanek
See leht kirjeldab kavandatavat funktsionaalsust. Midagi siin kirjeldatust ei ole veel teostatud — leht on avaldatud disaini kohta tagasiside kogumiseks.
:::

Igal Entu kontol on oma eraldiseisev andmebaas. See eraldatus on põhigarantii — kuid mõned organisatsioonid soovivad teha valitud objektid üksteisele nähtavaks. Raamatukogud tahavad ühist raamatute kataloogi. Muuseumid tahavad ühisvaadet oma kogudele. Organisatsioonide rühm võib soovida "turuplatsi", kus esemeid saab sirvida, kommenteerida ning laenutamiseks või vahetamiseks taotleda.

Objektide jagamine teeb selle võimalikuks eraldatust nõrgendamata: ühe andmebaasi objekti saab **peegeldada** teise andmebaasi, hoides seda automaatselt sünkroonis, samal ajal kui originaal ei lahku kunagi oma kodust.

## Idee ühe lõiguga

Kaks andmebaasi loovad **ühenduse** — kumbki pool loob oma andmebaasis ühenduse objekti, seega nõuab jagamine alati vastastikust nõusolekut. Edasi ei ole jagamises midagi uut õppida: omanik annab ühendusele **vaataja õigused** täpselt samamoodi nagu inimesele. Sünkroonimismootor märkab õiguse andmist ja loob sihtandmebaasi **peegelobjekti** — kirjutuskaitstud koopia lubatud omadustest. Vaataja õiguse eemaldamine eemaldab peegelobjekti.

## Ühenduse paar

Ühendus koosneb kahest tavalisest objektist, üks kummaski andmebaasis. Andmed liiguvad ainult siis, kui **mõlemad** on olemas.

**`share_out`** — luuakse lähteandmebaasis: *"olen nõus saatma"*.

| Omadus | Tähendus |
|---|---|
| `name` | Õiguste dialoogis kuvatav nimi, nt "Turuplats" |
| `database` | Sihtandmebaasi nimi |
| `type` | Millised minu objektitüübid võivad olla jagatud |
| `property` | Lubatud loend: millised omaduste definitsioonid võivad liikuda |

**`share_in`** — luuakse sihtandmebaasis: *"võtan vastu"*.

| Omadus | Tähendus |
|---|---|
| `name` | Kuvatav nimi, nt "Tartu raamatukogu" |
| `database` | Lähteandmebaasi nimi |
| `type` | Milliseid objektitüüpe vastu võtan |
| `parent` | Kohalik objekt, mille alla saabuvad peegelobjektid paigutatakse |
| `sharing` | Peegelobjektidele rakendatav vaikimisi nähtavus (`private` / `domain` / `public`) |

Lähteandmebaas määrab, **mis lahkub** (lubatud loend ja objektipõhised õigused). Sihtandmebaas määrab, **kuhu see jõuab ja kes seda näeb** (ülemobjekt, vaikimisi nähtavus). Kumbki pool ei kontrolli teise poolt ning kumbki saab jagamise lõpetada, kustutades oma ühenduse objekti.

## Objekti jagamine

Anna ühendusele objektil `_viewer` õigus — sama dialoog ja sama mehhanism nagu inimesega jagamisel. Kaks tuttavat reeglit toimivad automaatselt:

- **Õiguste pärimine toimib.** Vaataja õiguse andmine ülemobjektil, mille alam-objektidel on `_inheritrights`, jagab kogu haru. Ühe õigusega saab avaldada terve kogu.
- **`_noaccess` toimib.** Üksikuid alam-objekte saab päritud jagamisest välja jätta.

Ühenduse jaoks on tähenduslik ainult `_viewer`. Ühendusele `_editor`, `_expander` või `_owner` õiguse andmine lükatakse tagasi — peegeldamine on rangelt ühesuunaline.

## Kuidas sünkroonimine töötab

Mootor töötab olemasoleva taustatöötleja sees. Iga omaduse muudatus paneb objekti niigi ümberarvutamise järjekorda; jagamine lisab lihtsalt viimase sammu:

1. **Tuvasta** — kas objekti ligipääsuloendis on `share_out` ühendus?
2. **Kontrolli** — kas ühenduse paar on aktiivne ja kas objekti tüüp on mõlemal pool lubatud?
3. **Projekteeri** — jäta alles ainult lubatud omadused. Ligipääsuvõtmed ja õiguste omadused ei liigu kunagi, sõltumata seadistusest.
4. **Kirjuta peegelobjekt** — lisa või uuenda peegelobjekti dokument sihtandmebaasis; kui midagi ei muutunud, jäetakse kirjutamine vahele (räsivõrdlus).
5. **Eemalda** — kui kontroll ebaõnnestub, aga peegelobjekt on olemas (õigus eemaldatud, objekt kustutatud, lubatud loend kitsendatud, ühendus lõpetatud), siis peegelobjekt eemaldatakse.

Kui ühenduse paar muutub aktiivseks, paneb ühekordne järelkäik järjekorda kõik juba jagatud objektid. Kui paar muutub mitteaktiivseks, eemaldatakse kõik selle peegelobjektid samal viisil.

## Peegelobjektid

Peegelobjekt on sihtandmebaasi objekt kolme teadliku disainivalikuga:

**Sama `_id` mis originaalil.** Objektide id-d on globaalselt unikaalsed, seega kasutab peegelobjekt originaali id-d. See teeb jagamise idempotentseks: jaga → lõpeta jagamine → jaga uuesti annab alati sama identiteedi ning kõik, mis peegelobjektile viitas, taastub automaatselt.

**Kopeeritakse ainult objekti dokument — mitte omaduste dokumendid.** Peegelobjekt kannab projekteeritud väärtusi ning lisaks välju `_origin_db` (kust see pärineb) ja `_origin_hash` (muudatuste tuvastus). Ajalugu jääb originaali juurde, kuhu see kuulubki. Seetõttu jätab sihtandmebaasi enda taustatöötleja peegelobjektid vahele ning omaduste otsene kirjutamine peegelobjektile lükatakse tagasi viitega originaalile.

**Kirjutuskaitstud sisu, kohalik kontekst.** Peegeldatud sisu ei saa sihtandmebaasis muuta — kuid sihtandmebaas saab peegelobjektile lisada omi **alam-objekte**: kommentaare, taotlusi, märkmeid. Need on tavalised kohalikud objektid ega sünkroniseeru kuhugi.

### Millised süsteemsed omadused liiguvad?

| Omadus | Liigub? | Märkused |
|---|---|---|
| `_id` | jah | Sama id mis originaalil |
| `_type` | teisendatakse | Leitakse nime järgi sihtandmebaasi enda objektitüübi definitsioon |
| `_parent` | tingimuslikult | Säilib, kui ülemobjekt on samuti peegeldatud (harud taastavad oma hierarhia); muidu kasutatakse `share_in` ülemobjekti |
| `_created` | jah | Originaali loomisaeg on aus metaandmestik |
| `_owner`, `_editor`, `_expander`, `_viewer`, `_noaccess` | mitte kunagi | Õigused ei liigu; peegelobjekti nähtavus tuleb `share_in` seadistusest |
| `_sharing`, `_inheritrights` | mitte kunagi | Sihtandmebaas otsustab oma nähtavuse ise |
| `_deleted` | mitte kunagi | Kustutamine originaalis eemaldab hoopis peegelobjekti |

## Viited

Kuna peegelobjektid säilitavad originaali id-d, kopeeritakse viiteomadused **muutmata kujul** — teisendustabeleid pole:

- Kui viidatud objekt on samuti jagatud, toimib viide sihtandmebaasis.
- Kui ei ole, kuvatakse see tavalise tekstina (viite kuvanimi salvestatakse väärtuse kõrvale).
- Kui viidatud objekt jagatakse *hiljem*, hakkab viide kohe toimima — tagasiulatuvalt, midagi ümber kirjutamata.

## Jagamise lõpetamine, kustutamine, uuesti jagamine

Vaataja õiguse eemaldamine, originaalobjekti kustutamine või ühenduse lõpetamine viivad kõik sama tulemuseni: peegelobjekti dokument eemaldatakse. Kohalikke alam-objekte (kommentaarid, taotlused) **ei puututa** — need jäävad ootele. Kui objekt jagatakse uuesti, ilmub peegelobjekt sama `_id`-ga tagasi ja kõik seosed taastuvad.

## Turvagarantiid

- Nõusolek on vastastikune ja kummagi poole poolt sõltumatult tagasivõetav, kumbki oma andmebaasis, kohese mõjuga.
- Peegeldamine on rangelt ühesuunaline; kirjutusõigus ei ületa kunagi andmebaasi piiri.
- Ligipääsuvõtmeid (API võtmed, pääsuvõtmed) ja õiguste omadusi ei saa kunagi jagada — see on tagatud mootoris, mitte seadistuses.
- Lubatud loend on selgesõnaline: midagi ei liigu, kui lähteandmebaas pole seda loetlenud *ja* õigust andnud *ja* sihtandmebaas tüüpi vastu võtnud.

## Näide: turuplats

Rühm raamatukogusid ja muuseume loob ühise `market` andmebaasi. Iga asutus loob sellega ühenduse ja annab ühendusele vaataja õigused esemetel, mida soovib välja panna — peegelobjektidest saab kataloog, mis on otsitav nagu iga Entu andmebaas. Külastajad logivad sisse oma olemasoleva Entu identiteediga ja sirvivad kataloogi; kommentaarid ja laenutustaotlused on peegelobjektide kohalikud alam-objektid. Vastassuunaline ühendus võib jagada iga taotluse tagasi omaniku enda andmebaasi, nii et töötajad käsitlevad taotlusi oma Entust lahkumata.

## Lahtised küsimused

- **Failid ja pildid** — failiomadused viitavad lähtekonto failihoidla objektidele; peegelobjektid vajavad kas vahendajat, mis kontrollib igal päringul ligipääsu originaali juures, või sünkroonimisel tehtavaid pisipiltide koopiaid.
- **Peegelobjektipõhine nähtavus** — esimeses versioonis kehtib ühenduse kõigile peegelobjektidele üks vaikimisi nähtavus; objektipõhised erandid nõuaksid kohalike õiguste liitmist sünkroonitud dokumendiga.
- **Tüüpide vastendamine** — esimene versioon eeldab sama tüübinime mõlemal pool; selgesõnaline lähtetüüp → sihttüüp vastendamine võib lisanduda hiljem.

Tagasiside on teretulnud — selle disaini eesmärk on teha organisatsioonidevaheline koostöö võimalikuks nii, et iga andmebaas jääb oma andmete üle täielikult otsustajaks.
