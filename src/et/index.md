---
layout: home
title: Paindlik objekti andmebaas

hero:
  name: Entu
  text: Paindlik objekti andmebaas
  tagline: Loo oma infosüsteem programmeerimata — seadista objektitüübid, parameetrid ja juurdepääsuõigused otse kasutajaliideses.
  image:
    src: /screenshot.jpeg
    alt: Entu
  actions:
    - theme: brand
      text: Registreeru
      link: https://entu.app/new?locale=et
    - theme: alt
      text: Dokumentatsioon
      link: /et/overview/

features:
  - title: Koodivaba andmemudelleerimine
    icon:
      src: /icons/database.svg
      width: 32
      height: 32
    details: Loo objektitüübid, parameetrid ja seosed otse kasutajaliideses. Muuda andmemudelit igal ajal — migratsioone ega juurutamisi pole vaja.
  - title: Näidismallid
    icon:
      src: /icons/layout-template.svg
      width: 32
      height: 32
    details: Eelseadistatud andmemudelid kontaktide, dokumentide, raamatukogu ja varude jaoks — kasuta sellisena või kohanda oma vajaduste järgi.
  - title: Paindlik juurdepääsukontroll
    icon:
      src: /icons/shield-check.svg
      width: 32
      height: 32
    details: Neli õiguste taset objekti kohta — omanik, toimetaja, laiendaja, vaataja. Õigused kanduvad automaatselt ülem-alam seose kaudu edasi.
  - title: Mitmekeelne
    icon:
      src: /icons/globe.svg
      width: 32
      height: 32
    details: Lisa tõlkeid igale väljale ja salvesta väärtused keele kaupa. Kasutajad näevad sisu oma keeles; kasutajaliides kohandub vastavalt.
  - title: Pluginad ja veebikonksud
    icon:
      src: /icons/plug.svg
      width: 32
      height: 32
    details: Lisa kohandatud kasutajaliidese vahekaarte (iframes) või käivita veebikonksu päästikuid mis tahes objektitüübi korral — laienda Entut tuumikut puutumata.
  - title: REST API
    icon:
      src: /icons/code.svg
      width: 32
      height: 32
    details: Täielik REST API sisseehitatud autentimisega ja interaktiivne dokumentatsioon aadressil entu.app/api/docs.

pricing:
  labels:
    period: /kuus
    objects: objekti
    storage: salvestusruumi
    cta: Alusta
    badge: Populaarseim
    vat: '* Hinnad ei sisalda käibemaksu'
  tiers:
    - plan: 1
      price: 2
      objects: '1 000'
      storage: 1 GB
      extras: []
    - plan: 2
      price: 10
      objects: '10 000'
      storage: 10 GB
      extras: []
    - plan: 3
      price: 40
      objects: '100 000'
      storage: 100 GB
      extras:
        - ID-autentimine
      featured: true
    - plan: 4
      price: 200
      objects: '500 000'
      storage: 500 GB
      extras:
        - ID-autentimine
        - Oma domeen
        - Prioriteetne tugi

