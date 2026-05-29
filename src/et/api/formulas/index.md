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

Iga operaator kuulub ühte järgmistest klassidest:

- **Muutuva arvuga reduktorid** tarbivad **kogu pinu** ja lükkavad ühe tulemuse. Enamik koondoperaatoreid on reduktorid — `CONCAT`, `SUM`, `MIN`, `IN` jne.
- **Fikseeritud arvuga operaatorid** võtavad pinust teadaoleva arvu pilusid. `EQ` võtab 2, `ABS` võtab 1, `IF` võtab 3 jne.
- **Väärtuste kaupa operaatorid** (`ABS`, `ROUND`) võtavad ühe sisendpilu ja rakendavad operatsiooni iga selle väärtuse suhtes, lükkades tagasi sama pikkusega pilu.

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

## Operaatorid

### Muutuva arvuga reduktorid (tarbivad kogu pinu)

| Operaator | Tulemus | Märkused |
|---|---|---|
| `CONCAT` | string | Lamenda kõik pinu väärtused, teisenda stringiks, ühenda eraldajata. |
| `CONCAT_WS` | string | Lamenda kõik pinu väärtused; **viimane** väärtus on eraldaja; ülejäänud ühendatakse sellega. |
| `SUM` | number | Range arvutüüp — mitte-arv kuskil → väärtust pole. |
| `SUBTRACT` | number | Vasakult paremale: esimesest lahutatakse ülejäänud. Range arvutüüp. |
| `MULTIPLY` | number | Kõigi väärtuste korrutis. Range arvutüüp. |
| `DIVIDE` | number | Esimene jagatud ülejäänutega järjest. Range arvutüüp. Nulliga jagamine → väärtust pole. |
| `COUNT` | number | Kõigi alusväärtuste arv. Tühi pinu → `0`. |
| `AVERAGE` | number | Aritmeetiline keskmine. Range arvutüüp. |
| `MIN`, `MAX` | number või string | Võrdle `<` / `>` abil. Kõik väärtused peavad olema sama primitiivtüüpi (kõik arvud või kõik stringid — ISO 8601 kuupäevad võrdluvad õigesti stringidena). |
| `IN`, `NIN` | tõeväärtus | Esimene pilu = otsitav, ülejäänud pilud = otsingulist. `IN` on tõene, kui **mõni** otsitav väärtus on rangelt võrdne **mõne** loendi väärtusega; `NIN` on eitus. |

### Binaarvõrdlused (tagastavad tõeväärtuse)

| Operaator | Käitumine |
|---|---|
| `EQ`, `NE` | Range `===` / `!==` ristkorrutise üle. |
| `GT`, `GTE`, `LT`, `LTE` | Järjestus ristkorrutise üle. Mõlemad pooled peavad olema arvud või mõlemad stringid — sobimatu tüübiga paarid jäetakse vahele. |

Kõik kuus kasutavad **ANY** semantikat: tõene, kui mõni vasak väärtus rahuldab operaatorit mõne parema väärtuse suhtes.

### Tingimuslik

| Operaator | Arv | Käitumine |
|---|---|---|
| `IF` | 3 | Võtab `else`, `then`, `cond`. Tagastab `then`, kui `cond` on `true`, `else`, kui `false`. |
| `WHEN` | 2 | Võtab `then`, `cond`. Tagastab `then`, kui `cond` on `true`; muidu parameetrit ei kirjutata. |

Mõlemad nõuavad, et `cond` lahendaks täpselt üheks tõeväärtuseks. Mõlemad harud arvutatakse enne tingimuse käivitamist (laisk hindamine puudub).

### Väärtuste kaupa

| Operaator | Arv | Käitumine |
|---|---|---|
| `ABS` | 1 | Iga arvu absoluutväärtus sisendpilus. |
| `ROUND` | 2 | Võtab `decimals` (üks arv) ja `value`. Ümardab iga arvu väärtusest `decimals` kümnendkohani. |

### Muud

| Operaator | Arv | Käitumine |
|---|---|---|
| `EXISTS` | 1 | Tõene, kui sisendpilu laheneb vähemalt üheks väärtuseks. |

## Tühja sisendi käitumine

Enamik operaatoreid tagastab väärtuseta (parameetrit ei kirjutata), kui sisendid lahenevad tühjaks:

| Operaator | Tühi sisend |
|---|---|
| `COUNT` | `0` |
| `CONCAT`, `CONCAT_WS`, `SUM`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, `AVERAGE`, `MIN`, `MAX` | väärtust pole (parameetrit ei kirjutata) |
| `ABS`, `ROUND` | väärtust pole |
| `IN`, `NIN` | tühi otsitav või tühi otsingulist → vastavalt `false` / `true` |
| `EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE` | tühi pool → väärtust pole |
| `EXISTS` | tagastab alati tõeväärtuse |
| `IF`, `WHEN` | väärtust pole, kui `cond` on tühi või mitte üks tõeväärtus; `WHEN` tagastab väärtuseta, kui `cond` on `false` |

## Näited

### Koondamine

**Summa alam-objektide üleselt:**
```
_child.*.price SUM
```

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

### Aritmeetika

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

### Stringid

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

### Tingimused

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

## Komposeerumise reeglid

Kuna muutuva arvuga reduktorid tarbivad **kogu** pinu, võib valem praktiliselt sisaldada **ainult ühte reduktorit** enne fikseeritud arvuga operatsioone. Kui reduktor on käivitunud, asetub kõik järgnevalt lükatav selle tulemuse peale — ja järgmine reduktor neelab mõlemad.

Kui vajad kahe eraldiseisva reduktoritulemuse kombinatsiooni (nt loendus ja summa kokku stringiks renderdatud), jaga arvutus mitmeks valemiparameetriks: defineeri üks parameeter, mille valem toodab loenduse, teine parameeter summa jaoks, ja kolmas parameeter, mis viitab mõlemale. Kaheetapiline hindaja lahendab sõltuvuse.

Fikseeritud arvuga operaatoreid (`EQ`, `GT`, `IN`, `IF`, `ROUND`, `ABS`, …) saab vabalt aheldada.
