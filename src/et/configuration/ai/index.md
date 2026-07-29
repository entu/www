---
description: "Entu AI on sisseehitatud vestlusassistent — küsi tavakeeles, et uurida andmeid või seada üles objekte, parameetreid ja valemeid; muudatused rakenduvad pärast kinnitust."
---

# Entu AI

Entu AI on Entu rakendusse sisseehitatud vestlusassistent. Ava see tööriistariba **sädemete nupust** — see on saadaval sisselogitud kasutajatele. Assistent tunneb sinu konto praegust seadistust — objektitüüpe ja nende parameetrite definitsioone — nii et saad selle kohta küsimusi esitada ja kirjeldada muudatusi tavakeeles, selle asemel et seadistusvaadetes klõpsida.

## Mida see oskab

- **Vastata seadistusküsimustele** — „Millised parameetrid on tüübil `person`?", „Millised objektitüübid viitavad tüübile `project`?"
- **Pakkuda seadistusmuudatusi** — luua objektitüüpe, lisada või muuta parameetrite definitsioone, sealhulgas [valemiga](/et/api/formulas/) parameetreid
- **Pakkuda andmemuudatusi** — luua või muuta andmeobjekte

## Muudatuste ülevaatamine ja rakendamine

Assistent ei rakenda muudatusi kunagi omal käel. Kui ta pakub muudatusi, kuvab ta nimekirja **Pakutud muudatused**, kus iga toiming on kirjeldatud tavakeeles. Vaata nimekiri üle ja klõpsa **Rakenda muudatused**, et toimingud käivitada — või **Tühista**, et need kõrvale heita. Sinu andmebaasis ei juhtu midagi enne, kui klõpsad Rakenda.

Toimingud käivitatakse järjekorras ja iga toiming saab staatuse: **rakendatud**, **ebaõnnestunud** või **vahele jäetud**. Kui mõni toiming ebaõnnestub (näiteks ebapiisavate õiguste tõttu), peatub käivitamine — sellele eelnevad toimingud on juba rakendatud ja ülejäänud jäetakse vahele.

::: warning
Rakendamine ei ole kõik-või-mitte-midagi. Kui nimekirja keskel olev toiming ebaõnnestub, on sellele eelnevad toimingud juba rakendatud ja neid tagasi ei võeta. Kontrolli toimingute staatusi, et näha, mis läbi läks.
:::

Kogu voog — näitena "loo raamatute objektitüüp":

![Entu AI voog: vestlus koostab ettepaneku midagi salvestamata, kasutaja vaatab selle üle ning alles pärast Rakenda-nuppu kontrollitakse ja salvestatakse toimingud kasutaja õigustega](/entu-ai-flow-et.svg)

## Õigused

Entu AI töötab täielikult sinu enda õigustega. Ta näeb ainult seda, mida sina näed, ja saab muuta ainult seda, mida sina saaksid käsitsi muuta — ta ei anna mingit lisajuurdepääsu. Kui sul puuduvad pakutud toiminguks õigused, ebaõnnestub see toiming rakendamisel.

## Privaatsus

Vestlusi serveris ei säilitata. Kui sulged vestluse, on see kadunud.

## Näidisküsimused

- *„Mul on vaja hoida raamatukogu infot — raamatud ja laenutused. Sea vajalikud objektid üles."*
- *„Lisa isikule sünniaasta parameeter"*
- *„Lisa arvele summa väli, mis arvutatakse arveridade põhjal"*

::: tip
Soovid assistendiga programmiliselt suhelda? Vaata aluseks olevaid lõpp-punkte lehelt [AI assistendi API](/et/api/ai/).
:::
