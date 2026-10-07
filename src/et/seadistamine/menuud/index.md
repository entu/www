---
description: "Seadista Entu külgriba menüüobjektidega — iga kirje viitab filtreeritud objektide loendile kiireks navigeerimiseks."
---

# Menüüd

Menüüd on külgribal kuvatavad navigatsioonipunktid. Iga menüüelement viib objektide filtreeritud nimekirjani. Need on tüübi `menu` objektid — loo need Seadistamise alas.

Kui menüüelement on aktiivne (praegune lehe URL vastab selle päringule), kuvatakse tööriistaribal nupp „Uus …" nende objektitüüpide jaoks, mille `add_from` viitab sellele menüüle.

Objektitüübid saavad seada `add_from` ka viitama teisele **objektitüübile** või **konkreetsele objekti eksemplarile** — sel juhul ilmub selle tüübi eksemplari või konkreetse objekti vaatamisel nupp „Lisa …" kasutajatele, kellel on sellele objektile `_expander` õigused. Konkreetsele objektile viitavad tüübid on eelisjärjekorras: selle objektitüübile viitavaid tüüpe pakutakse ainult siis, kui ükski tüüp konkreetsele objektile ei viita. See muudab `add_from` töötavaks kahes kontekstis: menüütaseme loomine ja ülem-alam loomine.

## Menüü parameetrid

| Parameeter | Kirjeldus |
|---|---|
| `name` | Külgribal kuvatav nimetus. |
| `group` | Grupeerib menüüelemendid nimega sektsiooni päise alla. Sama `group` väärtusega elemendid kuvatakse koos. |
| `ordinal` | Numbriline järjestus grupis. Väiksemad numbrid ilmuvad ees. Grupid järjestatakse nende elementide keskmise `ordinal` väärtuse järgi. |
| `query` | URL-päringu string, mis määratleb, milliseid objekte see menüü kuvab. Kui praeguse lehe URL algab selle päringuga, tõstetakse menüüelement aktiivsena esile. Kui väärtus algab `http` või `/`, on element hoopis link, mis avaneb uuel vahekaardil; selles asendatakse `{DATABASE}` ja `{LOCALE}` praeguse andmebaasi ja kasutajaliidese keelega. |

Parameeter `query` kasutab standardset objektifiltri süntaksit. Täieliku süntaksi kohta vaata [API → Päringu viide](/et/api/paringu-viide/).

## Menüü seadistamise näide

Tüüpiline külgriba projektijuhtimise rakendusele:

| `name` | `group` | `ordinal` | `query` |
|---|---|---|---|
| Projektid | Töö | 1 | `_type.string=project&sort=name.string` |
| Ülesanded | Töö | 2 | `_type.string=task&status.string.in=active,pending` |
| Arved | Rahandus | 1 | `_type.string=invoice&sort=-date.date` |
| Inimesed | Haldus | 1 | `_type.string=person&sort=name.string` |

Et lubada mingit tüüpi objektide loomist menüüst, sea objektitüübi `add_from` viitama menüüobjektile. Kui see menüü on aktiivne, ilmub tööriistaribal nupp „Uus …".

## Juurdepääsukontroll

Menüüobjektid kasutavad sama [õiguste ja jagamise mudelit](/et/ulevaade/objektid/#juurdepaasuoigused) nagu kõik teised objektid — külgriba kuvab ainult neid menüüelemente, millele praegusel kasutajal on juurdepääs.

Sea menüüobjektil `_sharing: domain`, et see oleks nähtav kõigile andmebaasi kasutajatele, või `_sharing: public`, et kuvada seda ka sisse logimata külastajatele. Sellised kasutajad näevad menüü `domain` või `public` vaadet, seega peavad ka `menu` objektitüüp ja selle parameetrite definitsioonid jagama parameetreid `name`, `group`, `ordinal` ja `query` — vaata [Objektitüübid → Nähtavus](/et/seadistamine/objektituubid/#nahtavus). Jäta see `private`-ks ja määra konkreetsetele isikutele selgesõnalised `_viewer` (või kõrgemad) õigused, et piirata juurdepääsu.

See teeb rollipõhise navigatsiooni seadistamise lihtsaks: **Halduse** menüü, mis on nähtav ainult administraatoritele, **Rahanduse** jaotis, mis on nähtav ainult rahandustiimile, ja **Projektide** menüü, mis on avatud kõigile.

::: tip
Soovitatav muster on anda õigused menüüobjektile endale — kasutaja vajab ainult `_viewer` õigusi menüüelemendi nägemiseks. Kasuta menüüobjektil `_inheritrights`, kui soovid, et see päriks juurdepääsu ülemkonteinerilt.
:::
