# Pluginad

Pluginad laiendavad Entu võimalusi objektitüübi tasandil. Plugin on tüübi `plugin` objekt, mis on lisatud objektitüübile selle `plugin` parameetri kaudu.

Loo plugina objektid Seadistamise alas, seejärel viita neile objektitüübi `plugin` parameetrist.

## Pluginate kategooriad

**Kasutajaliidese pluginad** avatakse muutmissahtlis iframi vahekaardina kõrvuti standardse muutmisvormiga. Kasuta neid kohandatud loomise või muutmise kogemuste jaoks — CSV-importija, vormiassistent või integratsioon, mis tõmbab andmeid välisest teenusest. Plugin saab konteksti URL-päringuparameetritena ja renderdatakse Entu enda kasutajaliideses.

**Veebikonksu pluginad** on serveripoolsed päästikud. Kui objekt salvestatakse või luuakse, saadab Entu POST-päringu plugina URL-ile taustal ilma kasutajat blokeerimata. Kasuta neid andmete edastamiseks välistele süsteemidele, automatiseerimiste käivitamiseks, kolmanda osapoole teenustega sünkroonimiseks või mistahes tausta loogika käitamiseks, mis peaks reageerima andmemuutustele.

## Plugina parameetrid

| Parameeter | Kirjeldus |
|---|---|
| `name` | Kuvanimetus, mis kuvatakse muutmissahtlis vahekaardi sildina (kasutajaliidese pluginate puhul). |
| `type` | Mis tüüpi plugin see on — vaata pluginate tüüpe allpool. |
| `url` | Kasutajaliidese pluginate jaoks — iframi vahekaardil laaditud URL. Veebikonksu pluginate jaoks — URL, mis saab POST-päringu. |
| `new_window` | Tõeväärtus. Kui `true`, avatakse plugina URL uues brauseriaknas iframi vahekaardi asemel. |

## Pluginate tüübid

| Tüüp | Käivitatakse | Mis juhtub |
|---|---|---|
| `entity-edit` | Muutmissahtel avati **olemasoleva** objekti jaoks | Plugina URL laaditakse iframi vahekaardina. URL saab `account`, `entity`, `locale`, `token`. |
| `entity-add` | Muutmissahtel avati **uue** objekti **loomiseks** | Plugina URL laaditakse iframi vahekaardina. URL saab `account`, `type`, `parent` (kui lisatakse alam-objektina), `locale`, `token`. |
| `entity-edit-webhook` | Seda tüüpi **olemasolev** objekt on **salvestatud** | Server saadab POST-i `{ db, plugin, entity: { _id }, token }` plugina URL-ile. Token on lühiealine JWT (1 min). Tulista-ja-unusta. |
| `entity-add-webhook` | Seda tüüpi **uus** objekt on **loodud** | Sama serveripoolne POST nagu eespool, käivitatakse loomisel. |

## Kasutajaliidese plugina URL-parameetrid

Kui Entu laadib kasutajaliidese plugina iframes, lisab see plugina URL-ile need päringuparameetrid:

| Parameeter | Kirjeldus |
|---|---|
| `account` | Andmebaasi identifikaator |
| `entity` | Objekti ID (`entity-edit` jaoks) |
| `type` | Objektitüübi ID (`entity-add` jaoks) |
| `parent` | Ülemobjekti ID (`entity-add` puhul alam-objekti loomisel) |
| `locale` | Praeguse kasutajaliidese keelekood |
| `token` | Lühiealine JWT token API-kõnede tegemiseks praeguse kasutaja nimel |

## Veebikonksu koorma

Veebikonksu pluginate jaoks (`entity-edit-webhook`, `entity-add-webhook`) saadab Entu POST-päringu selle JSON-koorma kujul:

```json
{
  "db": "mydatabase",
  "plugin": "PLUGIN_ENTITY_ID",
  "entity": {
    "_id": "ENTITY_ID"
  },
  "token": "SHORT_LIVED_JWT"
}
```

