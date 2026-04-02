# Mis on Entu

Entu on **koodivaba objekti andmebaas** — süsteem struktureeritud andmete salvestamiseks, korraldamiseks ja pärimiseks ilma migratsioonide, skeemifailide või taustaprogrammi koodita.

## Põhiidee

Kõik Entus on **objekt**. Objekt on mis tahes kirje — inimene, projekt, dokument, toode — mille määravad selle **parameetrid**. Sa otsustad, milliseid parameetreid iga objektitüüp omab, seadistades **parameetrite definitsioonid** kasutajaliideses. Juurutamist ega taaskäivitamist pole vaja.

Parameetrid on tüüpidega (`string`, `number`, `date`, `file`, `reference`, …), võivad kanda mitut väärtust ja neid saab arvutada automaatselt **valemitega**, mis viitavad teistele parameetritele, alam-objektidele või seotud kirjetele.

Objektid on korraldatud **ülem-alam hierarhiasse**. Alam-objektil võib olla mitu ülemat, nii et sama kirje saab samaaegselt ilmuda mitmes kontekstis ilma dubleerimiseta. Juurdepääsuõigused (`_owner`, `_editor`, `_expander`, `_viewer`) seatakse objektipõhiselt ja kanduvad hierarhias automaatselt edasi.

Sama andmemudel toetab sisseehitatud kasutajaliidest — eraldi haldusliidest pole; seadistus ja sisu elavad samas objektipuus.

## Järgmised sammud

- [Objektid](/et/overview/entities/) — hierarhia, õigused ja kustutamine lähemalt
- [Parameetrid](/et/overview/properties/) — tüübid, mitme väärtusega, mitmekeelsed ja süsteemparameetrid
- [Objektitüübid](/et/configuration/entity-types/) — kuidas seadistada oma andmemudelit
