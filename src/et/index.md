---
layout: page
title: Kodu kõigele, mille üle sa arvet pead
description: Entu on koodivaba objektiandmebaas. Modelleeri objektid, parameetrid ja juurdepääsuõigused kasutajaliideses — ilma migratsioonide, skeemifailide ja taustakoodita.
sidebar: false

hero:
  kicker: Ehita oma andmebaas — koodivabalt
  heading: Kodu kõigele, mille üle sa arvet pead.
  lead: Raamatud, arved, museaalid, inimesed — Entu hoiab neid kõiki objektidena just nende väljadega, mille ise valid. Loo ja muuda oma andmemudelit otse kasutajaliideses. Ei mingeid migratsioone, skeemifaile ega juurutamisi.
  signup: Registreeru
  signupLink: https://entu.app/new?locale=et
  docs: Vaata näiteid
  docsLink: '#use-cases'
  graph:
    type: projekt
    name: Kevadnäitus 2027
    props:
      - name: projektijuht
        value: viide → Isik
      - name: eelarvest kasutatud
        value: = valem · 64%
        accent: true
    children:
      - type: ülesanded
        name: Galerii A ülespanek
        note: + 23 veel
      - type: dokumendid
        name: Kasutusleping
        note: fail × 8
      - type: kulud
        name: Transpordiarve
        note: kokku €2140
    rights: 'toimetaja: projektitiim · vaataja: juhtkond'

