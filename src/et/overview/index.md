---
description: "Mis on Entu: koodivaba objektiandmebaas struktuursete andmete hoidmiseks, korrastamiseks ja päringuteks ilma migratsioonide või taustakoodita."
---

# Mis on Entu

Entu on koht, kus hoida korras kirjeid asjadest, mis sulle korda lähevad — raamatud, museaalid, arved, inimesed, seadmed, fotod. Nagu kartoteek: iga asi saab oma kaardi täpselt nende väljadega, mille sina valid. Erinevalt kartoteegist on siin kõik otsitav, seostatav ja jagatav.

Tehnilises keeles on Entu **koodivaba objektiandmebaas**: oma andmestruktuuri kujundad ja muudad täielikult veebilehitsejas — ilma programmeerijate, andmebaasi migratsioonide ja skeemifailideta.

## Põhiidee

Kõik Entus on **objekt** — üks kirje mis tahes asjast: inimene, projekt, dokument, toode. Mida objekt hoiab, määravad tema väljad ehk **parameetrid**, ja need defineerid sa ise, kasutajaliideses. Muuda neid igal ajal — juurutamist ega taaskäivitamist pole vaja.

Parameetrid on tüübitud (`string`, `number`, `date`, `file`, `reference`, …), võivad hoida mitut väärtust või tõlkeid ning neid saab ka automaatselt arvutada **valemitega** — summa arveridadelt, tähtaeg, garantii lõpuni jäänud aeg.

Objektid on korraldatud **ülem-alam hierarhiasse** nagu kaustad — raamatud riiuli all, arveread arve all. Alam-objektil võib olla mitu ülemobjekti, nii et sama kirje saab olla mitmes kontekstis ilma dubleerimiseta. Juurdepääsuõigused määratakse igal objektil eraldi, ja objekti saab seadistada pärima õigusi oma ülemobjektilt — nii haldad jagamist ühest kohast.

Sama andmemudel toetab sisseehitatud kasutajaliidest — eraldi haldusliidest pole; seadistus ja sisu elavad samas objektipuus. Arendajad pääsevad kõigele ligi REST API kaudu, aga Entu kasutamiseks pole arendajat vaja.

## Järgmised sammud

- [Alustamine](/et/getting-started/) — loo konto ja lisa esimesed kirjed
- [Objektid](/et/overview/entities/) — hierarhia, õigused ja kustutamine lähemalt
- [Parameetrid](/et/overview/properties/) — tüübid, mitme väärtusega, mitmekeelsed ja süsteemparameetrid
- [Objektitüübid](/et/configuration/entity-types/) — kuidas seadistada oma andmemudelit
