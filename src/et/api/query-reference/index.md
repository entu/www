# Päringu viide

Objekte päritakse läbi `GET /api/{db}/entity`, kasutades URL-päringuparameetreid. Sama filtrisüntaksit kasutatakse menüü `query` parameetrites ja `reference_query`-s viiteparameetrite definitsioonidel.

## Filtrid

Filtrid järgivad mustrit `propertyName.type=value`. Tüüp peab vastama parameetri andmetüübile.

| Filter | Näide | Kirjeldus |
|---|---|---|
| `prop.string=value` | `_type.string=invoice` | Täpne stringi vastavus |
| `prop.string.regex=/pattern/flags` | `name.string.regex=/acme/i` | Regulaaravaldise vastavus |
| `prop.string.in=a,b,c` | `status.string.in=active,pending` | Vastab ühele loetletud väärtustest |
| `prop.string.exists=true\|false` | `email.string.exists=true` | Kontrollib, kas stringiparameetril on väärtus |
| `prop.reference=id` | `owner.reference=abc123` | Täpne viite vastavus |
| `prop.reference.in=id1,id2` | `owner.reference.in=abc,def` | Vastab ühele loetletud objekti ID-dest |
| `prop.reference.exists=true\|false` | `photo.reference.exists=true` | Kontrollib, kas viiteparameetril on väärtus |
| `prop.number=n` | `budget.number=1000` | Täpne arvu vastavus |
| `prop.number.gt=n` | `budget.number.gt=500` | Suurem kui |
| `prop.number.gte=n` | `budget.number.gte=500` | Suurem või võrdne |
| `prop.number.lt=n` | `budget.number.lt=1000` | Väiksem kui |
| `prop.number.lte=n` | `budget.number.lte=1000` | Väiksem või võrdne |
| `prop.number.ne=n` | `budget.number.ne=0` | Ei võrdu |
| `prop.number.in=a,b,c` | `quantity.number.in=10,20,30` | Vastab ühele loetletud numbritest |
| `prop.number.exists=true\|false` | `price.number.exists=true` | Kontrollib, kas arvuparameetril on väärtus |
| `prop.boolean=true\|false` | `active.boolean=true` | Tõeväärtuse vastavus |
| `prop.boolean.in=true,false` | `active.boolean.in=true,false` | Vastab ühele loetletud tõeväärtustest |
| `prop.boolean.exists=true\|false` | `active.boolean.exists=true` | Kontrollib, kas tõeväärtuse parameetril on väärtus |
| `prop.date=YYYY-MM-DD` | `due_date.date=2025-01-01` | Täpne kuupäeva vastavus |
| `prop.date.gt=date` | `due_date.date.gt=2025-01-01` | Suurem kui |
| `prop.date.gte=date` | `due_date.date.gte=2025-01-01` | Suurem või võrdne |
| `prop.date.lt=date` | `due_date.date.lt=2025-12-31` | Väiksem kui |
| `prop.date.lte=date` | `due_date.date.lte=2025-12-31` | Väiksem või võrdne |
| `prop.date.in=d1,d2` | `event_date.date.in=2025-01-01,2025-02-01` | Vastab ühele loetletud kuupäevadest |
| `prop.date.exists=true\|false` | `due_date.date.exists=true` | Kontrollib, kas kuupäevaparameetril on väärtus |
| `prop.datetime=ISO8601` | `created_at.datetime=2025-01-28T08:21:25Z` | Täpne kuupäev+kellaaeg vastavus |
| `prop.datetime.gt=ISO8601` | `created_at.datetime.gt=2025-01-01T00:00:00Z` | Suurem kui |
| `prop.datetime.gte=ISO8601` | `created_at.datetime.gte=2025-01-01T00:00:00Z` | Suurem või võrdne |
| `prop.datetime.lt=ISO8601` | `created_at.datetime.lt=2025-12-31T00:00:00Z` | Väiksem kui |
| `prop.datetime.lte=ISO8601` | `created_at.datetime.lte=2025-12-31T00:00:00Z` | Väiksem või võrdne |
| `prop.datetime.in=d1,d2` | `created_at.datetime.in=2025-01-01T00:00:00Z,...` | Vastab ühele loetletud kuupäev+kellaaeg väärtustest |
| `prop.datetime.exists=true\|false` | `created_at.datetime.exists=true` | Kontrollib, kas kuupäev+kellaaeg parameetril on väärtus |
| `prop.filesize=n` | `attachment.filesize=1024` | Täpne faili suuruse vastavus (baitides) |
| `prop.filesize.gt=n` | `attachment.filesize.gt=1000000` | Faili suurus suurem kui |
| `prop.filesize.gte=n` | `attachment.filesize.gte=1000000` | Faili suurus suurem või võrdne |
| `prop.filesize.lt=n` | `attachment.filesize.lt=5000000` | Faili suurus väiksem kui |
| `prop.filesize.lte=n` | `attachment.filesize.lte=5000000` | Faili suurus väiksem või võrdne |
| `prop.filesize.exists=true\|false` | `photo.filesize.exists=true` | Kontrollib, kas failiparameetril on väärtus |

