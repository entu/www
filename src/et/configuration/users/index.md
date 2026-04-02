# Kasutajad

Isikuobjektid esindavad Entus kasutajakontosid. Iga isik saab autentida ja talle viidatakse kogu süsteemis õiguste määramiseks ja omandiõiguse jälgimiseks.

## Kasutajate lisamine

1. Loo uus objekt tüübiga **Person**
2. Sisesta isiku e-posti aadress väljale `entu_user`
3. Klõpsa **Saada kutse** — kasutaja saab lingi sisselogimise lõpuleviimiseks

### Kasutajaõigused

Vaikimisi pole äsja loodud isikuobjektil erilisi õigusi. Nad pääsevad ligi ainult `domain` tasemel jagatud objektidele ning objektidele, mille juurdepääsuõigused on päritud ülemobjektilt. Täiendava juurdepääsu andmiseks viita isikule vastava objekti asjakohases õiguste parameetris.

Täieliku õiguste tabeli ja jagamise võimaluste kohta vaata [Objektid → Juurdepääsuõigused](/et/overview/entities/#juurdepaasuoigused).

## Kasutajate automaatne loomine

Kui soovid lubada juurdepääsu kõigile OAuth kaudu autentivatele kasutajatele, saab Entu automaatselt luua neile isikuobjekti esmakordsel sisselogimisel — käsitsi seadistamist pole vaja.

::: warning
Automaatselt loodud kasutajad on tavalised kasutajad. Neil on juurdepääs kõigile objektidele ja parameetritele, mis kasutavad `domain` jagamist. Enne selle lubamist veendu, et sinu jagamissätted on tahtlikud.
:::

### Juurdepääsukontroll

Kuna uuel isikuobjektil on `_inheritrights: true` ja on lisatud `add_user` sihtmärgi alam-objektiks, pärib see automaatselt kõik sellele ülemobjektile seatud õigused. Anna ülemkonteinerile õigused korra — kõik automaatselt loodud kasutajad pärivad need.

Konkreetse kasutaja piiramiseks pärast automaatset loomist lisa `_noaccess` otse nende isikuobjektile. Alam-objekti otsesed õigused tühistavad alati päritavad.

Lisateabe saamiseks vaata [Objektid → Juurdepääsuõigused](/et/overview/entities/#juurdepaasuoigused).

### Nõuded

Automaatse loomise käivitamiseks peavad kõik järgmised tingimused olema täidetud:

1. Objektil `database` on parameeter `add_user`, mis viitab ülemobjektile, kuhu luuakse uued isikuobjektid (nt kausta „Kasutajad")
2. Andmebaasis on olemas isikuobjekti tüübi definitsioon (`_type: entity`, `name: person`)
3. Autentimispäring sisaldab `db` päringuparameetrit
4. Ühelgi olemasoleval isikuobjektil pole `entu_user` parameetrit, mis vastaks OAuth e-posti aadressile

Pärast loomist seatakse uus isikuobjekt automaatselt oma `_editor`-iks — nii saavad kasutajad kohe oma profiili parameetreid uuendada.
