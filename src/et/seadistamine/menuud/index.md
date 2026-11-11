---
description: "Seadista Entu külgriba menüüobjektidega — iga kirje viitab filtreeritud objektide loendile kiireks navigeerimiseks."
---

# Menüüd

Menüüd on külgribal kuvatavad navigatsioonipunktid. Iga menüüelement viib objektide filtreeritud nimekirjani. Need on tüübi `menu` objektid — loo need Seadistamise alas.

Menüü määrab ka, mida sealt luua saab. Kui menüüelement on aktiivne (praegune lehe URL vastab selle päringule), pakutakse selle `add_entity` objektitüüpe tööriistariba nupu „Uus …" all ja [käsupaletis](/et/alustamine/kasupalett/) — ühe tüübi korral kannab nupp selle nime (nt „Uus projekt"), mitme korral avab nupp „Uus …" valiku. Iga nii loodud objekt lisatakse menüü `add_parent` objektide alla.

Olemasoleva objekti alla alam-objekti loomine seadistatakse hoopis objektitüübil: selle `add_from` viitab **objektitüübile** või **konkreetsele objektile** ning sellel objektil ilmub nupp „Lisa …" kasutajatele, kellel on sellele `_expander` õigused. Vaata [Objektitüübid → Käitumine](/et/seadistamine/objektituubid/#objektituubi-parameetrid).

## Menüü parameetrid

| Parameeter | Kirjeldus |
|---|---|
| `name` | Külgribal kuvatav nimetus. |
| `group` | Grupeerib menüüelemendid nimega sektsiooni päise alla. Sama `group` väärtusega elemendid kuvatakse koos. |
| `ordinal` | Numbriline järjestus grupis. Väiksemad numbrid ilmuvad ees. Grupid järjestatakse nende elementide keskmise `ordinal` väärtuse järgi. |
| `query` | URL-päringu string, mis määratleb, milliseid objekte see menüü kuvab. Kui praeguse lehe URL algab selle päringuga, tõstetakse menüüelement aktiivsena esile. Kui väärtus algab `http` või `/`, on element hoopis link, mis avaneb uuel vahekaardil; selles asendatakse `{DATABASE}` ja `{LOCALE}` praeguse andmebaasi ja kasutajaliidese keelega. |
| `add_entity` | Lisatavad objektitüübid — viidete loend objektitüüpidele, mida sellest menüüst luua saab. Kui menüü on aktiivne, kuvatakse need nupu „Uus …" all ja käsupaletis. |
| `add_parent` | Uute objektide ülemobjektid — viidete loend objektidele, mille alla lisatakse iga sellest menüüst loodud objekt, lisaks tema objektitüübi `default_parent`-ile. Iga ülemobjekt kehtib menüü kõigile `add_entity` tüüpidele. Kasutajal peavad olema igaühele neist `_expander` õigused, muidu salvestamine ebaõnnestub. Uued objektid pärivad nendelt ülemobjektidelt õigused ja jagamise nagu tavaliselt. |

Parameeter `query` kasutab standardset objektifiltri süntaksit. Täieliku süntaksi kohta vaata [API → Päringu viide](/et/api/paringu-viide/).

## Menüü seadistamise näide

Tüüpiline külgriba projektijuhtimise rakendusele:

| `name` | `group` | `ordinal` | `query` |
|---|---|---|---|
| Projektid | Töö | 1 | `_type.string=project&sort=name.string` |
| Ülesanded | Töö | 2 | `_type.string=task&status.string.in=active,pending` |
| Arved | Rahandus | 1 | `_type.string=invoice&sort=-date.date` |
| Inimesed | Haldus | 1 | `_type.string=person&sort=name.string` |

Et lubada menüüst **Ülesanded** ülesandeid luua, sea selle `add_entity` viitama objektitüübile `task`. Kui see menüü on aktiivne, kuvab tööriistariba nuppu „Uus ülesanne". Et iga uus ülesanne läheks projekti kausta alla, sea menüü `add_parent` viitama sellele kaustale.

::: tip
Uued objektid ilmuvad menüü loendisse ainult siis, kui need vastavad selle `query`-le. Kui menüü kasutab `add_parent`-it, lisa see päringusse (nt `_type.string=task&_parent.reference=<kausta id>`), et loend näitaks sellest loodud objekte.
:::

## Juurdepääsukontroll

Menüüobjektid kasutavad sama [õiguste ja jagamise mudelit](/et/ulevaade/objektid/#juurdepaasuoigused) nagu kõik teised objektid — külgriba kuvab ainult neid menüüelemente, millele praegusel kasutajal on juurdepääs.

Sea menüüobjektil `_sharing: domain`, et see oleks nähtav kõigile andmebaasi kasutajatele, või `_sharing: public`, et kuvada seda ka sisse logimata külastajatele. Sellised kasutajad näevad menüü `domain` või `public` vaadet, seega peavad ka `menu` objektitüüp ja selle parameetrite definitsioonid jagama parameetreid `name`, `group`, `ordinal` ja `query` — vaata [Objektitüübid → Nähtavus](/et/seadistamine/objektituubid/#nahtavus). Jäta see `private`-ks ja määra konkreetsetele isikutele selgesõnalised `_viewer` (või kõrgemad) õigused, et piirata juurdepääsu.

See teeb rollipõhise navigatsiooni seadistamise lihtsaks: **Halduse** menüü, mis on nähtav ainult administraatoritele, **Rahanduse** jaotis, mis on nähtav ainult rahandustiimile, ja **Projektide** menüü, mis on avatud kõigile.

::: tip
Soovitatav muster on anda õigused menüüobjektile endale — kasutaja vajab ainult `_viewer` õigusi menüüelemendi nägemiseks. Kasuta menüüobjektil `_inheritrights`, kui soovid, et see päriks juurdepääsu ülemkonteinerilt.
:::
