---
description: "Valemid arvutavad parameetri väärtuse automaatselt igal salvestusel, kasutades objekti, selle ülem- või alam-objekte või viitavaid objekte."
---

# Valemid

Valemid võimaldavad parameetril arvutada oma väärtuse automaatselt iga salvestamisega, tuginedes sama objekti andmetele, selle ülemobjektidele, alam-objektidele või sellele viitavatele objektidele.

Valemi kasutamiseks: sea parameetri definitsioonil lipp `formula` ja kirjuta avaldis valemi väärtusena. Arvutatud parameetreid ei saa käsitsi muuta ja need jäetakse objekti dubleerimisel vahele.

Valemid hinnatakse kahes etapis, nii et teistest valemiparameetritest sõltuvad parameetrid lahendatakse õigesti.

::: info
Kaheetapiline hindamine tähendab, et valem võib turvaliselt viidata teisele sama objekti arvutatud parameetrile. Esimene etapp lahendab lihtsad väljad; teine lahendab arvutatud parameetrite vahelised sõltuvused.
:::

## Süntaks

Valemid kasutavad **Pöördpoola notatsiooni** (Reverse Polish Notation, RPN, tuntud ka postfiksnotatsioonina): väärtused tulevad esimesena, operaator viimasena. Mootor liigub valemis vasakult paremale ühe väärtustepinuga. Iga teigend kas:

- **Lükkab** väärtuse pinusse (literaal või väljaviide), või
- **Käivitab operaatori**, mis võtab pinust väärtusi ja lükkab tulemuse tagasi.

```
first_name " " last_name CONCAT
│           │   │         └── võta kogu pinu, ühenda väärtused, lükka ühendatud string
│           │   └── lükka välja `last_name` väärtus
│           └── lükka stringiliteraal " "
└── lükka välja `first_name` väärtus
```

Keeles **ei ole sulge** ega **kandilisi sulge**. Komposeerumine toimub loomulikult pinul — iga operaator toodab ühe väärtuse, mille järgmine operaator tarbib.

### Vaikimisi `CONCAT`

Kui valem ei lõpe tuntud operaatori võtmesõnaga, lisab mootor vaikimisi `CONCAT` ja ühendab kogu pinu stringina. See teeb lihtsad stringikompositsioonid lühikeseks:

```
first_name " " last_name                  → "John Doe"          (vaikimisi CONCAT)
first_name " " last_name CONCAT           → "John Doe"          (selgesõnaline, sama tulemus)
'Nr ' vr_nr '. ' otsuse_kp                → "Nr 12. 2026-01-01"
```

### Operaatorite klassid

