# AI-nähtavus ja agendivalmidus

Teenuse veebileht: https://rkcd.github.io/ai-nahtavus/
Teenuse osutaja: Robert Kond (https://rkcd.github.io/robertkond.github.io/)

## Arhitektuur

Puhas staatiline leht GitHub Pagesis. Build-sammu, raamistikku ega sõltuvusi pole. `.nojekyll` lülitab Jekylli välja, seega **iga repos olev fail on avalikult URL-iga kättesaadav**.

| Fail | Mis see on |
|---|---|
| `index.html` | Teenuseleht. Eesti keel vaikimisi, inglise keel `?lang=en`. JSON-LD on `<head>`-is. |
| `blog/index.html` | Mõõtmiste register. `blog/post-template.html` on artikli mall (noindex, linkimata). |
| `llms.txt` | Lühike masinloetav ülevaade teenusest. |
| `teenused.md` | Teenuste kirjeldus Markdownis, inimesele ja masinale. |
| `docs/` | `ARHITEKTUUR.md` (moodulid 1–5 ja millal neid ehitada) ning profiili ja mõõtmise andmeskeemide kavandid. |
| `site.css`, `site.js` | Kujundus ja skript (keelelüliti, tellimisvorm). Ühine päritolu Roberti isikliku lehega. Kui muudad üht, kaalu sama muudatust teises. |

**Keeled.** Mõlemad keeled on samas failis kahe plokina (`<div class="page" data-lang="…">`). Vaikekeel on `<html data-default-lang="et">` atribuudis. Teise keele saab avada `?lang=en` või `-en` lõpuga ankruga (`#test-en`).

**Tellimisvorm.** `form.order` koostab eeltäidetud `mailto:`-lingi ega salvesta midagi.

## Käivitamine

```bash
python3 -m http.server 8000
```

Ava http://localhost:8000.

## Testimine enne avaldamist

- 375 px ja töölaua laiusel: külgkerimist pole, konsool on puhas, keelelüliti töötab mõlemas suunas.
- Kõik sisemised lingid ja ankrud avanevad mõlemas keeles.
- Tellimisvorm: tühja vormi ei saa saata, täidetud vorm avab eeltäidetud kirja.
- JSON-LD: https://validator.schema.org/ ja Google Rich Results Test. JSON-LD peab vastama nähtavale tekstile: ei mingeid hindu peale tasuta testi, hinnanguid ega kliente.
- Teenuste sisu muutmisel uuenda koos: `index.html` (mõlemad keeled + JSON-LD), `llms.txt`, `teenused.md`.

## Avaldamine

1. Töö käib feature branch'is, `main` harusse läheb pull request'i kaudu Roberti loal.
2. GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root.
3. Oma domeen hiljem: lisa `CNAME` fail ja DNS-kirje, uuenda absoluutsed URL-id (`index.html` JSON-LD ja meta, `llms.txt`, `teenused.md`, `blog/index.html` canonical).

## Mustandid ja kliendiandmed

Repo on avalik. Mõõtmisandmed, kliendiprofiilid ja artiklimustandid **ei tohi siia sattuda**, ka mitte linkimata kujul. Hoia neid eraldi privaatses repos (soovitus: `RKCD/ai-nahtavus-data`). `.gitignore` on ainult kaitsevõrk.

Sisureeglid AI-toimetajale on failis [CLAUDE.md](CLAUDE.md).
