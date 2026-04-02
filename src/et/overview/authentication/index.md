# Autentimine

Entu toetab mitut viisi sisselogimiseks. Iga meetod on seotud sinu **isikuobjektiga** — kirjega andmebaasis, mis esindab sind. Saad kasutada mitut sisselogimismeetodit samas kontol.

::: info Paroole pole
Entu ei salvesta kunagi paroole. Autentimine toimub täielikult sotsiaalse sisselogimise pakkujate või passkeys'i kaudu — seadistatavat, unustatavat ega lekitavat parooli pole.
:::

## Sotsiaalne sisselogimine

Sotsiaalne sisselogimine võimaldab sul sisse logida ilma paroolita, kasutades identiteedipakkujat, keda sa juba usaldad. Entu saadab sind pakkuja sisselogimislehele ja kui oled seal oma identiteedi kinnitanud, oled sisse logitud. Sotsiaalne sisselogimine töötab [OAuth.ee](https://oauth.ee) kaudu.

### E-post

Logi sisse maagilise linkiga, mis saadetakse sinu e-posti aadressile. Parooli pole vaja — klikka e-kirjas olevale lingile ja oled sees. Link aegub kiiresti ja kehtib vaid ühe korra, nii et su konto jääb turvaliseks, isegi kui keegi teine näeb hiljem e-kirja. Töötab mis tahes e-posti aadressiga.

### Google

Kasuta olemasolevat Google'i kontot sisselogimiseks. Kui oled oma brauseris Google'isse juba sisse logitud, on sisselogimine kohene — üks klikk ja oled sees. Entu ei näe kunagi sinu Google'i parooli.

### Apple

Logi sisse oma Apple ID-ga. Apple annab sulle võimaluse varjata oma päris e-posti aadress ja kasutada selle asemel privaatset relepunktaadressi. Entu töötab mõlemaga — oluline on, et sama aadressi kasutataks järjepidevalt. Nõuab Apple ID-d koos kahefaktorilise autentimisega.

### Smart-ID

Smart-ID on mobiilirakendus, mida kasutatakse Balti riikides ja Kesk-Euroopas tugevaks elektrooniliseks identifitseerimiseks. Pärast isikukoodi sisestamist kinnitad sisselogimise Smart-ID rakenduses oma telefonis. Tagab seaduslikult tunnustatud elektroonilise identiteedi Eestis, Lätis ja Leedus.

### Mobiil-ID

Mobiil-ID kasutab Eesti ja Leedu mobiilioperaatorite välja antud spetsiaalset SIM-kaarti sinu autentimiseks. Kinnitad sisselogimise, sisestades PINi oma telefonis. Eraldi rakendust pole vaja — autentimine toimub SIM-kaardi tasandil. Tagab seaduslikult tunnustatud elektroonilise identiteedi.

### ID-kaart

Logi sisse riikliku ID-kaardiga (või e-residentide kaardiga) kaardilugejaga. Entu loeb sinu identiteedi kaardil olevalt kiibilt pärast PINi sisestamist. Tagab kõrgeima kindlustaseme elektroonilise identiteedi Eestis.

## Passkeys

Passkeys on kaasaegne alternatiiv paroolidele — kiirem, andmepüügiresistentne, ja midagi pole meelde jätta ega lekitada. Sinu seade loob unikaalse krüptograafilise võtmepaari: privaatvõti ei lahku kunagi sinu seadmest ja Entu salvestab ainult avaliku võtme.

Sisselogimisel kinnitab sinu seade sinu identiteedi kasutades seda, mida ta tavaliselt kasutab avamiseks — Face ID, Touch ID, Windows Hello, sõrmejälgede skanner või riistvara turvavõti nagu YubiKey. Midagi pole vaja sisestada ja midagi ei saa pealtkuulata.

Passkeys sünkroonitakse sinu seadmete vahel platvormi võtmerõnga kaudu (iCloud Keychain Apple'i seadmetel, Google Password Manager Androidil või passkeys'i toetav paroolihaldur). Saad registreerida mitu passkeys'i — ühe seadme kohta — samale kontole. Passkeys'i hallatakse Entu kasutajaliideses sinu isikuobjektist.

**Sobib kõige paremini:** Sageli kasutavatele inimestele, kes soovivad kiireimat ja turvalisimat sisselogimiskogemust.

## API võti

API võtmed võimaldavad pääseda Entule programmiliselt ligi ilma interaktiivse sisselogimisvoota. Need on pikaajalised mandaadid, mis sobivad skriptide, automatiseerimiste, integratsioonide ja olukordade jaoks, kus inimene ei saa sisselogimislehe kaudu klikkida.

Genereeri API võti Entu kasutajaliideses oma isikuobjektist. Võti kuvatakse ainult üks kord — kopeeri see ja hoia turvalises kohas, sest Entu salvestab ainult räsi ega saa seda uuesti näidata. Saad genereerida mitu võtit ja kustutada üksikuid, kui neid enam pole vaja.

**Sobib kõige paremini:** Arendajatele, taustateenustele, CI/CD torujuhtmetele, IoT-seadmetele ja mis tahes automatiseeritud süsteemile, mis peab Entus andmeid lugema või kirjutama. Vaata [API → Autentimine](/et/api/authentication/) võtmete kasutamise kohta API-ga.
