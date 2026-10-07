---
description: "Halda Entu kasutajaid isikuobjektidega — igaüks autendib end ning on aluseks õiguste määramisel ja omandi jälgimisel kogu süsteemis."
---

# Kasutajad

Isikuobjektid esindavad Entus kasutajakontosid. Iga isik saab autentida ja talle viidatakse kogu süsteemis õiguste määramiseks ja omandiõiguse jälgimiseks.

## Kasutajate lisamine

1. Loo uus objekt tüübiga **Person**
2. Sisesta isiku e-posti aadress väljale `email`
3. Klõpsa välja `entu_user` juures **Saada kutse** — kutse saadetakse sellele aadressile koos lingiga, mis kehtib 24 tundi
4. Isik avab lingi ja logib sisse ükskõik millise valikuga — pääsuvõti, Apple, Google, e-post, Smart-ID, Mobiil-ID või ID-kaart. Sisselogimine seotakse isikuobjektiga: pääsuvõtme puhul `entu_passkey`, teiste valikute puhul `entu_user` parameetrina

### Kasutajaõigused

Vaikimisi pole äsja loodud isikuobjektil erilisi õigusi. Nad pääsevad ligi ainult `domain` tasemel jagatud objektidele ning objektidele, mille juurdepääsuõigused on päritud ülemobjektilt. Täiendava juurdepääsu andmiseks viita isikule vastava objekti asjakohases õiguste parameetris.

Täieliku õiguste tabeli ja jagamise võimaluste kohta vaata [Objektid → Juurdepääsuõigused](/et/ulevaade/objektid/#juurdepaasuoigused).

## Kasutajate automaatne loomine

Kui soovid lubada juurdepääsu kõigile sisselogijatele, saab Entu automaatselt luua neile isikuobjekti esmakordsel sisselogimisel — käsitsi seadistamist pole vaja. See toimib iga sisselogimisviisiga: pääsuvõtmega sisselogimine loob isiku `entu_passkey` parameetriga, iga muu viis `entu_user` parameetriga. Isiku `email` ja `name` täidetakse, kui sisselogimine need edastab.

::: warning
Automaatselt loodud kasutajad on tavalised kasutajad. Neil on juurdepääs kõigile objektidele ja parameetritele, mis kasutavad `domain` jagamist. Enne selle lubamist veendu, et sinu jagamissätted on tahtlikud.
:::

### Juurdepääsukontroll

Kuna uuel isikuobjektil on `_inheritrights: true` ja on lisatud `add_user` sihtmärgi alam-objektiks, pärib see automaatselt kõik sellele ülemobjektile seatud õigused. Anna ülemkonteinerile õigused korra — kõik automaatselt loodud kasutajad pärivad need.

Konkreetse kasutaja piiramiseks pärast automaatset loomist lisa `_noaccess` otse nende isikuobjektile. Alam-objekti otsesed õigused tühistavad alati päritavad.

Lisateabe saamiseks vaata [Objektid → Juurdepääsuõigused](/et/ulevaade/objektid/#juurdepaasuoigused).

### Nõuded

Automaatse loomise käivitamiseks peavad kõik järgmised tingimused olema täidetud:

1. Objektil `database` on parameeter `add_user`, mis viitab ülemobjektile, kuhu luuakse uued isikuobjektid (nt kausta „Kasutajad")
2. Andmebaasis on olemas isikuobjekti tüübi definitsioon (`_type: entity`, `name: person`)
3. Autentimispäring sisaldab `db` päringuparameetrit
4. Ükski andmebaasi isikuobjekt pole selle sisselogimisega veel seotud — puudub vastav `entu_user` (sama teenusepakkuja konto või sama e-postiga vanemat tüüpi kirje) ja vastav `entu_passkey`
5. Sisselogimisega ei võeta vastu kutset

Pärast loomist seatakse uus isikuobjekt automaatselt oma `_editor`-iks — nii saavad kasutajad kohe oma profiili parameetreid uuendada.