`token` kehtib 1 minut ja seda saab kasutada objekti lugemiseks või muutmiseks API kaudu. Veebikonksu käivitamine on tulista-ja-unusta — Entu ei oota vastust ega proovi uuesti tõrke korral.

::: warning
Veebikonksu kohaletoimetamine pole garanteeritud. Kui sinu lõpp-punkt on maas või tagastab vea, läheb päring kaotsi. Rakenda oma korduskatsumise või järjekorra loogika, kui töökindlus on oluline.
:::

## Sisseehitatud pluginad

Entu pakub valmis pluginate komplekti, mida majutatakse aadressil [github.com/entu/plugins](https://github.com/entu/plugins). Seadista need, luues plugina objekti ja seades selle `url`-iks vastava plugina URL.

### Skeemimallid

Kiire viis oma andmebaasi skeemi seadistamiseks nullist alustamata. Selle asemel, et käsitsi määratleda objektitüübid ja nende parameetrid, vali valmis tüüp jagatud malliteegist — näiteks *Raamat*, *Dokument*, *Kaust* või *Audiovisuaalne salvestis* — ja Entu kopeerib objektitüübi ning selle parameetrite definitsioonid (nimi, tüüp, järjekord jne) sinu andmebaasi. Saad parameetrite nimekirja üle vaadata enne importimist ja need, mida ei vaja, märkimata jätta.

### CSV import

Objektide hulgiimport tabelist. Lae üles CSV-fail, vaata read eelvaates üle, vali importima minevad read ja vastenda iga CSV-veerg objekti parameetriga. Toetab laias valikus tekstikodeeringuid, seega töötavad vanemad süsteemidest pärit ekspordid ilma käsitsi teisendamiseta.

### Discogsi import

Otsi muusika andmebaasist [Discogs](https://www.discogs.com) ja lisa väljaandeid otse oma kogusse. Sisesta esitaja või albumi pealkiri, sirvi tulemusi ja klõpsa Impordi — Entu loob objekti pealkirja, esitaja, sildi, aasta, formaadi, žanri, vöötkoodi ja muu metaandmetega automaatselt täidetuna.

### Esteri import

Otsi [ESTER](https://www.ester.ee) ühiskataloogi, mida kasutavad Eesti kõrgkooli- ja avalikud raamatukogud. Leia raamatuid ja publikatsioone pealkirja, autori, ISBN-i või ISSN-i järgi ja impordi need täieliku bibliograafilise metaandmetega objektidena.

### KML import

Impordi geograafilisi asukohti KML-failidest (formaat, mida kasutavad Google Earth ja enamik GIS-tööriistu). Pärast üleslaadimist kuvatakse kõigi failist leitud kohtade loend, vali, milliseid kaasata, ja need luuakse objektidena koos nime, kirjelduse ja koordinaatide parameetritega.

## Juurdepääsukontroll

Plugina objektid kasutavad sama õiguste ja jagamise mudelit nagu kõik teised objektid. Muutmissahtel kuvab plugina vahekaarte ainult nende pluginate jaoks, millele praegusel kasutajal on juurdepääs.

Sea plugina objektil `_sharing: domain`, et see oleks saadaval kõigile autenditud kasutajatele, või `_sharing: public`, et avalikustada see isegi autentimata külastajatele. Jäta see `private`-ks ja määra selgesõnalised `_viewer` (või kõrgemad) õigused konkreetsetele isikutele või gruppidele, et piirata juurdepääsu.

See võimaldab teatud pluginaid avalikustada kõigile (nt CSV-importija kõigile toimetajatele), säilitades samal ajal teiste piiramise administraatoritele või konkreetsetele tiimidele.

::: tip
Kasutaja vajab minimaalselt `_viewer` õigusi plugina objektil, et vahekaart ilmuks. Veebikonksu pluginad on serveripoolsed ega kuvata kasutajaliideses, kuid nende objekt järgib endiselt sama õigustemudelit haldamise eesmärkidel.
:::
