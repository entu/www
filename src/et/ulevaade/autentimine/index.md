---
description: "Logi Entusse pääsuvõtmetega, OAuth-teenustega või e-posti maagilise lingiga — iga viis on seotud sinu isikuobjektiga, ühel kontol võib olla mitu."
---

# Autentimine

Entu toetab mitut viisi sisselogimiseks. Iga meetod on seotud sinu **isikuobjektiga** — kirjega andmebaasis, mis esindab sind. Saad kasutada mitut sisselogimismeetodit samas kontol.

::: info Paroole pole
Entu ei salvesta kunagi paroole. Autentimine toimub täielikult sotsiaalse sisselogimise pakkujate või pääsuvõtmete kaudu — seadistatavat, unustatavat ega lekitavat parooli pole.
:::

## Pääsuvõtmed

Pääsuvõtmed on kaasaegne alternatiiv paroolidele — kiirem, andmepüügiresistentne, ja midagi pole meelde jätta ega lekitada. Sinu seade loob unikaalse krüptograafilise võtmepaari: privaatvõti ei lahku kunagi sinu seadmest ja Entu salvestab ainult avaliku võtme.

Sisselogimisel kinnitab sinu seade sinu identiteedi kasutades seda, mida ta tavaliselt kasutab avamiseks — Face ID, Touch ID, Windows Hello, sõrmejälgede skanner või riistvara turvavõti nagu YubiKey. Midagi pole vaja sisestada ja midagi ei saa pealtkuulata.

Pääsuvõtmed sünkroonitakse sinu seadmete vahel platvormi võtmerõnga kaudu (iCloud Keychain Apple'i seadmetel, Google Password Manager Androidil või pääsuvõtmeid toetav paroolihaldur). Pääsuvõti toimib nagu iga teine sisselogimisviis: saad selle luua registreerumisel, kutse vastuvõtmisel või hiljem oma isikuobjektil nupuga **Lisa sisselogimisviis** — ja kutse saad vastu võtta ka juba olemasoleva pääsuvõtmega. Samale kontole saad registreerida mitu pääsuvõtit, näiteks ühe seadme kohta, ja neid oma isikuobjektilt kustutada. Pääsuvõtmega sisse logituna saad luua ka uue andmebaasi.

Pääsuvõti pole seotud ühe andmebaasiga — see avab kõik Entu andmebaasid, kus see on sinu isikuobjektile lisatud —, seega näitab paroolihaldur seda nimega **Entu**. Brauserid ja süsteemid, mis seda toetavad, asendavad pärast sisselogimist selle nime sinu nimega.

**Sobib kõige paremini:** Sageli kasutavatele inimestele, kes soovivad kiireimat ja turvalisimat sisselogimiskogemust.

## Sotsiaalne sisselogimine

Sotsiaalne sisselogimine võimaldab sul sisse logida ilma paroolita, kasutades identiteedipakkujat, keda sa juba usaldad. Entu saadab sind pakkuja sisselogimislehele ja kui oled seal oma identiteedi kinnitanud, oled sisse logitud. Sotsiaalne sisselogimine töötab [OAuth.ee](https://oauth.ee) kaudu.

### Apple

Logi sisse oma Apple ID-ga. Apple annab sulle võimaluse varjata oma päris e-posti aadress ja kasutada selle asemel privaatset relepunktaadressi. Entu töötab mõlemaga, sest tunneb sind ära Apple'i konto, mitte e-posti aadressi järgi. Nõuab Apple ID-d koos kahefaktorilise autentimisega.

### Google

Kasuta olemasolevat Google'i kontot sisselogimiseks. Kui oled oma brauseris Google'isse juba sisse logitud, on sisselogimine kohene — üks klikk ja oled sees. Entu ei näe kunagi sinu Google'i parooli.

### E-post

Logi sisse maagilise linkiga, mis saadetakse sinu e-posti aadressile — klikka e-kirjas olevale lingile ja oled sees. Link aegub kiiresti ja kehtib vaid ühe korra, nii et su konto jääb turvaliseks, isegi kui keegi teine näeb hiljem e-kirja. Töötab mis tahes e-posti aadressiga.

### Smart-ID

Smart-ID on mobiilirakendus, mida kasutatakse Eestis laialdaselt tugevaks elektrooniliseks identifitseerimiseks. Pärast isikukoodi sisestamist kinnitad sisselogimise Smart-ID rakenduses oma telefonis. Tagab seaduslikult tunnustatud elektroonilise identiteedi Eestis.

### Mobiil-ID

Mobiil-ID kasutab Eesti mobiilioperaatorite välja antud spetsiaalset SIM-kaarti sinu autentimiseks. Kinnitad sisselogimise, sisestades PINi oma telefonis. Eraldi rakendust pole vaja — autentimine toimub SIM-kaardi tasandil. Tagab seaduslikult tunnustatud elektroonilise identiteedi.

### ID-kaart

Logi sisse riikliku ID-kaardiga (või e-residentide kaardiga) kaardilugejaga. Entu loeb sinu identiteedi kaardil olevalt kiibilt pärast PINi sisestamist. Tagab kõrgeima kindlustaseme elektroonilise identiteedi Eestis.

## API võti

API võtmed võimaldavad pääseda Entule programmiliselt ligi ilma interaktiivse sisselogimisvoota. Need on pikaajalised mandaadid, mis sobivad skriptide, automatiseerimiste, integratsioonide ja olukordade jaoks, kus inimene ei saa sisselogimislehe kaudu klikkida.

Genereeri API võti Entu kasutajaliideses oma isikuobjektist. Võti kuvatakse ainult üks kord — kopeeri see ja hoia turvalises kohas, sest Entu salvestab ainult räsi ega saa seda uuesti näidata. Saad genereerida mitu võtit ja kustutada üksikuid, kui neid enam pole vaja.

**Sobib kõige paremini:** Arendajatele, taustateenustele, CI/CD torujuhtmetele, IoT-seadmetele ja mis tahes automatiseeritud süsteemile, mis peab Entus andmeid lugema või kirjutama. Vaata [API → Autentimine](/et/api/autentimine/) võtmete kasutamise kohta API-ga.
