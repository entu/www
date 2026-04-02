# Parimad praktikad

Disainipõhimõtted ja konventsioonid puhta, hooldatava andmemudeli loomiseks Entus.

## Parameetrite nimetamine

Kasuta kirjeldavaid, väiketähelisi nimesid allkriipsudega:

- ✅ `product_name`, `created_date`, `customer_email`
- ❌ `pn`, `cd`, `e`, `startDate`, `start-date`

Ole järjepidev eri objektitüüpide vahel: kasuta `name` peamiste identifikaatorite jaoks, `description` pikema teksti jaoks, `photo` piltide jaoks.

Grupeeri seotud parameetrid ühise eesliitega: `address_street`, `address_city`, `address_country`.

## Andmete modelleerimine

**Disaini objektitüübid oma päringumustrite järgi.** Kui filtreerid sageli `status`-e järgi, luba sellel parameetri definitsioonil `search`.

**Kasuta viiteid seotud andmete jaoks**, mis muutuvad sageli — ära dubleeri väärtusi objektide vahel, kui viide sobib.

**Kasuta valemeid tuletatud andmete jaoks** — kogusummad, keskmised, loendused — et tõe allikas püsiks ühes kohas. Vaata [Valemid](/et/api/formulas/).

**Kasuta objektihierarhiat** organisatsioonistruktuuri modelleerimiseks. Ülem-alam seosed võimaldavad ka õiguste pärimist.

## Mitme väärtusega parameetrid

Eelistatud lähenemine — kasuta mitut väärtust ühe parameetri all, ära loo nummerdatud variante:

```json
// Hea — mitu väärtust ühe parameetri all
[
  { "type": "tag", "string": "urgent" },
  { "type": "tag", "string": "customer" }
]

// Väldi — nummerdatud eraldi parameetrid
[
  { "type": "tag1", "string": "urgent" },
  { "type": "tag2", "string": "customer" }
]
```

Luba parameetri definitsioonil `list`, et võimaldada mitu sisendit kasutajaliideses.

## Juurdepääsukontroll

**Anna minimaalselt vajalikke õigusi:**
- `_viewer` ainult lugemise jaoks
- `_editor` kasutajatele, kes peavad parameetreid muutma
- Reserveeri `_owner` objekti administraatoritele

**Kasuta `_inheritrights` hierarhiapõhiste õiguste jaoks.** Anna juurdepääs ülemkonteineril ja see kandub automaatselt kõigile alam-objektidele.

**Kasuta `_sharing` laialdase juurdepääsu jaoks** — `domain` kõigile autenditud kasutajatele, `public` autentimata külastajatele. Kasuta `public` ettevaatlikult.

::: danger
`_sharing: public` seadmine muudab objekti nähtavaks kõigile internetis ilma autentimiseta. Kasuta seda ainult tahtlikult avaliku sisu jaoks.
:::

Vaata [Objektid → Juurdepääsuõigused](/et/overview/entities/#juurdepaasuoigused) ja [Kasutajad](/et/configuration/users/).