personas:
  heading: Mida saad Entuga ehitada?
  intro: Peaaegu kõike, mille üle on vaja arvet pidada. Sama paindlik mudel sobib nii isiklikule kogule kui ka terve organisatsiooni andmetele.
  more:
    text: Vaata põhjalikke kasutusnäiteid
    link: /et/examples/
  hint: Liigu näite kohale — nii näeb see välja Entus
  personalLabel: Eraisikud
  orgLabel: Organisatsioonid
  personal:
    - name: Koduraamatukogu
      text: Kataloogi oma raamatud ja plaadid, märgi üles, kes mida laenas, ja leia iga teos sekunditega.
      graph:
        root:
          name: Koduriiul
          type: kogu
        child:
          name: Steve Jobs
          type: raamat
          props:
            - k: autor
              t: viide
              v: W. Isaacson
            - k: laenutaja
              t: viide
              v: Hanna V.
            - k: riiulil tagasi
              t: valem
              v: 12. aug
              accent: true
        rights:
          - 'vaataja: pere'
    - name: Kogud
      text: Margid, vinüülid, kunst, memorabiilia — jälgi iga eseme päritolu, seisukorda, fotosid ja väärtust.
      graph:
        root:
          name: Vinüülplaadid
          type: kogu
        child:
          name: Queen Studio Collection
          type: plaat
          props:
            - k: seisukord
              t: tekst
              v: peaaegu uus
            - k: fotod
              t: fail
              v: 3 faili
            - k: hinnanguline väärtus
              t: valem
              v: €450
              accent: true
        grands:
          - t: plaat
            n: 2 · Queen II
          - t: plaat
            n: 7 · News of the World
          - t: plaat
            n: 12 · Innuendo
        rights:
          - 'vaataja: ainult mina'
    - name: Kodune vara
      text: Hoia ostutšekid, garantiid ja seerianumbrid ühes kohas — kindlustusjuhtumiks valmis.
      graph:
        root:
          name: Korter Tallinnas
          type: kodu
        child:
          name: Pesumasin
          type: ese
          props:
            - k: ostutšekk
              t: fail
              v: tsekk.pdf
            - k: seerianumber
              t: tekst
              v: WM-88412
            - k: garantiid jäänud
              t: valem
              v: 14 kuud
              accent: true
        rights:
          - 'jagatud: kindlustus'
    - name: Perearhiiv
      text: Korrasta fotod, kirjad ja dokumendid inimese, koha ja aja järgi. Jaga valitud osi sugulastega.
      graph:
        root:
          name: Tamme pere arhiiv
          type: arhiiv
        child:
          name: Pulmad, 1954
          type: foto
          props:
            - k: inimesed
              t: viide
              v: 6 isikut
            - k: koht
              t: tekst
              v: Viljandi
            - k: skaneering
              t: fail
              v: 600 dpi
        grands:
          - t: foto
            n: 13×18 cm
          - t: negatiiv
            n: 6×6
        rights:
          - 'jagatud: sugulased'
  org:
    - name: Muuseumid
      text: Kataloogi museaalid rikkalike metaandmete ja meediaga; struktureeri kogud füüsilise paigutuse järgi.
      graph:
        root:
          name: Linnamuuseum
          type: muuseum
        child:
          name: Personaalarvuti JUKU
          type: museaal
          props:
            - k: saadud
              t: kuupäev
              v: 05.1989
            - k: fotod
              t: fail
              v: 12 faili
            - k: kindlustusväärtus
              t: valem
              v: €12 000
              accent: true
        grands:
          - t: osa
            n: Monitor
          - t: osa
            n: Kettaseade
        rights:
          - 'vaataja: avalik'
          - 'toimetaja: kuraatorid'
    - name: Dokumendihaldus
      text: Raamatupidamiskirjed, tarnijate ja klientide andmed, laovaru — üks andmebaas kolme tööriista asemel.
      graph:
        root:
          name: Roots Robotics TÜ
          type: ettevõte
        child:
          name: Arve № 2026-0142
          type: arve
          props:
            - k: tarnija
              t: viide
              v: Roots Robotics
            - k: read
              t: alam × 5
              v: 5 rida
            - k: summa
              t: valem
              v: €1 840
              accent: true
        grands:
          - t: arverida
            n: Mootorikontroller × 2
          - t: arverida
            n: Enkoodrikaabel × 4
          - t: arverida
            n: Alumiiniumraami komplekt
        rights:
          - 'vaataja: raamatupidamine'
          - 'omanik: finantsjuht'
    - name: Kooli- ja raamatukogulaenutus
      text: Jälgi teavikuid, lugejaid ja laenutusi; töötajad näevad vajalikku ja õigused kanduvad automaatselt.
      graph:
        root:
          name: Kooli raamatukogu
          type: raamatukogu
        child:
          name: Kääbik
          type: raamat
          props:
            - k: eksemplarid
              t: alam × 3
              v: 3 eksemplari
            - k: laenutaja
              t: viide
              v: Liis, 7B
            - k: riiulil
              t: valem
              v: 1 / 3
              accent: true
        grands:
          - t: eksemplar
            n: № 1 · riiul 4B
          - t: eksemplar
            n: № 2 · laenutatud
          - t: eksemplar
            n: № 3 · riiul 4B
        rights:
          - 'toimetaja: laenutustöötajad'
    - name: Veebilahendused
      text: Käita portaale ja rakendusi REST API kaudu — Entu ise ongi halduskeskkond, seda pole vaja ehitada.
      graph:
        root:
          name: Piletiportaal
          type: veebileht
        child:
          name: Kevadkontsert
          type: üritus
          props:
            - k: toimumiskoht
              t: viide
              v: Alexela Hall
            - k: kuupäev
              t: kuupäev
              v: 14.05.2027
            - k: pileteid alles
              t: valem
              v: '212'
              accent: true
        grands:
          - t: pilet
            n: № A-0412
          - t: pilet
            n: № A-0413
        rights:
          - 'API: lugemisõigusega võti'

why:
  heading: Miks Entu?
  paragraphs:
    - Paljudes organisatsioonides on kasutusel hulk kitsaid, eriotstarbelisi infosüsteeme — kõik jäigad ja kallid muuta, andmed üksteisest eraldatud.
    - 'Entu läheneb teisiti: kirjeldad oma andmemudeli otse kasutajaliideses ja süsteem kohandub sinu järgi — igal ajal, ilma koodi ja migratsioonideta.'
    - Kasutajad töötavad veebilehitsejas või Apple'i rakendustes; arendajad ühenduvad REST API kaudu.