Iga operaator kuulub ühte järgmistest klassidest — [operaatorite tabelite](#operaatorid) veerg **Võtab** näitab, millisesse:

- **Muutuva arvuga reduktorid** (Võtab `kõik`) tarbivad **kogu pinu** ja lükkavad ühe tulemuse. Enamik koondoperaatoreid on reduktorid — `CONCAT`, `SUM`, `MIN`, `IN` jne.
- **Fikseeritud arvuga operaatorid** (Võtab `1`, `2` või `3`) võtavad pinust teadaoleva arvu pilusid. `EQ` võtab 2, `ABS` võtab 1, `IF` võtab 3 jne.
- **Väärtuste kaupa operaatorid** on fikseeritud arvuga operaatorid, mis rakendavad operatsiooni sisendpilu iga väärtuse suhtes ja lükkavad tagasi sama pikkusega pilu — `ABS`, `UPPER`, `REGEX`, `DATE` jne.

### Mitme väärtusega (loend) parameetrid

Entu parameetrid on mitme väärtusega: üks väljaviide võib lükata ühe pinupiluna N väärtusest koosneva loendi. Operaatorid käsitlevad loendeid nii:

- **Muutuva arvuga reduktorid** lamendavad pilud üheks väärtusjadaks enne operatsiooni rakendamist. `_child.*.price SUM` on lihtsalt loendipilu redutseerimine — alusväärtused summeeritakse.
- **Väärtuste kaupa operaatorid** rakenduvad iga väärtusele sisendpilus — `_child.*.delta ABS` tagastab absoluutsete deltade loendi, sama pikkusega kui sisend.
- **Binaarvõrdlused** (`EQ`, `GT`, …) kasutavad **ANY** semantikat ristkorrutise üle: tõene, kui mõni vasak väärtus rahuldab operaatorit mõne parema väärtuse suhtes.

## Väljaviited

### Sama objekt

| Viide | Lahendatakse |
|---|---|
| `propertyName` | Selle parameetri väärtus(ed) praegusel objektil |
| `_id` | Praeguse objekti ID |
| `'literal'` või `"literal"` | Stringiliteraal |
| `123` / `45.67` / `-2` | Arvliteraal |
| `true` / `false` | Tõeväärtuse literaal |

### Viidatavad objektid

| Viide | Lahendatakse |
|---|---|
| `propertyName.*.property` | Parameetri väärtus kõigist `propertyName`-i poolt viidatavatest objektidest |
| `propertyName.type.property` | Parameetri väärtus viidatavatest objektidest filtreerituna objektitüübi järgi |
| `propertyName.*._id` | Kõigi viidatavate objektide ID-d |
| `propertyName.type._id` | Tüübi järgi filtreeritud viidatavate objektide ID-d |

### Alam-objektid

| Viide | Lahendatakse |
|---|---|
| `_child.*.propertyName` | `propertyName` kõigist alam-objektidest |
| `_child.typeName.propertyName` | `propertyName` konkreetset tüüpi alam-objektidest |
| `_child.*._id` | Kõigi alam-objektide ID-d |
| `_child.typeName._id` | Konkreetset tüüpi alam-objektide ID-d |

### Viitajate objektid

Objektid, mis viitavad sellele objektile enda viiteparameetrite kaudu:

| Viide | Lahendatakse |
|---|---|
| `_referrer.*.propertyName` | `propertyName` kõigist objektidest, mis sellele objektile viitavad |
| `_referrer.typeName.propertyName` | `propertyName` konkreetset tüüpi viitajatest |
| `_referrer.*._id` | Kõigi viitajate ID-d |
| `_referrer.typeName._id` | Konkreetset tüüpi viitajate ID-d |

Viitaja on objekt, mis osutab praegusele objektile kasutaja määratud `reference`-tüüpi parameetri kaudu. Süsteemsed viiteparameetrid (`_parent`, `_owner`, `_editor`, `_viewer`, `_expander`) **ei** lähe `_referrer`-i arvestusse.

::: info
`typeName` viiakse vastavusse viitaja objektitüübi `name` parameetriga (nt `invoice`), mitte kuvanimega `label`. Kui tüübi `name` ja `label` erinevad, kasuta `name` väärtust.
:::

::: info
Erinevalt sama objekti valemitest sõltub `_referrer` valem **teistest** objektidest. Selle väärtus uueneb, kui viitav objekt luuakse, muudetakse, kustutatakse või selle viide muutub — Entu paneb seejärel sihtobjekti automaatsesse uuesti-koondamise järjekorda, et selle `_referrer` (ja `_child`) valemid ümber arvutada. Tulemus on lõppkokkuvõttes järjepidev: see ei pruugi uueneda samas päringus, mis viitavat objekti muutis.
:::

## Väärtuste tüübid

Valemi sees on iga väärtus **arv**, **string** või **tõeväärtus** — mitte midagi muud. Väljaviide teisendab iga parameetri väärtuse selle tüübi järgi:

| Parameetri tüüp | Väärtus valemis | Näide |
|---|---|---|
| `string`, `text` | string | `"John"` |
| `number` | arv | `12.5` |
| `boolean` | tõeväärtus | `true` |
| `date` | string, `YYYY-MM-DD` | `"2026-01-31"` |
| `datetime` | string, ISO 8601 UTC-s koos millisekunditega | `"2026-01-31T12:30:00.000Z"` |
| `reference` | string — viidatava objekti **nimi** või selle ID, kui nime pole | `"Acme OÜ"` |
| `counter` | arv — loenduri arvuline osa, mitte vormindatud string | `42`, kui loendur on `INV-0042` |
| `file` | string — sisemine ID, mitte failinimi; valemites kasutu | |
| `formula` | see, mille vastav valem andis | |
| `_id`, `propertyName.*._id` | string — objekti ID | `"65a1b2c3d4e5f6a7b8c9d0e1"` |

Viidatava objekti ID saamiseks nime asemel kasuta `propertyName.*._id`.

**Mitmekeelne** parameeter lükkab pinusse **kõigi** keelte väärtused ühe loendina — eesti- ja ingliskeelse väärtusega `name` on kahe väärtusega pilu. Valemi tulemusel endal keelt ei ole.

### Mida see operaatorite jaoks tähendab

- **Tekst** — `CONCAT` ja `CONCAT_WS` teisendavad iga väärtuse stringiks nii, nagu see on: kuupäev koos kellaajaga on `2026-01-31T12:30:00.000Z` (UTC, lokaliseerimata), tõeväärtus on `true` / `false` ja arv kirjutatakse täistäpsusega, parameetri `decimals` seadistust arvestamata — ümarda see enne `ROUND`-iga. `UPPER`, `LOWER` ja `REGEX` aktsepteerivad ainult stringe, seega töötavad need kuupäevade ja viidatavate objektide nimedega, kuid arvude ja tõeväärtuste puhul väärtust ei tagasta; arvu stringiks muutmiseks lase see enne läbi `CONCAT`-i.
- **Matemaatika** — ainult arvud. Kuupäev, arvu moodi string või tõeväärtus → väärtust pole; stringid teisenda `NUMBER`-iga.
- **Võrdlemine** — `EQ` ja `IN` on ranged, seega arv `5` ei võrdu kunagi stringiga `"5"`. Kuupäevad võrdluvad stringidena õigesti, kuid võrdle sarnast sarnasega: kuupäev `"2026-01-31"` sorditakse sama päeva iga kellaajaga väärtuse ette.
- **Kuupäevad** — kuupäeva vormindamiseks kasuta `REGEX`-it ning lõpeta valem `DATE`-i või `DATETIME`-iga, kui tulemus peab olema päris kuupäev — vaata [Teisendamine](#teisendamine).

### Kuidas tulemus salvestatakse

Salvestusviisi määrab tulemuse enda tüüp: arv salvestatakse arvuna, tõeväärtus tõeväärtusena, `DATE`-i / `DATETIME`-i väljund kuupäevana / kuupäevana koos kellaajaga ja kõik muu stringina. Valemiparameetri `type` tulemust ei teisenda — `number`-tüüpi parameeter, mille valem annab `"12"`, sisaldab stringi.

## Operaatorid

Operaatorid on rühmitatud selle järgi, mida nad teevad. **Võtab** näitab, mida operaator pinust võtab: `kõik` tähendab kogu pinu (muutuva arvuga reduktor), arv tähendab pilude arvu.

### Tekst

| Operaator | Võtab | Tulemus | Käitumine |
|---|---|---|---|
| `CONCAT` | kõik | string | Lamenda kõik pinu väärtused, teisenda stringiks, ühenda eraldajata. |
| `CONCAT_WS` | kõik | string | Lamenda kõik pinu väärtused; **viimane** väärtus on eraldaja; ülejäänud ühendatakse sellega. |
| `UPPER`, `LOWER` | 1 | string | Teisendab iga stringi sisendpilus suur- / väiketähtedeks. |
| `REGEX` | 3 | string | Võtab `replacement`, `pattern` (kumbki üks string) ja `value`. Asendab regulaaravaldise `pattern` iga vaste igas `value` stringis. |

`REGEX` kasutab JavaScripti regulaaravaldiste süntaksit. Jutumärkides literaali kaldkriipsud antakse edasi muutmata, seega `'\d+'` vastab numbritele. Asenduses saab kasutada `$1`, `$2`, … püüdegruppide, `$<nimi>` nimeliste gruppide ja `$&` kogu vaste jaoks. Asendatakse kõik vasted; tõstutundetuks võrdluseks pane muster `(?i:…)` sisse.

Väärtus, mis mustrile ei vasta, jääb muutmata. Alamstringi eraldamiseks sobita kogu string ja jäta alles ainult püüdegrupp — vaata [näiteid](#teksti-naited).

`REGEX` ei tagasta väärtust, kui `value` sisaldab midagi muud peale stringide või üle 1000 väärtuse, kui `pattern` ei ole kehtiv regulaaravaldis, kui `pattern` või `replacement` on pikem kui 500 märki, kui mõni sisend- või tulemusstring on pikem kui 10 000 märki või need kokku ületavad 1 000 000 märki või kui arvutamine võtab liiga kaua aega. Ühes valemis võib `REGEX` esineda kuni 10 korda.

### Matemaatika

| Operaator | Võtab | Tulemus | Käitumine |
|---|---|---|---|
| `SUM` | kõik | number | Kõigi väärtuste summa. |
| `SUBTRACT` | kõik | number | Vasakult paremale: esimesest lahutatakse ülejäänud. |
| `MULTIPLY` | kõik | number | Kõigi väärtuste korrutis. |
| `DIVIDE` | kõik | number | Esimene jagatud ülejäänutega järjest. Nulliga jagamine → väärtust pole. |
| `ABS` | 1 | number | Iga arvu absoluutväärtus sisendpilus. |
| `ROUND` | 2 | number | Võtab `decimals` (üks arv) ja `value`. Ümardab iga arvu väärtusest `decimals` kümnendkohani. |
| `FLOOR`, `CEIL` | 1 | number | Ümardab iga arvu sisendpilus alla / üles lähima täisarvuni. |

Kõik need on range arvutüübiga — mitte-arv kuskil sisendis → väärtust pole. Stringid teisenda enne [`NUMBER`](#teisendamine)-iga.

### Loendid

| Operaator | Võtab | Tulemus | Käitumine |
|---|---|---|---|
| `COUNT` | kõik | number | Kõigi alusväärtuste arv. Tühi pinu → `0`. |
| `AVERAGE` | kõik | number | Aritmeetiline keskmine. Range arvutüüp. |
| `MIN`, `MAX` | kõik | number või string | Väikseim / suurim väärtus. |
| `UNIQUE` | 1 | sama mis sisend | Eemaldab sisendpilust korduvad väärtused, jättes alles igaühe esimese esinemise. |
| `SORT` | 1 | sama mis sisend | Sordib sisendpilu väärtused kasvavas järjekorras. |

`MIN`, `MAX` ja `SORT` võrdlevad `<` / `>` abil ja nõuavad, et kõik väärtused oleksid sama primitiivtüüpi — kõik arvud või kõik stringid; segatüübid → väärtust pole. ISO 8601 kuupäevad võrdluvad õigesti stringidena. Stringe võrreldakse märgikoodi järgi, seega suurtähed sorditakse väiketähtede ette ja täpitähed `z` järele.

### Teisendamine

| Operaator | Võtab | Tulemus | Käitumine |
|---|---|---|---|
| `NUMBER` | 1 | number | Teisendab iga stringi sisendpilus arvuks. Arvud jäävad muutmata. |
| `DATE` | 1 | date | Teisendab iga väärtuse sisendpilus kuupäevaks (kellaaeg jäetakse ära, UTC järgi). |
| `DATETIME` | 1 | datetime | Teisendab iga väärtuse sisendpilus kuupäevaks koos kellaajaga. |

`NUMBER` aktsepteerib ainult lihtsaid kümnendarvu stringe — valikuline miinusmärk, numbrid ja valikuline `.`-ga murdosa (`"12"`, `"-3.5"`); ümbritsevaid tühikuid eiratakse. Kõik muu (`"12abc"`, `"1,5"`, `"1e3"`, tõeväärtus) → väärtust pole. Puhasta string enne `REGEX`-iga — vaata [näiteid](#teisendamise-naited).

`DATE` ja `DATETIME` aktsepteerivad ISO 8601 stringe (`2026-01-31`, `2026-01-31T12:30:00Z`) ja arve, mida loetakse millisekunditena Unixi epohhist. Kõik muu → väärtust pole. Ajavööndita kuupäev-kellaaeg loetakse UTC-na.

Valemi sees on kuupäevad tavalised ISO stringid: `date`- või `datetime`-tüüpi väljaviide lükkab pinusse stringi ning võrdlused, `MIN`, `MAX` ja `SORT` töötavad nende stringidega. Ilma `DATE`-i või `DATETIME`-ita salvestatakse tulemus seega stringina. Kui valemiparameeter ise on tüüpi `date` või `datetime`, lõpeta valem `DATE`-i või `DATETIME`-iga, et väärtus salvestataks, kuvataks, sorditaks ja filtreeritaks päris kuupäevana. Kasuta neid **viimase** sammuna — teisendatud väärtus ei ole enam string, seega saab see läbida ainult `IF`-i, `WHEN`-i ja `EXISTS`-i.

### Võrdlemine

| Operaator | Võtab | Tulemus | Käitumine |
|---|---|---|---|
| `EQ`, `NE` | 2 | tõeväärtus | Range `===` / `!==` ristkorrutise üle. |
| `GT`, `GTE`, `LT`, `LTE` | 2 | tõeväärtus | Järjestus ristkorrutise üle. Mõlemad pooled peavad olema arvud või mõlemad stringid — sobimatu tüübiga paarid jäetakse vahele. |
| `IN`, `NIN` | kõik | tõeväärtus | Esimene pilu = otsitav, ülejäänud pilud = otsingulist. `IN` on tõene, kui **mõni** otsitav väärtus on rangelt võrdne **mõne** loendi väärtusega; `NIN` on eitus. |
| `EXISTS` | 1 | tõeväärtus | Tõene, kui sisendpilu laheneb vähemalt üheks väärtuseks. |

`EQ` … `LTE` ja `IN` kasutavad **ANY** semantikat: tõene, kui mõni vasak väärtus rahuldab operaatorit mõne parema väärtuse suhtes.

### Loogika ja tingimused

| Operaator | Võtab | Tulemus | Käitumine |
|---|---|---|---|
| `AND` | 2 | tõeväärtus | Tõene, kui mõlemad pooled on `true`. |
| `OR` | 2 | tõeväärtus | Tõene, kui vähemalt üks pool on `true`. |
| `NOT` | 1 | tõeväärtus | Tõeväärtuse eitus. |
| `IF` | 3 | `then` või `else` | Võtab `else`, `then`, `cond`. Tagastab `then`, kui `cond` on `true`, `else`, kui `false`. |
| `WHEN` | 2 | `then` | Võtab `then`, `cond`. Tagastab `then`, kui `cond` on `true`; muidu parameetrit ei kirjutata. |

Iga tingimus — `AND`-i, `OR`-i ja `NOT`-i iga operand ning `IF`-i ja `WHEN`-i `cond` — peab lahenema täpselt üheks tõeväärtuseks: võrdluse tulemuseks või tõeväärtusparameetriks. Kõik muu → väärtust pole. `IF`-i mõlemad harud arvutatakse enne tingimuse käivitamist (laisk hindamine puudub).

## Tühja sisendi käitumine

Enamik operaatoreid tagastab väärtuseta (parameetrit ei kirjutata), kui sisendid lahenevad tühjaks:

| Operaator | Tühi sisend |
|---|---|
| `CONCAT`, `CONCAT_WS`, `UPPER`, `LOWER`, `REGEX` | väärtust pole (parameetrit ei kirjutata) |
| `SUM`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `ABS`, `ROUND`, `FLOOR`, `CEIL` | väärtust pole |
| `COUNT` | `0` |
| `AVERAGE`, `MIN`, `MAX`, `UNIQUE`, `SORT` | väärtust pole |
| `NUMBER`, `DATE`, `DATETIME` | väärtust pole |
| `EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE` | tühi pool → väärtust pole |
| `IN`, `NIN` | tühi otsitav või tühi otsingulist → vastavalt `false` / `true` |
| `EXISTS` | tagastab alati tõeväärtuse |
| `AND`, `OR`, `NOT` | tühi operand → väärtust pole |
| `IF`, `WHEN` | väärtust pole, kui `cond` on tühi või mitte üks tõeväärtus; `WHEN` tagastab väärtuseta, kui `cond` on `false` |

## Näited

### Teksti näited

**Täisnimi (vaikimisi `CONCAT`):**
```
first_name " " last_name
```

**Täisnimi selgesõnalise `CONCAT_WS`-iga:**
```
first_name last_name " " CONCAT_WS
```

**Kahekihiline ühendamine — esinejate loend ühendatakse `", "`-ga, seejärel pealkirjale eelistatakse:**
```
artist ", " CONCAT_WS title " - " CONCAT_WS
```

**Kood suurtähtedega:**
```
code UPPER
```

**Korduvate tühikute koondamine (`REGEX` asendus):**
```
name '\s+' ' ' REGEX
```

**Tähed enne esimest sidekriipsu (`REGEX` alamstring mustri järgi):**
```
code '^([A-Z]+)-.*$' '$1' REGEX
```

**Esimesed 20 märki (`REGEX` alamstring asukoha järgi):**
```
title '^(.{0,20}).*$' '$1' REGEX
```

**Kuupäev kujul `31.01.2026` (`REGEX` ISO stringil):**
```
created '^(\d{4})-(\d{2})-(\d{2}).*$' '$3.$2.$1' REGEX
```

**Arv kümnendkomaga (`CONCAT` muudab arvu `REGEX`-i jaoks stringiks):**
```
price 2 ROUND CONCAT '\.' ',' REGEX
```

### Matemaatika näited

**Summa alam-objektide üleselt:**
```
_child.*.price SUM
```

**Kasum:**
```
income expenses SUBTRACT
```

**Maksuga koguhind:**
```
price tax SUM quantity MULTIPLY
```

**Ümarda 2 kümnendkohani:**
```
total quantity DIVIDE 2 ROUND
```

**Absoluutne erinevus, ümardatud:**
```
sum ABS invoice_sum ABS SUBTRACT 2 ROUND
```

**Vajalike täiskastide arv (ümarda üles):**
```
quantity box_size DIVIDE CEIL
```

### Loendite näited

**Konkreetset tüüpi alam-objektide loendamine:**
```
_child.invoice._id COUNT
```

**Keskmine hind:**
```
_child.*.price AVERAGE
```

**Varaseim tähtaeg:**
```
_child.*.due_date MIN
```

**Erinevate kategooriate arv alam-objektide seas:**
```
_child.*.category UNIQUE COUNT
```

**Alam-objektide erinevad autorid, sorditult ja komaga eraldatult:**
```
_child.*.author UNIQUE SORT ", " CONCAT_WS
```

### Teisendamise näited

**Arv komaga kümnendmurru stringist (`REGEX` + `NUMBER`):**
```
price_text ',' '.' REGEX NUMBER
```

**Varaseim tähtaeg, salvestatud päris kuupäevana:**
```
_child.*.due_date MIN DATE
```

**Unixi ajatempel sekundites kuupäevaks koos kellaajaga:**
```
created_ts 1000 MULTIPLY DATETIME
```

### Võrdlemise ja tingimuste näited

**Silt hinnaläve järgi:**
```
price 100 GT "expensive" "cheap" IF
```

**Märgista ainult eelarve ületamisel (else puudub):**
```
total budget GT "over budget" WHEN
```

**Kuuluvuse kontroll sisemise loendiga:**
```
status_code 10 20 30 IN "active" "inactive" IF
```

**Märgi, kas kuupäev on määratud:**
```
paid_date EXISTS "✓" "—" IF
```

**Tähtaja ületamise kontroll kuupäeva järgi:**
```
due_date "2026-01-01" LT "overdue" "ok" IF
```

**Välista keelatud staatused (väli elementide loendina):**
```
status banned_status.*.code NIN "ok" "blocked" IF
```

**Tähtaeg ületatud ja endiselt maksmata (`AND` + `NOT`):**
```
due_date "2026-01-01" LT paid_date EXISTS NOT AND "overdue" WHEN
```

## Komposeerumise reeglid

Kuna muutuva arvuga reduktorid tarbivad **kogu** pinu, võib valem praktiliselt sisaldada **ainult ühte reduktorit** enne fikseeritud arvuga operatsioone. Kui reduktor on käivitunud, asetub kõik järgnevalt lükatav selle tulemuse peale — ja järgmine reduktor neelab mõlemad.

Kui vajad kahe eraldiseisva reduktoritulemuse kombinatsiooni (nt loendus ja summa kokku stringiks renderdatud), jaga arvutus mitmeks valemiparameetriks: defineeri üks parameeter, mille valem toodab loenduse, teine parameeter summa jaoks, ja kolmas parameeter, mis viitab mõlemale. Kaheetapiline hindaja lahendab sõltuvuse.

Fikseeritud arvuga operaatoreid (`EQ`, `GT`, `AND`, `IF`, `ROUND`, `ABS`, …) saab vabalt aheldada.
