// Eszter.se – lite JavaScript för det lilla extra. Allt fungerar även utan.

const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobilmeny ---------- */
const menyKnapp = document.querySelector(".meny-knapp");
if (menyKnapp) {
  const meny = document.getElementById(menyKnapp.getAttribute("aria-controls"));
  const stang = () => menyKnapp.setAttribute("aria-expanded", "false");
  menyKnapp.addEventListener("click", () => {
    const oppen = menyKnapp.getAttribute("aria-expanded") === "true";
    menyKnapp.setAttribute("aria-expanded", String(!oppen));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menyKnapp.getAttribute("aria-expanded") === "true") {
      stang();
      menyKnapp.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!meny.contains(e.target) && !menyKnapp.contains(e.target)) stang();
  });
}

/* ---------- Konditorgåsen ---------- */
const gas = document.querySelector("[data-gas]");
const bubbla = document.querySelector("[data-pratbubbla]");
if (gas && bubbla) {
  const repliker = [
    "Hönk!",
    "Szia!",
    "Bonjour!",
    "Mer smörkräm!",
    "Har du smakat?",
    "Jó étvágyat!",
    "Lite mer vanilj…",
    "Tårta = konst",
    "Hönk hönk!",
    "Oui, chef!",
  ];
  let senaste = 0;
  gas.addEventListener("click", () => {
    let nasta;
    do nasta = Math.floor(Math.random() * repliker.length);
    while (nasta === senaste);
    senaste = nasta;
    bubbla.textContent = repliker[nasta];
    bubbla.classList.remove("ny");
    gas.classList.remove("pratar");
    void bubbla.offsetWidth; // starta om animationen
    bubbla.classList.add("ny");
    gas.classList.add("pratar");
    if (!minskadRorelse) strossla(gas);
  });
}

// Strössel som yr när man klappar gåsen
function strossla(kalla) {
  const farger = ["#C8363D", "#F6D57A", "#9CC0EE", "#BFE3D0", "#F6CACB", "#F0913A"];
  const ruta = kalla.getBoundingClientRect();
  const x0 = ruta.left + ruta.width * 0.35;
  const y0 = ruta.top + ruta.height * 0.4;
  for (let i = 0; i < 26; i++) {
    const bit = document.createElement("span");
    const vinkel = Math.random() * Math.PI * 2;
    const avstand = 80 + Math.random() * 140;
    Object.assign(bit.style, {
      position: "fixed",
      left: `${x0}px`,
      top: `${y0}px`,
      width: "12px",
      height: "4px",
      borderRadius: "4px",
      background: farger[i % farger.length],
      pointerEvents: "none",
      zIndex: 50,
    });
    document.body.append(bit);
    bit.animate(
      [
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        {
          transform: `translate(${Math.cos(vinkel) * avstand}px, ${Math.sin(vinkel) * avstand + 120}px) rotate(${Math.random() * 720}deg)`,
          opacity: 0,
        },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.4,1)" }
    ).onfinish = () => bit.remove();
  }
}

/* ---------- Galleri: filter ---------- */
const filter = document.querySelector("[data-filter]");
if (filter) {
  const kort = document.querySelectorAll(".polaroid[data-kategori]");
  filter.addEventListener("click", (e) => {
    const knapp = e.target.closest("button[data-kategori]");
    if (!knapp) return;
    const vald = knapp.dataset.kategori;
    filter.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === knapp)));
    kort.forEach((k) => (k.hidden = vald !== "alla" && k.dataset.kategori !== vald));
  });
}

/* ---------- Galleri: ljuslåda ---------- */
const ljuslada = document.querySelector("[data-ljuslada]");
if (ljuslada && typeof ljuslada.showModal === "function") {
  const bildYta = ljuslada.querySelector(".ljuslada__bild");
  const textYta = ljuslada.querySelector(".ljuslada__text");
  document.addEventListener("click", (e) => {
    const knapp = e.target.closest("[data-lightbox]");
    if (!knapp) return;
    const figur = knapp.closest("figure");
    bildYta.innerHTML = knapp.innerHTML;
    bildYta.style.setProperty("--ton", getComputedStyle(figur).getPropertyValue("--ton"));
    textYta.innerHTML = "";
    const rubrik = document.createElement("h2");
    rubrik.textContent = figur.querySelector(".polaroid__titel").textContent;
    textYta.append(rubrik, figur.querySelector(".polaroid__kategori").cloneNode(true), figur.querySelector(".polaroid__text").cloneNode(true));
    ljuslada.showModal();
  });
  ljuslada.addEventListener("click", (e) => {
    if (e.target === ljuslada || e.target.closest(".ljuslada__stang")) ljuslada.close();
  });
} else {
  document.querySelectorAll("[data-lightbox]").forEach((b) => (b.style.cursor = "default"));
}