Mitu filtrit ühendatakse `&`-ga ja kõik peavad vastama (AND loogika). Eri filtrivõtmete vahel pole sisseehitatud OR-i — kasuta `.in`, et sama parameetri jaoks vastata mitmele väärtusele:

```
?_type.string=project&status.string=active&owner.reference=USER_ID
```

## Sortimine

Kahanevaks sortimiseks lisa sortimisvälja ette `-`.

| Parameeter | Näide | Kirjeldus |
|---|---|---|
| `sort=prop.type` | `sort=name.string` | Sordi kasvavalt |
| `sort=-prop.type` | `sort=-date.date` | Sordi kahanevalt |
| `sort=a,-b` | `sort=status.string,-date.date` | Mitme välja järgi sortimine |

## Lehitsemine

| Parameeter | Näide | Kirjeldus |
|---|---|---|
| `limit=n` | `limit=50` | Maksimaalne tagastatavate tulemuste arv (vaikimisi: 100) |
| `skip=n` | `skip=100` | Vahele jäetavate tulemuste arv — kasuta koos `limit`-iga lehitsemiseks |

```bash
# Lehekülg 1
GET /api/{db}/entity?limit=100&skip=0

# Lehekülg 2
GET /api/{db}/entity?limit=100&skip=100
```

## Täistekstotsing

```bash
GET /api/{db}/entity?q=acme+corp
```

Otsib kõigi parameetrite üleselt, millel on definitsioonil lubatud `search`.

::: tip
Luba `search` parameetritel, mille järgi kasutajad loomulikult otsivad (nimi, pealkiri, kood). Ilma selleta ei leia `q=` selle välja väärtusi.
:::

::: info
Autenditud päringud otsivad täieliku privaatse registri üleselt (mis sisaldab domeeni-jagatud ja avalikke objekte). Autentimata päringud otsivad ainult avaliku registri üleselt. Eraldi domeeniotsingu registrit pole — domeeni-jagatud objektid ilmuvad autenditud otsingutes, kuna nende otsitavad väärtused on privaatses registris.
:::

## Väljade valimine

Tagasta ainult konkreetsed parameetrid vastuse suuruse vähendamiseks:

```bash
GET /api/{db}/entity?props=name,status,_created
```

## Levinud mustrid

```bash
# Kõik konkreetset tüüpi objektid
?_type.string=invoice
```

::: tip
`_type.string` filtreerib objektitüübi `name` parameetri järgi (nt `invoice`), mitte selle kuvanimeduse `label` järgi. Kui su objektitüübi `name` ja `label` erinevad, kasuta alati siinkohal `name` väärtust.
:::

```bash
# Ülemobjekti alam-objektid
?_parent.reference=PARENT_ID

# Kontrolli, kas parameeter eksisteerib
?photo.reference.exists=true

# Tõstutundetu nimeotsing
?name.string.regex=/john/i

# Kuupäevavahemik
?due_date.date.gte=2025-01-01&due_date.date.lte=2025-12-31

# Mitu staatust
?status.string.in=active,pending,review
```
