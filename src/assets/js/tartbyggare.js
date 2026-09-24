// Tårtbyggaren: ritar en förhandsbild av tårtan medan man väljer
// och räknar ut ett uppskattat pris. Alternativ och priser kommer från
// src/_data/tartbyggare.json (via formuläret på sidan).

const form = document.querySelector("[data-tartbyggare]");
if (form) startaByggaren(form);

function startaByggaren(form) {
  const KAKAO = "#3B2A25";
  const PAPPER = "#FFF9EF";
  const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kronor = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });

  const scener = [...document.querySelectorAll("[data-forhandsvisning]")];
  const beskrivning = document.querySelector("[data-beskrivning]");
  const kvitto = document.querySelector("[data-kvitto]");
  const sammanfattning = document.querySelector("[data-sammanfattning]");
  const siffraFalt = document.querySelector("[data-siffrafalt]");
  const raknare = document.querySelector("[data-teckenraknare]");
  const gasBild = document.querySelector("[data-gasbild]")?.src;
  const bestallning = document.getElementById("bestall-tarta");
  const textPris = Number(form.dataset.textpris) || 0;
  const textInput = form.elements.namedItem("text");
  const siffraInput = form.elements.namedItem("siffra");

  // Storlek → våningar (bredd och höjd i SVG-enheter), nedifrån och upp
  const STORLEKAR = {
    liten: [{ rx: 78, h: 78 }],
    mellan: [{ rx: 100, h: 86 }],
    stor: [{ rx: 122, h: 94 }],
    vaningar: [{ rx: 122, h: 82 }, { rx: 80, h: 72 }],
  };
  const MORKA_SMAKER = ["choklad-hallon", "dobos"];

  /* ---------- Läs av valen ---------- */
  const valt = (namn) => form.querySelector(`input[name="${namn}"]:checked`);
  const allaValda = (namn) => [...form.querySelectorAll(`input[name="${namn}"]:checked`)];

  function lasVal() {
    const farg = valt("farg");
    const siffra = Math.max(0, Math.min(120, parseInt(siffraInput?.value, 10) || 0));
    return {
      storlek: valt("storlek")?.value,
      smak: valt("smak")?.value,
      farg: farg?.dataset.farg || "#FFF4E4",
      fargId: farg?.value,
      yta: valt("yta")?.value,
      detaljer: allaValda("detaljer").map((i) => i.value),
      topp: valt("topp")?.value,
      siffra,
      text: (textInput?.value || "").trim(),
    };
  }

  /* ---------- Pris ---------- */
  function raknaPris(val) {
    const rader = [];
    for (const falt of form.querySelectorAll("fieldset[data-steg]")) {
      for (const input of falt.querySelectorAll("input[data-pris]:checked")) {
        let namn = input.dataset.etikett;
        if (input.value === "siffra") namn += ` ${val.siffra}`;
        rader.push({ steg: falt.dataset.steg, namn, pris: Number(input.dataset.pris) || 0 });
      }
    }
    if (val.text) rader.push({ steg: "Text", namn: `”${val.text}”`, pris: textPris });
    const summa = rader.reduce((s, r) => s + r.pris, 0);
    return { rader, summa };
  }

  /* ---------- Färghjälp ---------- */
  const hexTillRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const blanda = (a, b, t) => {
    const [r1, g1, b1] = hexTillRgb(a);
    const [r2, g2, b2] = hexTillRgb(b);
    const m = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
    return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
  };
  const arMork = (hex) => {
    const [r, g, b] = hexTillRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b < 140;
  };
  const skydda = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const r1 = (n) => Math.round(n * 10) / 10;
  // Förutsägbar "slump" så att bilden inte hoppar runt vid varje ändring
  const slump = (i) => {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  /* ---------- Rita tårtan ---------- */
  function ritaTarta(val, id) {
    const vaningar = STORLEKAR[val.storlek] || STORLEKAR.mellan;
    const cx = 200;
    const bredast = Math.max(...vaningar.map((v) => v.rx));
    const svamp = MORKA_SMAKER.includes(val.smak) ? "#7A4D3A" : "#F2D49B";
    // spritsningen ska synas mot krämen: gul på choklad, rosa på vitt, annars gräddvit
    const spritsfarg = arMork(val.farg) ? "#F6D57A" : val.fargId === "gradde" ? "#E88F98" : PAPPER;
    const har = (d) => val.detaljer.includes(d);

    let defs = "";
    let kropp = "";
    let ovanpa = "";

    // tårtfat på fot, som på ett 50-talscafé
    kropp += `<path d="M178,306 L166,346 L234,346 L222,306 Z" fill="#DCE8F8"/>`;
    kropp += `<ellipse cx="200" cy="348" rx="62" ry="11" fill="#DCE8F8"/>`;
    kropp += `<ellipse cx="200" cy="302" rx="${bredast + 40}" ry="${r1((bredast + 40) * 0.16)}" fill="#E4EEFA"/>`;
    kropp += `<path d="M${200 - bredast - 12},305 A${bredast + 12},${r1((bredast + 12) * 0.14)} 0 0 0 ${200 + bredast + 12},305" fill="none" stroke="#9CC0EE" stroke-width="3"/>`;
    kropp += `<ellipse cx="206" cy="302" rx="${bredast + 6}" ry="${r1(bredast * 0.2)}" fill="${KAKAO}" opacity=".12" stroke="none"/>`;

    let botten = 298;
    let blomIndex = 0;
    vaningar.forEach((v, i) => {
      const ry = r1(v.rx * 0.24);
      const topp = botten - v.h;
      const vanster = cx - v.rx;
      const hoger = cx + v.rx;
      const sida = `M${vanster},${topp} L${vanster},${botten} A${v.rx},${ry} 0 0 0 ${hoger},${botten} L${hoger},${topp} Z`;
      const band = (y1, y2, fill, extra = "") =>
        `<path d="M${vanster},${y1} A${v.rx},${ry} 0 0 0 ${hoger},${y1} L${hoger},${y2} A${v.rx},${ry} 0 0 1 ${vanster},${y2} Z" fill="${fill}" stroke="none"${extra}/>`;
      // y-läget på tårtans framsida för en viss horisontell position (u = -1…1)
      const framsida = (u, y) => r1(y + ry * Math.sqrt(Math.max(0, 1 - u * u)));
      const sistaVaning = i === vaningar.length - 1;
      const harText = Boolean(val.text) && i === 0; // texten hamnar på den bredaste (nedersta) våningen

      // sidan
      if (val.yta === "naked") {
        kropp += `<path d="${sida}" fill="${svamp}"/>`;
        const lager = 3;
        for (let l = 1; l < lager; l++) {
          const y = topp + (v.h / lager) * l - 4;
          kropp += band(r1(y), r1(y + 8), val.farg);
        }
        kropp += `<path d="${sida}" fill="${val.farg}" opacity=".35" stroke="none"/>`;
      } else if (val.yta === "ombre") {
        const gid = `ombre-${id}-${i}`;
        defs += `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${blanda(val.farg, PAPPER, 0.65)}"/><stop offset=".55" stop-color="${blanda(val.farg, PAPPER, 0.2)}"/><stop offset="1" stop-color="${blanda(val.farg, KAKAO, 0.18)}"/></linearGradient>`;
        kropp += `<path d="${sida}" fill="url(#${gid})"/>`;
      } else {
        kropp += `<path d="${sida}" fill="${val.farg}"/>`;
        kropp += `<path d="M${vanster + 12},${topp + ry + 8} L${vanster + 12},${botten - 4}" stroke="${PAPPER}" stroke-width="6" opacity=".45" fill="none"/>`;
      }
      // konturen ovanpå fyllningarna
      kropp += `<path d="${sida}" fill="none"/>`;

      if (val.yta === "vintage") {
        const n = Math.max(3, Math.round(v.rx / 26));
        let d = "";
        for (let k = 0; k < n; k++) {
          const u0 = -0.92 + (1.84 / n) * k;
          const u1 = u0 + 1.84 / n;
          const um = (u0 + u1) / 2;
          const y0 = framsida(u0, topp + 6);
          const y1 = framsida(u1, topp + 6);
          const ym = framsida(um, topp + 6) + 20;
          d += `M${r1(cx + u0 * v.rx)},${y0} Q${r1(cx + um * v.rx)},${ym} ${r1(cx + u1 * v.rx)},${y1} `;
        }
        kropp += `<path d="${d}" fill="none" stroke="${spritsfarg}" stroke-width="5"/>`;
        kropp += `<path d="${d}" fill="none" stroke="${KAKAO}" stroke-width="1.5" opacity=".5"/>`;
        const parlor = Math.round(v.rx / 8);
        for (let k = 0; k <= parlor; k++) {
          const a = Math.PI - (Math.PI * k) / parlor;
          kropp += `<circle cx="${r1(cx + v.rx * Math.cos(a))}" cy="${r1(botten + ry * Math.sin(a) - 2)}" r="4.6" fill="${spritsfarg}" stroke-width="2"/>`;
        }
      }

      if (har("strossel")) {
        const farger = ["#C8363D", "#F6D57A", "#7BA6E0", "#8FB56E", "#F0913A", "#E88F98"];
        for (let k = 0; k < Math.round(v.rx / 4); k++) {
          const u = -0.9 + slump(k + i * 50) * 1.8;
          const y = framsida(u, topp + 10 + slump(k * 3 + i) * (v.h - 18));
          const x = cx + u * v.rx;
          const vinkel = slump(k * 7) * 180;
          kropp += `<path d="M${r1(x - 4)},${y} L${r1(x + 4)},${y}" stroke="${farger[k % farger.length]}" stroke-width="3.5" transform="rotate(${r1(vinkel)} ${r1(x)} ${y})"/>`;
        }
      }

      if (har("guldblad")) {
        for (let k = 0; k < 4; k++) {
          const u = -0.7 + slump(k * 11 + i * 3) * 1.4;
          const x = r1(cx + u * v.rx);
          const y = framsida(u, topp + 14 + slump(k * 5 + i) * (v.h - 30));
          kropp += `<path d="M${x},${y} l7,-5 l6,4 l-3,7 l-8,1 Z" fill="#EDC45A" stroke-width="2"/>`;
        }
      }

      if (har("forgatmigej")) {
        // en kaskad som klättrar på sidorna, utan att skymma texten i mitten
        let punkter = sistaVaning
          ? [[-0.72, 0.18, 1.15], [-0.56, 0.42, 0.85], [-0.8, 0.62, 0.7], [0.6, 0.55, 0.9], [0.76, 0.8, 1.1]]
          : [[0.52, 0.2, 1], [0.7, 0.45, 1.2], [0.56, 0.75, 0.8], [-0.62, 0.7, 0.95]];
        if (harText) {
          // lämna mitten fri för texten
          punkter = [...punkter, [0.62, 0.16, 0.9], [-0.4, 0.14, 0.75]].filter(([u, t]) => t < 0.4 || Math.abs(u) >= 0.8);
        }
        for (const [u, t, s] of punkter) {
          const x = r1(cx + u * v.rx);
          const y = framsida(u, topp + t * v.h);
          kropp += `<path d="M0,0 C4,-6 13,-7 19,0 C13,7 4,6 0,0 Z" fill="#8FB56E" stroke-width="2" transform="translate(${x + 6} ${y + 4}) rotate(${(blomIndex++ * 67) % 360})"/>`;
          kropp += `<use href="#forgatmigej" x="-13" y="-13" width="26" height="26" transform="translate(${x} ${y}) scale(${s})" stroke="none"/>`;
        }
      }

      // ovansidan
      const toppFarg = val.yta === "naked" ? blanda(val.farg, PAPPER, 0.3) : val.yta === "ombre" ? blanda(val.farg, PAPPER, 0.65) : blanda(val.farg, PAPPER, 0.15);
      kropp += `<ellipse cx="${cx}" cy="${topp}" rx="${v.rx}" ry="${ry}" fill="${toppFarg}"/>`;

      if (sistaVaning) {
        if (har("droppglasyr")) {
          const choklad = "#5A3A2C";
          const langder = [14, 28, 18, 34, 12, 26, 20, 36, 14, 24, 30, 16];
          const steg = Math.max(6, Math.round(v.rx / 12));
          let d = `M${vanster},${topp}`;
          for (let k = 1; k < steg; k++) {
            const a = Math.PI - (Math.PI * k) / steg;
            const x = r1(cx + v.rx * Math.cos(a));
            const y = r1(topp + ry * Math.sin(a));
            if (k % 2) {
              const l = Math.min(langder[k % langder.length], v.h - 20);
              d += ` L${r1(x - 5)},${y} L${r1(x - 5)},${r1(y + l)} Q${x},${r1(y + l + 9)} ${r1(x + 5)},${r1(y + l)} L${r1(x + 5)},${y}`;
            } else {
              d += ` L${x},${y}`;
            }
          }
          d += ` L${hoger},${topp} A${v.rx},${ry} 0 0 0 ${vanster},${topp} Z`;
          kropp += `<path d="${d}" fill="${choklad}"/>`;
          kropp += `<path d="M${r1(cx - v.rx * 0.5)},${r1(topp - ry * 0.45)} Q${cx},${r1(topp - ry * 0.75)} ${r1(cx + v.rx * 0.35)},${r1(topp - ry * 0.5)}" stroke="#8A5A44" stroke-width="4" fill="none" opacity=".8"/>`;
        }

        // saker som ligger på toppen, sorterade bakifrån och fram
        const saker = [];
        if (har("bar")) {
          [200, 222, 250, 285, 318, 340, 160, 138, 20, 45, 110, 75].forEach((grad, k) => {
            const a = (grad * Math.PI) / 180;
            const avstand = v.rx * (0.72 - (k % 3) * 0.06);
            const x = r1(cx + avstand * Math.cos(a));
            const y = r1(topp + ry * 0.72 * Math.sin(a) - 4);
            saker.push({
              y,
              svg:
                k % 3 === 2
                  ? `<circle cx="${x}" cy="${y}" r="6" fill="#4F6FB0" stroke-width="2"/><circle cx="${x}" cy="${r1(y - 2)}" r="1.4" fill="${KAKAO}" stroke="none"/>`
                  : `<circle cx="${x}" cy="${y}" r="7.5" fill="#C8363D" stroke-width="2"/><path d="M${r1(x - 3)},${r1(y - 1)} l0,0 M${r1(x + 3)},${r1(y + 1)} l0,0 M${x},${r1(y + 4)} l0,0" stroke="#F4A3A8" stroke-width="2.4"/>`,
            });
          });
        }
        if (har("macarons")) {
          const farger = [["#F4B8BE", "#C8363D"], ["#C9DEA6", "#8FB56E"], ["#B9D1F3", "#6C92D2"]];
          [215, 270, 325].forEach((grad, k) => {
            const a = (grad * Math.PI) / 180;
            const x = r1(cx + v.rx * 0.5 * Math.cos(a) - 16);
            const y = r1(topp + ry * 0.5 * Math.sin(a) - 16);
            const [skal, fyllning] = farger[k];
            saker.push({
              y: y + 16,
              svg: `<g transform="translate(${x} ${y})" stroke-width="2.5"><path d="M1,11 C1,2 9,0 16,0 C23,0 31,2 31,11 Z" fill="${skal}"/><rect x="3" y="11" width="26" height="5" rx="2" fill="${fyllning}"/><path d="M1,16 L31,16 C31,22 25,23 16,23 C7,23 1,22 1,16 Z" fill="${skal}"/></g>`,
            });
          });
        }
        saker.sort((a, b) => a.y - b.y).forEach((s) => (kropp += s.svg));

        // pynt på toppen
        if (val.topp === "hjarta") {
          kropp += `<path d="M${cx},${topp} L${cx},${topp - 52}" stroke-width="4" fill="none"/>`;
          kropp += `<path d="M0,12 C-24,-6 -18,-28 0,-15 C18,-28 24,-6 0,12 Z" fill="#C8363D" transform="translate(${cx} ${topp - 66}) scale(1.3)" stroke-width="3.5"/>`;
          kropp += `<path d="M-8,-14 C-12,-12 -13,-8 -12,-5" stroke="${PAPPER}" stroke-width="3" fill="none" transform="translate(${cx} ${topp - 66}) scale(1.3)"/>`;
        } else if (val.topp === "blommor") {
          [[-22, -6, 0.8], [18, -8, 0.85], [-4, -20, 1], [8, 2, 0.9], [-14, 6, 0.75]].forEach(([dx, dy, s], k) => {
            kropp += `<path d="M0,0 C4,-6 13,-7 19,0 C13,7 4,6 0,0 Z" fill="#8FB56E" stroke-width="2" transform="translate(${cx + dx} ${topp + dy}) rotate(${k * 72 + 20})"/>`;
          });
          [[-18, -12, 1.1], [14, -16, 1.2], [0, -2, 1.3], [-4, -30, 1], [22, -2, 0.9], [-24, 2, 0.9]].forEach(([dx, dy, s]) => {
            kropp += `<use href="#forgatmigej" x="-13" y="-13" width="26" height="26" transform="translate(${cx + dx} ${topp + dy}) scale(${s})" stroke="none"/>`;
          });
        } else if (val.topp === "siffra") {
          kropp += `<path d="M${cx - 12},${topp} L${cx - 12},${topp - 26} M${cx + 12},${topp} L${cx + 12},${topp - 26}" stroke-width="3.5" fill="none"/>`;
          ovanpa += `<text x="${cx}" y="${topp - 24}" text-anchor="middle" class="byggare__siffra">${val.siffra}</text>`;
        } else if (val.topp === "gasen" && gasBild) {
          const hojd = 128;
          ovanpa += `<image href="${skydda(gasBild)}" x="${cx - 36}" y="${r1(topp - hojd + ry * 0.35)}" width="${r1(hojd * 0.6375)}" height="${hojd}"/>`;
        }

      }

      // text på framsidan, böjd efter tårtans form
      if (harText) {
        const mitt = topp + v.h * 0.55;
        const u = 0.82;
        const y = framsida(u, mitt);
        const pid = `textbage-${id}`;
        defs += `<path id="${pid}" d="M${r1(cx - u * v.rx)},${y} A${v.rx},${ry} 0 0 0 ${r1(cx + u * v.rx)},${y}"/>`;
        const storlek = Math.min(32, Math.max(18, v.rx / 3.4));
        const maxBredd = v.rx * 1.55;
        const uppskattad = val.text.length * storlek * 0.42;
        const langd = uppskattad > maxBredd ? ` textLength="${r1(maxBredd)}" lengthAdjust="spacingAndGlyphs"` : "";
        const textfarg = arMork(val.farg) ? PAPPER : KAKAO;
        ovanpa += `<text class="byggare__text" font-size="${r1(storlek)}" fill="${textfarg}"${langd}><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${skydda(val.text)}</textPath></text>`;
      }
      botten = topp;
    });

    return `<svg viewBox="0 0 400 370" class="byggare__svg" focusable="false">
      <defs>${defs}</defs>
      <g filter="url(#skakig)" stroke="${KAKAO}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">${kropp}</g>
      ${ovanpa}
    </svg>`;
  }

  /* ---------- Beskrivning för skärmläsare & sammanfattning ---------- */
  function etikett(namn) {
    return valt(namn)?.dataset.etikett || "";
  }

  function beskriv(val) {
    const delar = [etikett("storlek"), etikett("smak"), etikett("farg"), etikett("yta")];
    const detaljer = allaValda("detaljer").map((i) => i.dataset.etikett);
    if (detaljer.length) delar.push(detaljer.join(", "));
    if (val.topp && val.topp !== "ingen") delar.push(`Topp: ${etikett("topp")}${val.topp === "siffra" ? " " + val.siffra : ""}`);
    if (val.text) delar.push(`Text: ”${val.text}”`);
    const kost = allaValda("specialkost").map((i) => i.dataset.etikett);
    if (kost.length) delar.push(kost.join(", "));
    return delar.filter(Boolean).join(" · ");
  }

  /* ---------- Dela via länk ---------- */
  function tillAdress() {
    const p = new URLSearchParams();
    for (const namn of ["storlek", "smak", "farg", "yta", "topp"]) if (valt(namn)) p.set(namn, valt(namn).value);
    for (const namn of ["detaljer", "specialkost"]) {
      const lista = allaValda(namn).map((i) => i.value);
      if (lista.length) p.set(namn, lista.join(","));
    }
    if (valt("topp")?.value === "siffra") p.set("siffra", siffraInput.value);
    if (textInput?.value.trim()) p.set("text", textInput.value.trim());
    return p.toString();
  }

  function franAdress() {
    const p = new URLSearchParams(location.hash.slice(1));
    if (![...p.keys()].length) return;
    form.reset();
    for (const [namn, varde] of p) {
      if (namn === "text" && textInput) textInput.value = varde.slice(0, textInput.maxLength > 0 ? textInput.maxLength : 40);
      else if (namn === "siffra" && siffraInput) siffraInput.value = parseInt(varde, 10) || 0;
      else if (namn === "detaljer" || namn === "specialkost") {
        const lista = varde.split(",");
        form.querySelectorAll(`input[name="${namn}"]`).forEach((i) => (i.checked = lista.includes(i.value)));
      } else {
        const input = [...form.querySelectorAll(`input[name="${namn}"]`)].find((i) => i.value === varde);
        if (input) input.checked = true;
      }
    }
  }

  /* ---------- Uppdatera allt ---------- */
  function uppdatera({ studsa = true } = {}) {
    const val = lasVal();
    const { rader, summa } = raknaPris(val);
    const pris = kronor.format(summa);

    scener.forEach((scen, i) => {
      scen.innerHTML = ritaTarta(val, scen.hasAttribute("data-mini") ? "mini" : `stor${i}`);
      if (studsa && !minskadRorelse) {
        scen.classList.remove("studsar");
        void scen.offsetWidth;
        scen.classList.add("studsar");
      }
    });
    document.querySelectorAll("[data-totalpris]").forEach((el) => (el.textContent = pris));

    if (kvitto) {
      kvitto.innerHTML = "";
      for (const rad of rader) {
        const li = document.createElement("li");
        const namn = document.createElement("span");
        namn.textContent = `${rad.steg}: ${rad.namn}`;
        const belopp = document.createElement("span");
        belopp.textContent = rad.pris ? kronor.format(rad.pris) : "ingår";
        li.append(namn, belopp);
        kvitto.append(li);
      }
      const total = document.createElement("li");
      total.className = "kvitto__total";
      total.innerHTML = `<span>Totalt</span><span>${pris}</span>`;
      kvitto.append(total);
    }

    const text = beskriv(val);
    if (beskrivning) beskrivning.textContent = `Förhandsvisning av tårtan: ${text}. Uppskattat pris ${pris}.`;
    if (sammanfattning) sammanfattning.textContent = text;
    if (siffraFalt) siffraFalt.hidden = val.topp !== "siffra";
    if (raknare && textInput) raknare.textContent = `${textInput.value.length} / ${textInput.maxLength}`;

    const adress = tillAdress();
    history.replaceState(null, "", adress ? `#${adress}` : location.pathname);
    if (bestallning) {
      bestallning.querySelector("[data-falt-design]").value = rader.map((r) => `${r.steg}: ${r.namn} – ${r.pris ? kronor.format(r.pris) : "ingår"}`).join("\n");
      bestallning.querySelector("[data-falt-pris]").value = pris;
      bestallning.querySelector("[data-falt-lank]").value = `${location.origin}${location.pathname}#${adress}`;
    }
  }

  form.addEventListener("input", () => uppdatera());
  form.addEventListener("submit", (e) => e.preventDefault());
  bestallning?.addEventListener("reset", () => setTimeout(() => uppdatera({ studsa: false })));

  document.querySelector("[data-borja-om]")?.addEventListener("click", () => {
    form.reset();
    uppdatera();
  });

  document.querySelector("[data-slumpa]")?.addEventListener("click", () => {
    for (const namn of ["storlek", "smak", "farg", "yta", "topp"]) {
      const alternativ = form.querySelectorAll(`input[name="${namn}"]`);
      alternativ[Math.floor(Math.random() * alternativ.length)].checked = true;
    }
    form.querySelectorAll('input[name="detaljer"]').forEach((i) => (i.checked = Math.random() < 0.35));
    if (siffraInput) siffraInput.value = 1 + Math.floor(Math.random() * 60);
    if (textInput) {
      const forslag = ["Grattis!", "Hurra!", "Jó étvágyat!", "Tårta > allt", "Bon appétit!", "Hönk!", ""];
      textInput.value = forslag[Math.floor(Math.random() * forslag.length)];
    }
    uppdatera();
  });

  const kopiera = document.querySelector("[data-kopiera]");
  kopiera?.addEventListener("click", async () => {
    const lank = location.href;
    try {
      await navigator.clipboard.writeText(lank);
      kopiera.textContent = "Länk kopierad!";
    } catch {
      window.prompt("Kopiera länken till din tårta:", lank);
    }
    setTimeout(() => (kopiera.textContent = "Kopiera länk"), 2200);
  });

  // en delad länk kan klistras in i samma flik
  window.addEventListener("hashchange", () => {
    franAdress();
    uppdatera();
  });

  franAdress();
  uppdatera({ studsa: false });
}
