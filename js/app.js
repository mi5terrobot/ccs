/* =========================================================
   CAS Cheat Sheet – Steuerung
   Hier muss man normalerweise nichts ändern.
   Alle Inhalte stehen in index.html.
   ========================================================= */

const start = document.getElementById("start");
const liste = document.getElementById("themenliste");
const themen = [...document.querySelectorAll(".thema")];

let aktiv = -1;     // aktuelles Thema (-1 = Startseite)
let schritt = 0;    // aktueller Schritt
let alle = false;   // "Alle Schritte" an/aus

/* ---------- Brüche: <span class="fr">1/2</span> ---------- */
document.querySelectorAll(".fr").forEach(el => {
  const [oben, unten] = el.textContent.split("/");
  el.innerHTML = `<span>${oben.trim()}</span><span>${(unten || "").trim()}</span>`;
});

/* ---------- Rechnerbilder mit Rahmen und Markierungen ---------- */
document.querySelectorAll(".schritt img").forEach(img => {
  const fig = document.createElement("figure");
  fig.className = "bild";
  fig.innerHTML = `<div class="rahmen"></div><div class="punkte" aria-hidden="true"></div>`;
  img.replaceWith(fig);
  fig.firstChild.appendChild(img);

  const zeilen = (img.dataset.zeilen || "").split(",").map(z => z.trim()).filter(Boolean)
    .map(z => z.split("-").map(Number));
  if (!zeilen.length) return;
  const nummern = img.dataset.nummern ? img.dataset.nummern.split(",").map(s => s.trim()) : zeilen.map((_, i) => i + 1);
  const markiert = Number(img.dataset.markiert || 0);

  const zeichnen = () => {
    const h = img.naturalHeight || 246;
    fig.querySelectorAll(".zeile").forEach(e => e.remove());
    const punkte = fig.querySelector(".punkte");
    punkte.innerHTML = "";
    zeilen.forEach(([von, bis], i) => {
      if (markiert === i + 1) {
        const z = document.createElement("div");
        z.className = "zeile";
        z.style.top = (von / h * 100) + "%";
        z.style.height = ((bis - von) / h * 100) + "%";
        fig.firstChild.appendChild(z);
      }
      const p = document.createElement("span");
      p.className = "punkt" + (markiert && markiert !== i + 1 ? " blass" : "");
      p.dataset.blass = markiert && markiert !== i + 1 ? "1" : "";
      p.style.top = ((von + bis) / 2 / h * 100) + "%";
      p.textContent = nummern[i];
      punkte.appendChild(p);
    });
  };
  img.complete ? zeichnen() : img.addEventListener("load", zeichnen);
});

/* ---------- Startseite und Kopfzeilen bauen ---------- */
themen.forEach((t, i) => {
  const titel = t.querySelector("h1");
  const b = document.createElement("button");
  b.className = "eintrag";
  b.innerHTML = `<span class="nr">${i + 1}</span><b>${titel.innerHTML}</b><span class="pfeil">›</span>`;
  b.addEventListener("click", () => oeffne(i));
  liste.appendChild(b);

  const zurueck = document.createElement("button");
  zurueck.className = "zurueck";
  zurueck.textContent = "← Alle Themen";
  zurueck.addEventListener("click", () => oeffne(-1));

  const kopf = document.createElement("div");
  kopf.className = "kopf";
  kopf.innerHTML = `<span class="nr">${i + 1}</span>`;
  titel.replaceWith(kopf);
  kopf.appendChild(titel);
  t.prepend(zurueck);

  const nav = document.createElement("div");
  nav.className = "steuerung";
  t.querySelector(".karte").appendChild(nav);
});

