# Menüüd

Menüüd on külgribal kuvatavad navigatsioonipunktid. Iga menüüelement viib objektide filtreeritud nimekirjani. Need on tüübi `menu` objektid — loo need Seadistamise alas.

Kui menüüelement on aktiivne (praegune lehe URL vastab selle päringule), kuvatakse tööriistaribal nupp „Uus …" nende objektitüüpide jaoks, mille `add_from` viitab sellele menüüle.

Objektitüübid saavad seada `add_from` ka viitama teisele **objektitüübile** või **konkreetsele objekti eksemplarile** — sel juhul ilmub selle tüübi eksemplari või konkreetse objekti vaatamisel nupp „Lisa alam-objekt". See muudab `add_from` töötavaks kahes kontekstis: menüütaseme loomine ja ülem-alam loomine.

## Menüü parameetrid

| Parameeter | Kirjeldus |
|---|---|
| `name` | Külgribal kuvatav nimetus. |
| `group` | Grupeerib menüüelemendid nimega sektsiooni päise alla. Sama `group` väärtusega elemendid kuvatakse koos. |
| `ordinal` | Numbriline järjestus grupis. Väiksemad numbrid ilmuvad ees. |
| `query` | URL-päringu string, mis määratleb, milliseid objekte see menüü kuvab. Kui praeguse lehe URL algab selle päringuga, tõstetakse menüüelement aktiivsena esile. |

Parameeter `query` kasutab standardset objektifiltri süntaksit. Täieliku süntaksi kohta vaata [API → Päringu viide](/et/api/query-reference/).

::: info
Menüüde ja objektitüüpide vaheline seos on kahepoolne: menüü määratleb, mida kuvada, ja objektitüübi `add_from` parameeter viitab menüüle, et nupp „Lisa" ilmuks, kui see menüü on aktiivne.
:::

## Menüü seadistamise näide

Tüüpiline külgriba projektijuhtimise rakendusele:

| `name` | `group` | `ordinal` | `query` |
|---|---|---|---|
| Projektid | Töö | 1 | `_type.string=project&sort=name.string` |
| Ülesanded | Töö | 2 | `_type.string=task&status.string.in=active,pending` |
| Arved | Rahandus | 1 | `_type.string=invoice&sort=-date.date` |
| Inimesed | Haldus | 1 | `_type.string=person&sort=name.string` |

Et lubada seda tüüpi objektide loomist menüüst, sea objektitüübi `add_from` viitama menüüobjektile. Kui see menüü on aktiivne, ilmub tööriistaribal nupp „Lisa".

## Juurdepääsukontroll

Menüüobjektid kasutavad sama õiguste ja jagamise mudelit nagu kõik teised objektid — külgriba kuvab ainult neid menüüelemente, millele praegusel kasutajal on juurdepääs.

Sea menüüobjektil `_sharing: domain`, et see oleks nähtav kõigile autenditud kasutajatele, või `_sharing: public`, et kuvada seda isegi autentimata külastajatele. Jäta see `private`-ks ja määra konkreetsetele isikutele või gruppidele selgesõnalised `_viewer` (või kõrgemad) õigused, et piirata juurdepääsu.

See teeb roliipõhise navigatsiooni seadistamise lihtsaks: **Halduse** menüü, mis on nähtav ainult administraatoritele, **Rahanduse** jaotis, mis on nähtav ainult rahandustiimile, ja **Projektide** menüü, mis on avatud kõigile.

::: tip
Soovitatav muster on anda õigused menüüobjektile endale — kasutaja vajab ainult `_viewer` õigusi menüüelemendi nägemiseks. Kasuta menüüobjektil `_inheritrights`, kui soovid, et see päriks juurdepääsu ülemkonteinerilt.
:::