features:
  - title: Entu AI
    icon:
      src: /icons/sparkles.svg
    details: Küsi tavakeeles, et uurida oma andmeid või seada üles objekte, parameetreid ja valemeid. Entu AI pakub muudatused välja ja rakendab need pärast sinu kinnitust.
  - title: Koodivaba andmemudelleerimine
    icon:
      src: /icons/database.svg
    details: Loo objektitüübid, parameetrid ja seosed otse kasutajaliideses. Muuda andmemudelit igal ajal — migratsioone ega juurutamisi pole vaja.
  - title: Näidismallid
    icon:
      src: /icons/layout-template.svg
    details: Eelseadistatud andmemudelid kontaktide, dokumentide, raamatukogu ja varude jaoks — kasuta sellisena või kohanda oma vajaduste järgi.
  - title: Paindlik juurdepääsukontroll
    icon:
      src: /icons/shield-check.svg
    details: Neli õiguste taset objekti kohta — omanik, toimetaja, laiendaja, vaataja. Õigused kanduvad automaatselt ülem-alam seose kaudu edasi.
  - title: Mitmekeelne
    icon:
      src: /icons/globe.svg
    details: Lisa tõlkeid igale väljale ja salvesta väärtused keele kaupa. Kasutajad näevad sisu oma keeles; kasutajaliides kohandub vastavalt.
  - title: Pluginad ja veebikonksud
    icon:
      src: /icons/plug.svg
    details: Lisa kohandatud kasutajaliidese vahekaarte (iframes) või käivita veebikonksu päästikuid mis tahes objektitüübi korral — laienda Entut tuumikut puutumata.

pricing:
  heading: Hinnad
  anchor: hinnad
  labels:
    period: /kuus
    objects: objekti
    storage: salvestusruumi
    ai: AI tokenit
    cta: Alusta
    badge: Populaarseim
    vat: '* Hinnad ei sisalda käibemaksu'
  tiers:
    - plan: 1
      price: 2
      objects: '1 000'
      storage: 1 GB
      ai: '10 000'
      extras: []
    - plan: 2
      price: 10
      objects: '10 000'
      storage: 10 GB
      ai: '100 000'
      extras: []
    - plan: 3
      price: 40
      objects: '100 000'
      storage: 100 GB
      ai: '1 000 000'
      extras:
        - ID-autentimine
      featured: true
    - plan: 4
      price: 200
      objects: '500 000'
      storage: 500 GB
      ai: '5 000 000'
      extras:
        - ID-autentimine
        - Oma domeen
        - Prioriteetne tugi

faq:
  anchor: faq
  heading: Korduma kippuvad küsimused
  items:
    - q: Kas ma pean oskama programmeerida?
      a: Ei. Kogu andmemudeli — objektitüübid, väljad, seosed ja õigused — ehitad kasutajaliideses. Arendajad saavad soovi korral ühenduda REST API kaudu.
    - q: Mille poolest erineb Entu tabelarvutusest?
      a: Tabelarvutus on üks lame leht ega tule toime seoste, failide ega juurdepääsuõigustega. Entu hoiab tüübitud objekte hierarhias, seob kirjed omavahel, hoiab faile ja laseb õigustel ülemobjektilt edasi kanduda.
    - q: Mille poolest erineb see Airtable'ist või kohandatud andmebaasist?
      a: Entu on skeemivaba ja muutub jooksvalt — lisa või muuda objektitüüpe ja välju igal ajal, ilma migratsioonideta. Sellega on kaasas nii kasutajaliides kui ka REST API, seega haldusliidest pole vaja ehitada.
    - q: Kas saan oma olemasolevad andmed importida?
      a: Jah — impordi CSV-st ja muudest allikatest pluginate abil või loo objekte hulgi API kaudu.
    - q: Kes näeb minu andmeid?
      a: Juurdepääsu määrad objekti kaupa nelja tasemega — omanik, toimetaja, laiendaja, vaataja — ja objektid saab seadistada õigusi ülemobjektilt pärima. Igal kontol on oma eraldiseisev andmebaas.
    - q: Kas saan seda kasutada telefonis?
      a: Jah — Entu töötab igas veebilehitsejas ning sellel on natiivrakendused iPhone'ile, iPadile ja Macile.
    - q: Kui palju see maksab?
      a: Paketid algavad 2 €/kuus. Kõik astmed leiad allolevast hinnatabelist.

partners:
  heading: Partnerid ja kliendid
  names:
    - Are Põhikool
    - August Kitzbergi nimeline Gümnaasium
    - Eesti Keele Instituut
    - Eesti Kunstiakadeemia
    - Eesti Rahvusvahelise Arengukoostöö Keskus
    - Eesti Sõjamuuseum – kindral Laidoneri muuseum
    - Okupatsioonide ja vabaduse muuseum Vabamu
    - Piletilevi AS
    - Pillimuuseum MTÜ
    - TÜ Roots Robotics
    - Tallinna Ehituskool
    - Tallinna Läänemere Gümnaasium
    - Toidu- ja Fermentatsioonitehnoloogia Arenduskeskus
    - Vasalemma Põhikool
    - Wõrgu Wõlurid OÜ
---

<home-landing />
