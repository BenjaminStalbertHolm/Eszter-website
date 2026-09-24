# Eszter.se

Hemsida för **Eszter Kunszt**, konditor och bagare. Den visar hennes skapelser, samlar recept och tar emot tårtbeställningar, och den hör ihop med hennes Instagram.

Stilen ska kännas som en hembakad tårta: ordentlig men inte "corporate". Inspirationen kommer från franska pâtisserie-markiser, ungerska folkkonstblommor, 50-talscaféer och förgätmigej. Maskoten är konditorgåsen.

Sajten byggs med [Eleventy](https://www.11ty.dev/) och blir helt statisk (bara HTML, CSS och lite JavaScript), så den är snabb, billig att drifta och går att lägga nästan var som helst.

---

## Kom igång

Du behöver [Node.js](https://nodejs.org/) version 18 eller senare (22 rekommenderas).

```bash
npm install     # första gången
npm start       # startar en lokal server på http://localhost:8080 som laddar om automatiskt
npm run build   # bygger den färdiga sajten till mappen _site/
```

## Checklista innan sajten går live

Några uppgifter är platshållare och **måste** bytas ut:

- [ ] `src/_data/site.json` → `email`: Eszters riktiga e-postadress
- [ ] `src/_data/site.json` → `instagram`: Eszters Instagram-namn (utan @). Just nu står `eszter.bakar` som exempel
- [ ] `src/_data/site.json` → `location`: gärna en stad i stället för "Sverige"
- [ ] `src/_data/site.json` → `portrait`: ett porträtt av Eszter (annars visas en målad palett)
- [ ] Byt illustrationerna i galleriet mot riktiga foton (se nedan)
- [ ] Läs igenom texterna. De är skrivna i Eszters röst som ett första utkast, så justera allt som inte stämmer. Det gäller särskilt:
  - `src/_data/om.json` (snabbfakta och kompetenser)
  - `src/_data/bestallning.json` (framförhållning, allergier, leverans)
  - `src/om.njk` och `src/index.njk` (berättelsen)
  - `src/_data/skapelser.json`: exempel på skapelser som ska ersättas med Eszters egna
- [ ] Läs igenom exempelrecepten i `src/recept/` och byt ut dem eller gör dem till dina egna
- [ ] Bestäm hur beställningar ska tas emot (se "Beställningsformuläret")
- [ ] **Sätt riktiga priser i tårtbyggaren**: alla priser i `src/_data/tartbyggare.json` är exempel

## Så uppdaterar du innehållet

Allt innehåll ligger i `src/`. Det mesta är vanliga textfiler som går att redigera direkt i GitHub: klicka på filen och sedan på pennan.

| Vad | Var |
| --- | --- |
| Namn, e-post, Instagram, stad | `src/_data/site.json` |
| Galleriet (Skapelser) | `src/_data/skapelser.json` |
| Instagram-rutorna på startsidan | `src/_data/instagram.json` |
| Snabbfakta och kompetenser | `src/_data/om.json` |
| Beställningssidans erbjudanden och vanliga frågor | `src/_data/bestallning.json` |
| Tårtbyggarens byggblock och priser | `src/_data/tartbyggare.json` |
| Recept | `src/recept/*.md` |
| Sidornas texter | `src/index.njk`, `src/om.njk`, `src/bestall.njk` … |

### Lägga till ett recept

1. Kopiera en befintlig fil i `src/recept/`, till exempel `madeleines.md`, och ge den ett nytt namn, t.ex. `kurtoskalacs.md`. Filnamnet blir webbadressen: `eszter.se/recept/kurtoskalacs/`.
2. Ändra uppgifterna mellan `---`-strecken högst upp:

```yaml
---
title: Receptets namn
subtitle: En mening som lockar.
date: 2026-10-01              # publiceringsdatum, nyast visas först
category: Tårtor              # t.ex. Tårtor, Småkakor, Bröd
origin: Ungern                # valfritt
time: ca 1 timme
servings: 8 bitar
difficulty: 2                 # 1 = lätt, 2 = medel, 3 = utmanande
illustration: dobos           # används om det inte finns någon bild
image: /assets/img/recept/mitt-foto.webp   # valfritt foto
alt: Beskrivning av fotot
tone: rosa                    # bakgrundsfärg: rosa, mint, smor eller forgatmigej
ingredients:
  - group: Botten             # rubriken är valfri
    items:
      - 3 ägg
      - 1 ½ dl socker
instructions:
  - group: Botten
    steps:
      - Sätt ugnen på 175 °C.
      - Vispa ägg och socker **pösigt**.
tips:
  - Ett litet tips från Eszter.
---

Här skriver du en inledning till receptet, gärna med en historia.
```

Knapparna för ½×, 1× och 2× räknar om de ingredienser som börjar med ett tal, så skriv gärna mängden först ("150 g smör"). Recepten får också strukturerad data automatiskt, så att Google kan visa dem snyggt i sökresultaten.

### Lägga till riktiga foton

1. Spara bilden i `src/assets/img/`, till exempel i en undermapp som `skapelser/`. Förminska den först till ungefär 1600 px bred och spara helst som `.webp` eller `.jpg`.
2. Fyll i `image` och `alt` (en kort beskrivning av bilden) för rätt skapelse i `skapelser.json`, rätt inlägg i `instagram.json` eller i receptets toppdel.
3. Så länge `image` är tom visas den handritade illustrationen i stället.

Tillgängliga illustrationer: `dobos`, `esterhazy`, `brollopstarta`, `macarons`, `saint-honore`, `tartelette`, `entremet`, `croissant`, `madeleines`, `palett`.

## Tårtbyggaren (`/designa/`)

Här kan besökare bygga en tårta av färdiga byggblock: storlek, smak, färg, stil, detaljer, något på toppen, text och specialkost. Tårtan ritas upp medan man väljer, och priset räknas ut direkt. När beställningen skickas följer en lista över valen, det uppskattade priset och en länk till just den designen med.

**Ändra priser och alternativ** i `src/_data/tartbyggare.json`:

- `price` är i kronor. Storleken är grundpriset, och allt annat läggs till.
- `textPrice` är tillägget för text på tårtan, och `textMaxLength` styr hur lång texten får vara.
- `default: true` markerar vad som är förvalt.
- Ett alternativ går att ta bort eller byta namn på fritt. Nya alternativ räknas in i priset direkt. Förhandsbilden känner dock bara igen de id:n som finns från början (till exempel `droppglasyr` och `gasen`), så ett helt nytt id syns bara i priset och i beställningen, inte på bilden.

Priset visas alltid som *uppskattat*. Eszter bekräftar det slutliga priset när hon svarar.

## Beställningsformuläret

Det här gäller både förfrågan på Beställ-sidan och beställningen från tårtbyggaren. Utan inställningar öppnar formuläret besökarens mejlprogram med förfrågan ifylld, adresserad till `email` i `site.json`. Det fungerar direkt, men kräver att besökaren har ett mejlprogram.

Bättre är att ta emot förfrågningarna direkt:

1. Skapa ett gratis formulär på [Formspree](https://formspree.io/) (eller en liknande tjänst).
2. Klistra in formulärets adress i `site.json` → `orderFormEndpoint`, t.ex. `"https://formspree.io/f/abcdwxyz"`.
3. Klart! Förfrågningarna kommer nu som mejl, och besökaren får ett tack direkt på sidan.

## Publicera sajten

### GitHub Pages (ingår)

`.github/workflows/publicera.yml` bygger och publicerar sajten varje gång något hamnar på `main`.

1. I GitHub: **Settings → Pages → Source: GitHub Actions**.
2. Egen domän: skriv `eszter.se` under **Settings → Pages → Custom domain** och följ GitHubs instruktioner för DNS hos domänleverantören.
3. Utan egen domän (sajten ligger då under `…github.io/Eszter-website/`): lägg till repo-variabeln `PATH_PREFIX` med värdet `/Eszter-website/` under **Settings → Secrets and variables → Actions → Variables**.

### Andra alternativ

Netlify, Cloudflare Pages och Vercel fungerar också: byggkommandot är `npm run build` och mappen som ska publiceras är `_site`.

## Varumärke & Instagram

Sajten och Instagram ska kännas som samma ställe.

**Färger** (definierade i `src/assets/css/main.css`). Ingen ren vit och ingen ren svart:

| Namn | Hex | Används till |
| --- | --- | --- |
| Grädde | `#FBF3E4` | bakgrund |
| Papper | `#FFF9EF` | kort, ytor |
| Kakao | `#3B2A25` | text, konturer (i stället för svart) |
| Paprika | `#C8363D` | kockmössan, knappar, markisen |
| Förgätmigej | `#9CC0EE` | blommor, detaljer |
| Mint | `#BFE3D0` | 50-talscafé, sidfot |
| Rosa | `#F6CACB` | bakgrunder |
| Smör | `#F6D57A` | bakgrunder, detaljer |
| Aprikos | `#F0913A` | näbben |

**Typsnitt** (gratis, [Google Fonts](https://fonts.google.com/)): *Fraunces* för rubriker, *Nunito* för brödtext och *Caveat* för handskrivna anteckningar. Alla tre går att ladda ner, så att Instagram-bilderna kan använda samma typsnitt som sajten.

**Färdigt material i `brand/`:**

- `brand/instagram/hojdpunkt-*.png`: omslag till Instagram-höjdpunkter (Tårtor, Recept, Beställ, Om mig, Konst, Bakom kulisserna)
- `src/assets/img/favicon-512.png`: fungerar fint som profilbild
- `src/assets/img/delning.png`: bilden som visas när någon delar en länk till sajten
- `brand/source/`: originalloggan och högupplösta versioner av gåsen

**Tips för att knyta ihop sajten och Instagram:**

- Sätt `eszter.se/lankar` som länk i Instagram-bion. Sidan är gjord för mobilen och samlar de viktigaste länkarna, inklusive det senaste receptet.
- Använd höjdpunktsomslagen och gåsen som profilbild.
- Lägg upp favoritbilder i `instagram.json` så att de syns på startsidan.
- Skriv "Recept på eszter.se" i inlägg om bakverk som har ett recept på sajten.

## Struktur

```
src/
  _data/           innehåll i JSON (site, skapelser, instagram, om, bestallning)
  _includes/
    layouts/       sidmallar (base, recept)
    partials/      sidhuvud, sidfot, ikoner, återanvändbara delar
    illustrationer/ handritade SVG-tårtor
  assets/          css, js och bilder
  recept/          ett recept per .md-fil
  index.njk        startsidan
  skapelser.njk    galleriet
  recept.njk       receptöversikten
  om.njk           om Eszter
  bestall.njk      beställning
  designa.njk      tårtbyggaren (logiken finns i assets/js/tartbyggare.js)
  lankar.njk       länksida för Instagram-bion
brand/             logga, Instagram-material och källfiler
```