/* ---------- Anzeige ---------- */
function zeige() {
  start.hidden = aktiv >= 0;
  themen.forEach((t, i) => t.hidden = i !== aktiv);
  if (aktiv < 0) return;

  const t = themen[aktiv];
  const karte = t.querySelector(".karte");
  const schritte = [...karte.querySelectorAll(".schritt")];
  const letzter = schritt === schritte.length - 1;
  karte.classList.toggle("alle", alle);

  schritte.forEach((s, i) => {
    s.hidden = !alle && i !== schritt;
    // gleiches Bild in mehreren Schritten: in "Alle Schritte" nur einmal zeigen
    const bild = s.querySelector(".bild");
    if (bild) {
      const src = bild.querySelector("img").getAttribute("src");
      const naechstes = schritte[i + 1] && schritte[i + 1].querySelector(".bild img");
      bild.hidden = alle && naechstes && naechstes.getAttribute("src") === src;
      bild.querySelectorAll(".zeile").forEach(z => z.hidden = alle);
      bild.querySelectorAll(".punkt").forEach(p => p.classList.toggle("blass", !alle && p.dataset.blass === "1"));
    }
  });
  if (!alle) { const s = schritte[schritt]; s.style.animation = "none"; s.offsetHeight; s.style.animation = ""; }

  const einzeln = alle || schritt === 0;
  t.querySelector(".steuerung").innerHTML = `
    <div class="reihe">
      ${alle ? "<span></span>" : `<div class="punkte-nav">${schritte.map((_, i) =>
        `<button class="dot" data-s="${i}" aria-label="Schritt ${i + 1}" ${i === schritt ? 'aria-current="step"' : ""}>${i + 1}</button>`).join("")}</div>`}
      <button class="link" data-a="alle">${alle ? "Schritt für Schritt" : "Alle Schritte"}</button>
    </div>
    <div class="knoepfe${einzeln ? " einzeln" : ""}">
      ${einzeln ? "" : `<button class="btn hell" data-a="zurueck">Zurück</button>`}
      ${(alle || letzter)
        ? (aktiv < themen.length - 1 ? `<button class="btn" data-a="naechstesThema">Nächstes Thema</button>` : `<button class="btn" data-a="start">Alle Themen</button>`)
        : `<button class="btn" data-a="weiter">Weiter</button>`}
    </div>`;
}

function gehe(d) {
  if (aktiv < 0 || alle) return;
  const n = schritt + d;
  if (n >= 0 && n < themen[aktiv].querySelectorAll(".schritt").length) { schritt = n; zeige(); }
}

function anzeigen(i) { aktiv = i; schritt = 0; alle = false; zeige(); window.scrollTo(0, 0); }

/* Thema öffnen – mit Adresse #t1 … #t6, damit die Zurück-Taste des Handys funktioniert */
function oeffne(i) {
  if (i === aktiv) return;
  try {
    if (i < 0 && history.state && history.state.vonStart) { history.back(); return; }
    if (i < 0) history.replaceState(null, "", location.pathname + location.search);
    else if (aktiv < 0) history.pushState({ vonStart: true }, "", "#" + themen[i].id);
    else history.replaceState(history.state, "", "#" + themen[i].id);
  } catch (e) {}
  anzeigen(i);
}

function ausAdresse() { return themen.findIndex(t => "#" + t.id === location.hash); }
window.addEventListener("popstate", () => anzeigen(ausAdresse()));

/* Klicks in der Steuerleiste */
document.addEventListener("click", e => {
  const b = e.target.closest(".steuerung button"); if (!b) return;
  if (b.dataset.s) { schritt = Number(b.dataset.s); return zeige(); }
  switch (b.dataset.a) {
    case "alle": alle = !alle; return zeige();
    case "zurueck": return gehe(-1);
    case "weiter": return gehe(1);
    case "naechstesThema": return oeffne(aktiv + 1);
    case "start": return oeffne(-1);
  }
});

/* Wischen auf der Karte und Pfeiltasten */
let sx = null, sy = 0;
document.addEventListener("touchstart", e => { if (e.target.closest(".karte")) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
document.addEventListener("touchend", e => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) gehe(dx < 0 ? 1 : -1);
}, { passive: true });
document.addEventListener("keydown", e => { if (e.key === "ArrowRight") gehe(1); if (e.key === "ArrowLeft") gehe(-1); });

anzeigen(ausAdresse());
