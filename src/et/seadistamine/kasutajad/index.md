---
description: "Halda Entu kasutajaid isikuobjektidega — igaüks autendib end ning on aluseks õiguste määramisel ja omandi jälgimisel kogu süsteemis."
---

# Kasutajad

Isikuobjektid esindavad Entus kasutajakontosid. Iga isik saab autentida ja talle viidatakse kogu süsteemis õiguste määramiseks ja omandiõiguse jälgimiseks.

## Kasutajate lisamine

1. Loo uus objekt tüübiga **Person**
2. Sisesta isiku e-posti aadress väljale `email`
3. Klõpsa välja `entu_user` juures **Saada kutse** — kutse saadetakse sellele aadressile koos lingiga, mis kehtib 24 tundi
4. Isik avab lingi ja logib sisse ükskõik millise valikuga — pääsuvõti (olemasolev või uus), Apple, Google, e-post, Smart-ID, Mobiil-ID või ID-kaart. Sisselogimine seotakse isikuobjektiga `entu_user` parameetrina

Kutse saatmiseks või tühistamiseks on vaja isikuobjektil `_owner` õigusi — või oma isikuobjektil `_editor` õigusi. Ootel kutse kuvatakse tekstina *Kutse saadetud aadressile …* koos nupuga **Tühista kutse**.

Iga kutset saab vastu võtta ühe korra. Aegunud kutse — või kasutatud või tühistatud kutse, mis avatakse isikuga veel sidumata sisselogimisega — annab vea *See kutse on vigane, aegunud või juba kasutatud*; saada sel juhul uus kutse. Kui sisselogimine kuulub andmebaasis juba teisele isikule, kutset vastu ei võeta ja isikul palutakse kasutada teist sisselogimisviisi.

Oma isikuobjektile uue sisselogimisviisi lisamiseks klõpsa selle `entu_user` välja juures **Lisa sisselogimisviis** ja logi sisse uue valikuga — ka uue pääsuvõtmega. See toimib nagu kutse iseendale.

### Kasutajaõigused

Vaikimisi pole äsja loodud isikuobjektil erilisi õigusi. Nad pääsevad ligi ainult `domain` või `public` tasemel jagatud objektidele ning objektidele, mille juurdepääsuõigused on päritud ülemobjektilt. Täiendava juurdepääsu andmiseks viita isikule vastava objekti asjakohases õiguste parameetris.

Täieliku õiguste tabeli ja jagamise võimaluste kohta vaata [Objektid → Juurdepääsuõigused](/et/ulevaade/objektid/#juurdepaasuoigused).

## Kasutajate automaatne loomine

Kui soovid lubada juurdepääsu kõigile sisselogijatele, saab Entu automaatselt luua neile isikuobjekti esmakordsel sisselogimisel — käsitsi seadistamist pole vaja. Isik luuakse sisselogimisviisiga — pääsuvõtme või mis tahes muu valikuga — tema `entu_user` parameetrina. Isiku `email` ja `name` täidetakse, kui sisselogimine need edastab.

::: warning
Automaatselt loodud kasutajad on tavalised kasutajad. Neil on juurdepääs kõigile objektidele ja parameetritele, mis kasutavad `domain` jagamist. Enne selle lubamist veendu, et sinu jagamissätted on tahtlikud.
:::

### Juurdepääsukontroll

Uus isikuobjekt luuakse `add_user` sihtmärgi alam-objektiks väärtusega `_inheritrights: true`, nii et kellel on sellel ülemobjektil õigused, saab samad õigused ka uuele isikule. Isik saab ka ise oma objekti `_editor` õiguse.

Mida uus kasutaja avada saab, otsustatakse samamoodi nagu iga kasutaja puhul: `domain` jagamise ja tema isikuobjektile viitavate õiguste parameetritega.

Lisateabe saamiseks vaata [Objektid → Juurdepääsuõigused](/et/ulevaade/objektid/#juurdepaasuoigused).

### Nõuded

Automaatse loomise käivitamiseks peavad kõik järgmised tingimused olema täidetud:

1. Objektil `database` on parameeter `add_user`, mis viitab ülemobjektile, kuhu luuakse uued isikuobjektid (nt kausta „Kasutajad")
2. Andmebaasis on olemas isikuobjekti tüübi definitsioon (`_type: entity`, `name: person`)
3. Autentimispäring sisaldab `db` päringuparameetrit
4. Ükski andmebaasi isikuobjekt pole selle sisselogimisega veel seotud — puudub vastav `entu_user` (sama teenusepakkuja konto või pääsuvõti või ainult sama e-postiga kirje)
5. Sisselogimisega ei võeta vastu kutset

Pärast loomist seatakse uus isikuobjekt automaatselt oma `_editor`-iks — nii saavad kasutajad kohe oma profiili parameetreid uuendada.
