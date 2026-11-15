# Reeglid AI-toimetajale

See on Robert Kondi AI-nähtavuse teenuse leht. Iga lause on tema nimel antud lubadus kliendile.

## Sisu

- Ära luba, et ChatGPT või mõni muu AI hakkab klienti soovitama. Ära luba otsingupositsioone ega müügitulemusi. Schema.org ja llms.txt ei ole garantii.
- Ära avalda hindu peale „tasuta", kuni Robert on hinnad kinnitanud.
- Ära lisa kliente, logosid, iseloomustusi, numbreid ega mõõtmistulemusi, mida pole päriselt olnud. Kui pole kindel, küsi Robertilt.
- Erand: `naidisraport.html` ja `agent/profiilid/naidiskute.json` on väljamõeldud ettevõttega demo. Näidisraport on selgelt märgitud, `noindex` ja assistendid on A, B, C. Profiilis on `"demo": true` ja hoiatus.
- Agendikihis on päris ettevõtte profiil lubatud ainult omaniku kirjaliku kinnitusega. Agent ei kinnita kunagi aega ega hinda, ainult koostab mustandi.
- Kinnitamata hind, kestus, ulatus jms on lehel nähtavalt `<span class="tbd">[kinnitamata]</span>`. Ära asenda neid oletustega.
- JSON-LD peab vastama lehel nähtavale tekstile. Teenuste sisu muutmisel uuenda ka `llms.txt` ja `teenused.md`.
- AI vastuseid ei esitata faktina. Mõõtmistes on fakt, vaatlus ja tõlgendus eraldi.
- Teiste ettevõtete nimesid, mis mõõtmistes esinevad, ei avaldata ilma loata.
- Mustandid, mõõtmisandmed ja kliendiprofiilid ei kuulu sellesse avalikku reposse.
- Sisemist metoodikat ei avaldata: täpsed küsimuste mallid, hindamisloogika, mõõtmise andmestruktuur, allikate prioriseerimise reeglid, kontrollnimekirjad, automatiseerimise kirjeldused. Avalikult on lubatud töö põhietapid, väljundid, piirangud ja illustratiivne näidisraport.
- Ära väida, et konkurentsieelis on tõestatud. Teenus on esimeste pilootide etapis.
- Ära väida, et teenus on õiguslikult või GDPR-i mõttes auditeeritud.
- E-post on acceleratedigitaltwin@gmail.com.

## Hääl

- Mina-vorm („Kontrollin", „Mõõdan"). Teenust teeb üks inimene.
- Lühikesed, konkreetsed laused. Ei hüüumärke, emotikone ega superlatiive.
- Kliendi probleem tema enda sõnadega: „kliendid ei leia mind", „vale telefon kataloogis". AI on teine lause, mitte esimene.
- Eestikeelne tekst on loomulik eesti keel, mitte tõlge. Mõlemad keeled on sisuliselt täielikud.

## Disain

- Öötaevas, kuldne aktsent, türkiissinine mõõtmispaneel, hero-foto (rannik ja valgustatud töökojad). Futuristlikult lihtne: vähe elemente, palju õhku, ei põhjendamatuid animatsioone.
- Enne pushi kontrolli 375 px ja töölaua laiusel. Külgkerimist pole ja konsool on puhas.
- Sisu peab olema loetav ka ilma JavaScriptita: mõlemad keeleplokid on HTML-is nähtavad, `<head>`-i skript peidab teise keele.

## Töökord

- Töö käib feature branch'is. `main` harusse ei push'ita ilma Roberti loata.
- Väikesed, loogilised commit'id.
- Uut tehnoloogiat (raamistik, backend, andmebaas) ei lisata ilma põhjenduseta Roberti privaatse arhitektuuriplaani alusel.
