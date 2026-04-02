# Kasutusnäited

Need juhendid näitavad, kuidas modelleerida levinud reaalelu stsenaariume Entus, kasutades objektitüüpe, parameetreid ja viiteid.

## CRM — Kontaktid ja ettevõtted

**Eesmärk:** Jälgida ettevõtteid, nende kontakte ning iga kontaktiga seotud märkmeid ja tegevusi.

### Loodavad objektitüübid

**Ettevõte**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `name` | string | Ettevõtte kuvanimetus |
| `website` | string | Hoia lihtsa tekstina või kasuta `markdown`-i `text` väljal klõpsatavate linkide jaoks |
| `industry` | string | |
| `notes` | text | |

**Kontakt**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `name` | string | Täisnimi |
| `email` | string | |
| `phone` | string | |
| `company` | reference | Viitab Ettevõtte objektile |
| `title` | string | Ametinimetus |

**Tegevus**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `date` | datetime | |
| `type` | string | nt kõne, kohtumine, e-post |
| `summary` | text | |
| `contact` | reference | Viitab Kontakti objektile |

### Struktuur

- Loo **Ettevõtted** konteiner-objekt juurena.
- Lisa iga ettevõte selle konteineri alam-objektina.
- Lisa kontaktid vastava ettevõtte alam-objektidena — nii `company` viiteparameeter kui ka `_parent` seos seovad kontakti ettevõttega.
- Lisa tegevused vastava kontakti alam-objektidena.

### Juurdepääsukontroll

Anna müügimeeskonnale `_editor` õigused Ettevõtete konteineril ja luba kõigil alam-objektidel `_inheritrights: true`, et õigused leviks automaatselt.

---

## Projektijälgija

**Eesmärk:** Hallata projekte koos parameetrite, loendurite ja valemiga arvutatud väljaga.

### Objektitüüp

| Parameeter | Väärtus |
|---|---|
| `name` | `project` |
| `label` | `Projekt` |
| `description` | `Kliendiprojekt või sisemine algatus` |
| `add_from` | *(viide "Projektid" menüüle)* |

### Parameetri definitsioonid

| `name` | `type` | `label` | Märkimisväärsed seaded |
|---|---|---|---|
| `name` | `string` | `Nimi` | `mandatory`, `search` |
| `status` | `string` | `Staatus` | `set: ["Planeerimine", "Aktiivne", "Ootab", "Lõpetatud"]`, `mandatory` |
| `description` | `text` | `Kirjeldus` | `markdown` |
| `owner` | `reference` | `Vastutaja` | `reference_query: _type.string=person` |
| `due_date` | `date` | `Tähtaeg` | |
| `budget` | `number` | `Eelarve` | `decimals: 2` |
| `tags` | `string` | `Märgend` | `label_plural: Märgendid`, `list` |
| `code` | `counter` | `Projekti kood` | `readonly` |
| `notes` | `text` | `Sisemised märkmed` | `hidden` |
| `total_hours` | `number` | `Tunnid kokku` | `formula`, `readonly`, `decimals: 1` |

### Mida see demonstreerib

- `set` muudab stringivälja rippmenüüks.
- `counter` genereerib iga objekti jaoks unikaalse koodi (nt projektinumbrid).
- `hidden` jätab välja muutamisvormist, kuid jääb objekti lehel nähtavaks — sobib valemipõhistele väärtustele.
- `formula` väljal `total_hours` arvutab uuesti iga salvestamisega, kasutades alam-objektide või viitajate andmeid.

---

## Meediakogu

**Eesmärk:** Salvestada ja organiseerida pilte, videoid ja dokumente koos metaandmete ning märgenditega.

### Loodavad objektitüübid

**Kogu**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `name` | string | Kausta/albuminimi |
| `description` | text | |

**Meediaüksus**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `title` | string | |
| `file` | file | Tegelik üleslaaditud fail |
| `type` | string | pilt, video, dokument |
| `tags` | string | `list: true` — lubab mitu väärtust |
| `description` | text | |
| `author` | reference | Viitab Isiku objektile |
| `published` | boolean | |
| `size` | number | Sea parameetri definitsioonil `formula: 'file.size'` — arvutab automaatselt manustatud failist |

### Struktuur

- Loo **Kogud** tipptaseme konteineritena.
- Lae meediaüksused üles vastava kogu alam-objektidena.
- Sea avalikult sirvitavatel kogudel `_sharing: public`.
- Kasuta `tags`-i koos `list: true` — nii saab iga üksus kanda mitut märgendit filtreerimiseks.

### Üksuste päring märgendi järgi API kaudu

```
GET /api/{db}/entity?_type.string=media-item&tags.string=loodus
```

---

## Raamatukogu — Raamatud, Isikud ja Laenutused

**Eesmärk:** Hallata raamatute ja audiovisuaalsete materjalide kogu, jälgida laenutajate andmeid ning salvestada laenutuste ajalugu koos tähtaegade ja tagastustega.

### Loodavad objektitüübid

**Raamat**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `title` | string | `mandatory`, `search` |
| `author` | string | `list: true` — lubab mitu autorit |
| `isbn` | string | |
| `type` | string | nt raamat, DVD, helifail; `set` muudab selle rippmenüüks |
| `copies` | number | Omandis olevate eksemplaride arv |
| `description` | text | |
| `cover` | file | Kaanepilt |

**Isik**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `name` | string | `mandatory`, `search` |
| `email` | string | |
| `phone` | string | |
| `card_number` | string | Raamatukogukaardi / laenutaja ID |
| `notes` | text | |

**Laenutus**
| Parameetri nimi | Tüüp | Märkused |
|---|---|---|
| `book` | reference | Viitab Raamatu objektile |
| `borrower` | reference | Viitab Isiku objektile |
| `lent_on` | date | |
| `due_date` | date | |
| `returned` | boolean | Sea `true`-ks, kui ese on tagastatud |
| `overdue` | boolean | `formula: 'due_date < now() && !returned'`, `readonly` — arvutab automaatselt |

### Struktuur

- Loo **Raamatud** konteiner ja lisa iga raamat alam-objektina.
- Loo **Laenutajad** konteiner ja lisa iga isik alam-objektina.
- Lisa laenutuskirjed vastava laenutaja alam-objektidena — nii `borrower` viide kui ka `_parent` seos seovad laenutuse laenutajaga.

### Juurdepääsukontroll

Anna raamatukogu töötajatele `_editor` õigused nii Raamatute kui ka Laenutajate konteineril koos `_inheritrights: true`. Anna laenutajatele `_viewer` õigused oma objektil, et nad saaksid näha oma laenutuste ajalugu API või kohandatud portaali kaudu.