/* ---------- Recept: skala portioner ---------- */
const skala = document.querySelector("[data-skala]");
if (skala) {
  const rader = document.querySelectorAll("[data-ingrediens]");
  const portioner = document.querySelector("[data-portioner]");
  const grundPortioner = portioner?.textContent ?? "";
  rader.forEach((r) => (r.dataset.original = r.textContent));

  const formatera = (tal) => {
    const avrundat = tal >= 10 ? Math.round(tal) : Math.round(tal * 4) / 4;
    const hela = Math.floor(avrundat);
    const rest = avrundat - hela;
    const brak = { 0.25: "¼", 0.5: "½", 0.75: "¾" }[rest] ?? "";
    if (!brak) return String(avrundat).replace(".", ",");
    return hela ? `${hela} ${brak}` : brak;
  };
  // Läser ett tal i början av raden: "150 g", "1,5 dl", "½ tsk", "1 ½ dl", "2-3 st"
  const talMonster = /^(\d+(?:[.,]\d+)?)?(?:\s*([¼½¾]))?(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?/;
  const tolka = (s) => parseFloat(String(s).replace(",", "."));
  const brakVarde = { "¼": 0.25, "½": 0.5, "¾": 0.75 };

  const skalaRad = (text, faktor) => {
    const m = text.match(talMonster);
    if (!m || (!m[1] && !m[2])) return text;
    const bas = (m[1] ? tolka(m[1]) : 0) + (m[2] ? brakVarde[m[2]] : 0);
    let ny = formatera(bas * faktor);
    if (m[3]) ny += `–${formatera(tolka(m[3]) * faktor)}`;
    return ny + text.slice(m[0].length);
  };

  skala.addEventListener("click", (e) => {
    const knapp = e.target.closest("button[data-faktor]");
    if (!knapp) return;
    const faktor = parseFloat(knapp.dataset.faktor);
    skala.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === knapp)));
    rader.forEach((r) => (r.textContent = faktor === 1 ? r.dataset.original : skalaRad(r.dataset.original, faktor)));
    if (portioner) portioner.textContent = faktor === 1 ? grundPortioner : `${grundPortioner} × ${formatera(faktor)}`;
  });
}

/* ---------- Beställningsformulär ---------- */
const formular = document.querySelector("[data-bestallning]");
if (formular) {
  const status = formular.querySelector(".formular__status");
  const skickaKnapp = formular.querySelector("button[type=submit]");
  const datum = formular.querySelector("input[type=date]");
  if (datum) {
    const tidigast = new Date();
    tidigast.setDate(tidigast.getDate() + 7);
    datum.min = tidigast.toISOString().slice(0, 10);
  }

  const visa = (typ, text) => {
    status.dataset.typ = typ;
    status.textContent = text;
  };

  formular.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!formular.reportValidity()) return;
    const data = new FormData(formular);
    if (data.get("_gotcha")) return; // spamfälla

    const endpoint = formular.dataset.endpoint;
    if (endpoint) {
      skickaKnapp.disabled = true;
      visa("info", "Skickar din förfrågan…");
      try {
        const svar = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!svar.ok) throw new Error(svar.statusText);
        formular.reset();
        visa("ok", "Tack! Din förfrågan har kommit fram. Jag hör av mig så snart jag kan – oftast inom ett par dagar.");
      } catch {
        visa("fel", `Hoppsan, något gick fel. Försök igen eller mejla direkt till ${formular.dataset.epost}.`);
      } finally {
        skickaKnapp.disabled = false;
      }
      return;
    }

    // Ingen formulärtjänst inställd: öppna besökarens mejlprogram med allt ifyllt
    const etiketter = {
      namn: "Namn",
      epost: "E-post",
      telefon: "Telefon",
      datum: "Datum",
      tillfalle: "Tillfälle",
      gaster: "Antal gäster",
      smaker: "Smaker",
      allergier: "Allergier",
      budget: "Budget",
      beskrivning: "Min drömtårta",
    };
    const rader = [];
    for (const [nyckel, etikett] of Object.entries(etiketter)) {
      const varde = String(data.get(nyckel) ?? "").trim();
      if (varde) rader.push(`${etikett}: ${varde}`);
    }
    const amne = `Tårtförfrågan${data.get("datum") ? " – " + data.get("datum") : ""}`;
    const lank = `mailto:${formular.dataset.epost}?subject=${encodeURIComponent(amne)}&body=${encodeURIComponent(rader.join("\n\n"))}`;
    window.location.href = lank;
    visa("info", `Ditt mejlprogram öppnas med förfrågan ifylld – tryck bara på skicka. Händer inget? Mejla till ${formular.dataset.epost}.`);
  });
}

/* ---------- Recept: skriv ut ---------- */
document.querySelector("[data-skriv-ut]")?.addEventListener("click", () => window.print());
