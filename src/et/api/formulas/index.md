# Valemid

Valemid võimaldavad parameetril arvutada oma väärtuse automaatselt iga salvestamisega, tuginedes sama objekti andmetele, selle ülemobjektidele, alam-objektidele või sellele viitavatele objektidele.

Valemi kasutamiseks: sea parameetri definitsioonil lipp `formula` ja kirjuta avaldis valemi väärtusena. Arvutatud parameetreid ei saa käsitsi muuta ja need jäetakse objekti dubleerimisel vahele.

Valemid hinnatakse kahes etapis, nii et teistest valemiparameetritest sõltuvad parameetrid lahendatakse õigesti.

::: info
Kaheetapiline hindamine tähendab, et valem võib turvaliselt viidata teisele sama objekti arvutatud parameetrile. Esimene etapp lahendab lihtsad väljad; teine lahendab arvutatud parameetrite vahelised sõltuvused.
:::

## Süntaks

Valem kirjutatakse tühikutega eraldatud väärtustena, millele järgneb valikuline funktsiooni nimi:

```
field1 field2 field3 FUNCTION
```

Kui funktsiooni pole määratud, kasutatakse vaikimisi `CONCAT`.

### Pesastatud valemid

Kasuta sulge valemite pesastamiseks ja keeruliste arvutuste loomiseks:

```
(field1 field2 SUM) (field3 field4 SUM) MULTIPLY
```

Sisemised valemid hinnatakse esmalt, seejärel kasutatakse nende tulemusi välimises valemis. Pesastamine võib olla mitmetasemeline.

**Näited:**
- `(price tax SUM) quantity MULTIPLY` — Arvuta kogusumma maksuga koguse kohta
- `((a b SUM) (c d SUM) MULTIPLY) 100 DIVIDE` — Keeruline pesastatud arvutus
- `(min_value max_value SUM) 2 DIVIDE` — Miinimumi ja maksimumi keskmine

## Väljaviited

### Sama objekt

| Viide | Lahendatakse |
|---|---|
| `propertyName` | Selle parameetri väärtus(ed) praegusel objektil |
| `_id` | Praeguse objekti ID |
| `'literal'` või `"literal"` | Stringiliteraal |
| `123` / `45.67` | Arvliteraal |

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

::: info
`typeName` viiakse vastavusse viitaja objektitüübi `name` parameetriga (nt `invoice`), mitte selle kuvanimeduse `label`-iga. Kui tüübi `name` ja `label` erinevad, kasuta `name` väärtust.
:::

## Funktsioonid

| Funktsioon | Kirjeldus |
|---|---|
| `CONCAT` | Ühendab kõik väärtused stringidena (vaikimisi, kui ühtegi funktsiooni pole määratud) |
| `CONCAT_WS` | Ühendab väärtused eraldajaga — viimast väärtust kasutatakse eraldajana |
| `COUNT` | Tagastab väärtuste arvu |
| `SUM` | Summeerib kõik arvväärtused |
| `SUBTRACT` | Lahutab ülejäänud väärtused esimesest |
| `MULTIPLY` | Korrutab kõik väärtused omavahel |
| `DIVIDE` | Jagab esimese väärtuse ülejäänud väärtustega. Tagastab `undefined`, kui mõni jagaja on null. |
| `AVERAGE` | Tagastab aritmeetilise keskmise |
| `MIN` | Tagastab väikseima väärtuse |
| `MAX` | Tagastab suurima väärtuse |
| `ABS` | Tagastab esimese väärtuse absoluutväärtuse |
| `ROUND` | Ümardab N kümnendkohani — viimast väärtust kasutatakse N-na |

::: warning
`DIVIDE` tagastab `undefined`, kui mõni väärtus pärast esimest on null. Käitle seda allavoolu valemites või veendu, et jagaja on alati nullist erinev.
:::

## Tühja sisendi käitumine

Kui ühtegi väärtust ei lahendata (nt viidatav parameeter on tühi või määramata), tagastavad enamik funktsioone `undefined` ja parameetrit lihtsalt ei kirjutata. Kolm funktsiooni tagastavad väärtuse ka tühja sisendi korral:

| Funktsioon | Tühja sisendi tulemus |
|---|---|
| `COUNT` | `0` |
| `SUM` | `0` |
| `MULTIPLY` | `1` (korrutisidentiteet) |
| Kõik teised | `undefined` — parameetrit ei seadistata |

## Näited

**Täisnimi kahest väljast:**
```
first_name last_name ' ' CONCAT_WS
```

**Koguhind:**
```
price quantity MULTIPLY
```

**Hind maksuga, koguse kohta:**
```
(price tax SUM) quantity MULTIPLY
```

**Alam-objektide loendamine:**
```
_child.*._id COUNT
```

**Keskmine hind alam-objektide üleselt:**
```
_child.*.price AVERAGE
```

**Tulemuse ümardamine 2 kümnendkohani:**
```
(total quantity DIVIDE) 2 ROUND
```

**Kasum viidatavatest arvetest:**
```
_referrer.invoice.amount SUM
```