partners:
  - name: Are Põhikool
    icon: book-open
    color: '#faf6ed'
    darkColor: '#242016'
  - name: August Kitzbergi nimeline Gümnaasium
    icon: book-open
    color: '#faf0f6'
    darkColor: '#231820'
  - name: Eesti Keele Instituut
    icon: clipboard-list
    color: '#eff4fc'
    darkColor: '#181e28'
  - name: Eesti Kunstiakadeemia
    icon: server
    color: '#edf7f2'
    darkColor: '#182420'
  - name: Eesti Rahvusvahelise Arengukoostöö Keskus
    icon: clipboard-list
    color: '#f4f2fc'
    darkColor: '#1e1a2e'
  - name: Eesti Sõjamuuseum – kindral Laidoneri muuseum
    icon: server
    color: '#fdf0e8'
    darkColor: '#261810'
  - name: Okupatsioonide ja vabaduse muuseum Vabamu
    icon: landmark
    color: '#f6fce4'
    darkColor: '#1e2a10'
  - name: Piletilevi AS
    icon: monitor
    color: '#eef8fa'
    darkColor: '#162224'
  - name: Pillimuuseum MTÜ
    icon: landmark
    color: '#f8f0fc'
    darkColor: '#221628'
  - name: TÜ Roots Robotics
    icon: building
    color: '#fde0ea'
    darkColor: '#260e18'
  - name: Tallinna Ehituskool
    icon: book-open
    color: '#e4fae4'
    darkColor: '#142014'
  - name: Tallinna Läänemere Gümnaasium
    icon: book-open
    color: '#faf0f0'
    darkColor: '#241818'
  - name: Toidu- ja Fermentatsioonitehnoloogia Arenduskeskus
    icon: server
    color: '#d8f8f0'
    darkColor: '#0e2420'
  - name: Vasalemma Põhikool
    icon: book-open
    color: '#e8fcd4'
    darkColor: '#162812'
  - name: Wõrgu Wõlurid OÜ
    icon: building
    color: '#f8e4f8'
    darkColor: '#241428'

usecases:
  - title: Raamatukogud
    icon: book-open
    details: Halda raamatute ja audiovisuaalse materjali kogu, lugejate andmeid ja laenutuste ajalugu. Jälgi, mis on riiulis, kes mida laenutanud on ja millal tuleb tagastada.
  - title: Muuseumid
    icon: landmark
    details: Kataloogi esemeid ja objekte rikkalike metaandmete, päritolu ja meediamanustega. Struktureeri kogusid hierarhiatesse, mis peegeldavad füüsilist korraldust.
  - title: Äridokumendid
    icon: building
    details: Halda raamatupidamiskirjeid, tarnija- ja kliendiandmeid ning laovaru — kõike ühes kohas, ilma et peaks eraldi tööriistu ühendama.
  - title: Digitaalne teabeedastus
    icon: monitor
    details: Salvesta meediafaile, seadista ekraane ja esitusloendeid ning halda esitusgraafikuid. Üks andmebaas juhib nii sisuraamatukogu kui ka ekraanide seadistust.
  - title: Erilahendused
    icon: server
    details: Ehita veebirakendusi ja portaale REST API peale — kasutajahaldus ja juurdepääsukontroll on sisseehitatud, eraldi haldusliidest pole vaja.
  - title: Andmete kogumine
    icon: clipboard-list
    details: Kogu avaldusi, registreerumisi ja küsitluste vastuseid otse Entu kasutajaliideses. Seadista täpselt, milliseid välju koguda, kes saab esitada ja kes saab üle vaadata — välist vormitööriista pole vaja.
---

## Miks Entu?

Paljudes organisatsioonides on kasutusel hulk kitsaid, eriotstarbelisi infosüsteeme — üks kontaktide, teine dokumentide, kolmas varade jaoks —, kõik jäigad ja raskesti muudetavad, andmetega üksteisest eraldatult.

Entu läheneb teisiti: kirjeldad oma andmemudeli otse kasutajaliideses ja süsteem kohandub sinu järgi. Objektitüüpe, parameetreid ja seoseid saab igal ajal lisada või muuta programmeerimata ja migratsioonideta. Kasutajad töötavad veebilehitsejas; arendajad ja välised tööriistad ühenduvad REST API kaudu.

## Loodud päriselu jaoks

Entu on juba tootmiskeskkonnas kasutusel erinevates tööstusharudes ja rakendusvaldkondades. Olgu sul tegemist füüsiliste kogude haldamise, äriprotsesside juhtimise, kohandatud veebirakenduse käitamise või kasutajatelt andmete kogumisega — Entu kohandub ülesandega, ilma et iga kord oleks vaja eriotstarbelist süsteemi:

<use-cases-section />

## Hinnad

<pricing-section />

## Partnerid ja kliendid

<partners-section />
