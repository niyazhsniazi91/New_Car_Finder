import seed from "./cars.json" with { type: "json" };
import cardekhoSpecs from "./cardekho-specs.json" with { type: "json" };

const DB_NAME = "car-finder-library";
const STORE = "imports";
const labels = { family: "Family & mixed use", city: "City / commute", highway: "Highway trips", value: "Value for money", technology: "Features & technology" };
const icons = { family: "⌂", city: "⌁", highway: "↗", value: "₹", technology: "✳" };
let importedCars = [];
let currentCity = "bengaluru";
let selectedUse = "family";
let toastTimer;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const dbPromise = new Promise((resolve, reject) => {
  if (!("indexedDB" in window)) {
    reject(new Error("This browser does not support local brochure storage."));
    return;
  }
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error("Could not open local brochure storage."));
});

async function storeTransaction(mode, action) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result;
    try { result = action(store); } catch (error) { reject(error); return; }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error ?? new Error("Could not save your library."));
    tx.onabort = () => reject(tx.error ?? new Error("The library update was cancelled."));
  });
}

async function loadImports() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not load your brochure library."));
  });
}

function allCars() { return [...seed.cars, ...importedCars]; }
function isMatch(car) { return Boolean(car.matches && car.automaticCamera && car.automaticAdas && car.automaticTypes?.length); }
function text(value) { return String(value ?? "—"); }
function priceRange(car, city = currentCity, qualifier = true) {
  const prop = city === "bengaluru" ? "bengaluruLakh" : "mumbaiLakh";
  return (qualifier && isMatch(car) && car[`qualifying${city === "bengaluru" ? "Bengaluru" : "Mumbai"}Lakh`]) ? car[`qualifying${city === "bengaluru" ? "Bengaluru" : "Mumbai"}Lakh`] : car[prop];
}
function fmtPrice(range, prefix = "₹") {
  if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite)) return "Not provided";
  const f = n => `${prefix}${Number(n).toFixed(2)}L`;
  return range[0] === range[1] ? f(range[0]) : `${f(range[0])} – ${f(range[1])}`;
}
function shortPrice(range) {
  if (!Array.isArray(range)) return "Not provided";
  return range[0] === range[1] ? `₹${range[0].toFixed(1)}L` : `₹${range[0].toFixed(1)}–${range[1].toFixed(1)}L`;
}
function getName(car) { return `${car.make} ${car.model}`; }
function sortPrice(car, city = currentCity) { return priceRange(car, city)?.[0] ?? 1000; }
function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function activateTab(name) {
  $$(".tab").forEach(button => button.classList.toggle("active", button.dataset.tab === name));
  $$(".panel").forEach(panel => panel.classList.toggle("active", panel.id === `panel-${name}`));
  if (name === "matches") renderMatches();
  if (name === "compare") renderCompare();
  if (name === "filter") renderFilters();
  if (name === "ranking") renderRanking();
  if (name === "library") renderLibrary();
  window.scrollTo({ top: document.querySelector(".tabs").offsetTop - 8, behavior: "smooth" });
}

function featureStatus(car) {
  return `<span class="card-tags"><span>${safe(car.seats ?? 5)} seats${car.seatOptions?.includes(7) ? " · 5+2 option" : ""}</span><span>${safe(car.automaticTypes?.join(" / ") || "Automatic available")}</span><span>${safe(car.fuel?.join(" · ") || "Fuel not specified")}</span>${car.automaticCamera ? '<span class="feature-tag">360° camera</span>' : ""}${car.automaticAdas ? '<span class="feature-tag">ADAS</span>' : ""}</span>`;
}
function cardMarkup(car, city = currentCity, near = false) {
  const match = isMatch(car);
  const price = priceRange(car, city);
  const exPrice = match && car.qualifyingExLakh ? car.qualifyingExLakh : car.exShowroomLakh;
  const pill = car.imported ? '<span class="draft-pill">Imported · review</span>' : match ? '<span class="fit-pill">✓ Exact feature fit</span>' : '<span class="draft-pill">Near-match</span>';
  return `<article class="car-card">
    <div class="card-top"><div><span class="make-label">${safe(car.make)} · ${safe(car.segment)}</span><h3>${safe(car.model)}</h3></div>${pill}</div>
    <div class="car-sub">${safe(car.qualifyingVariant || "Variant-level equipment needs dealer confirmation")}</div>
    ${featureStatus(car)}
    <div class="price-row"><div><small>${city === "bengaluru" ? "Bengaluru" : "Mumbai"} indicative on-road</small><b>${safe(shortPrice(price))}</b></div><div class="price-range"><span>Ex-showroom</span><b>${safe(shortPrice(exPrice))}</b></div></div>
    <div class="card-buttons"><button class="button button-outline" data-details="${safe(car.id)}">Details & sources</button>${!car.imported ? `<button class="button button-outline" data-compare="${safe(car.id)}">＋ Compare</button>` : `<button class="button button-outline" data-review="${safe(car.id)}">Review import</button>`}</div>
    <div class="price-caveat">${near ? "Not a strict match. " : ""}Indicative range; confirm exact variant, insurance and city quote.</div>
  </article>`;
}
function renderMatches() {
  const city = $("#matches-city").value;
  const matches = allCars().filter(isMatch);
  $("#matches-grid").innerHTML = matches.length ? matches.map(car => cardMarkup(car, city)).join("") : '<div class="compare-empty">No reviewed matches yet. Review imported brochures or relax the filters.</div>';
  $("#tab-match-count").textContent = String(matches.length);
  bindCardButtons();
}
function renderDashboard() {
  const matches = allCars().filter(isMatch);
  $("#stat-matches").textContent = String(matches.length).padStart(2, "0");
  $("#stat-auto").textContent = String(matches.length).padStart(2, "0");
  $("#tab-match-count").textContent = String(matches.length);
  $("#stat-brochures").textContent = String(seed.cars.length + importedCars.length);
  const cheapest = [...matches].sort((a, b) => sortPrice(a, "mumbai") - sortPrice(b, "mumbai"))[0];
  $("#stat-price").textContent = cheapest ? `₹${sortPrice(cheapest, "mumbai").toFixed(1)}L` : "—";
  $("#hero-proof").textContent = `${matches.length} exact feature matches from ${seed.cars.length + importedCars.length} brochures`;
  $("#usecase-grid").innerHTML = Object.entries(labels).map(([key, title]) => `<button class="usecase-card ${selectedUse === key ? "selected" : ""}" data-use="${key}"><span class="use-icon">${icons[key]}</span><span class="use-arrow">↗</span><strong>${title}</strong><small>${useHint(key)}</small></button>`).join("");
  renderRecommendation();
}
function useHint(key) {
  return ({ family: "Space, safety features & all-round fit", city: "Easy everyday driving & compact convenience", highway: "Powertrain, comfort & long-distance confidence", value: "Stretch your budget without losing essentials", technology: "Smart features and driver assistance" })[key];
}
function scoreCar(car, usage = selectedUse, city = currentCity) {
  const usageScore = Number(car.scores?.[usage] ?? 2.5);
  const budgetMax = 24;
  const price = priceRange(car, city);
  const fit = !Number.isFinite(price?.[0]) ? 2.5 : price[0] <= budgetMax ? 5 : Math.max(1, 5 - (price[0] - budgetMax) * 0.6);
  const required = (car.automaticTypes?.length ? 1 : 0) + (car.automaticCamera ? 1 : 0) + (car.automaticAdas ? 1 : 0);
  const practicality = car.seats >= 7 ? 5 : car.bootLitres ? Math.min(5, 3 + car.bootLitres / 300) : 3.2;
  return Math.round((usageScore * .45 + fit * .2 + required / 3 * 5 * .2 + practicality * .15) * 20);
}
function renderRecommendation() {
  const candidates = allCars().filter(isMatch).sort((a, b) => scoreCar(b) - scoreCar(a));
  const car = candidates[0];
  const card = $("#recommendation-card");
  if (!car) {
    card.innerHTML = '<p class="eyebrow">YOUR TOP PICK</p><h3>Review a brochure to start your shortlist</h3>';
    return;
  }
  card.innerHTML = `<p class="eyebrow">BEST FIT · ${safe(labels[selectedUse].toUpperCase())}</p><h3>A strong place to start</h3><div class="rec-car">${safe(getName(car))}</div><div class="rec-trim">${safe(car.qualifyingVariant)}</div><div class="rec-bottom"><div class="rec-price"><small>Indicative on-road · ${currentCity === "bengaluru" ? "Bengaluru" : "Mumbai"}</small><b>${safe(shortPrice(priceRange(car)))}</b></div><div class="rec-score">${scoreCar(car)} / 100 fit</div></div><button class="button button-quiet rec-open" data-details="${safe(car.id)}">Why this car? →</button>`;
  bindCardButtons(card);
}
function renderCompare() {
  const picks = allCars();
  const selected = new Set(JSON.parse(sessionStorage.getItem("compare-picks") || "[]"));
  if (!sessionStorage.getItem("compare-picks")) picks.filter(isMatch).slice(0, 3).forEach(car => selected.add(car.id));
  $("#compare-picks").innerHTML = picks.map(car => `<label class="compare-pick"><input type="checkbox" data-compare-pick="${safe(car.id)}" ${selected.has(car.id) ? "checked" : ""}>${safe(getName(car))}</label>`).join("");
  const cars = picks.filter(car => selected.has(car.id)).slice(0, 4);
  sessionStorage.setItem("compare-picks", JSON.stringify(cars.map(car => car.id)));
  if (!cars.length) {
    $("#compare-table-wrap").innerHTML = '<div class="compare-empty">Select at least one car above.</div>';
    return;
  }
  const rows = [
    ["Prices & city", "Ex-showroom model range", car => fmtPrice(car.exShowroomLakh)],
    ["Prices & city", "Qualifying-trim ex-showroom estimate", car => car.qualifyingExLakh ? fmtPrice(car.qualifyingExLakh) : "No qualifying-trim estimate"],
    ["Prices & city", `${currentCity === "bengaluru" ? "Bengaluru" : "Mumbai"} selected-city estimate`, car => fmtPrice(priceRange(car))],
    ["Prices & city", "Bengaluru on-road model range", car => fmtPrice(car.bengaluruLakh)],
    ["Prices & city", "Mumbai on-road model range", car => fmtPrice(car.mumbaiLakh)],
    ["Prices & city", "Bengaluru qualifying-trim estimate", car => car.qualifyingBengaluruLakh ? fmtPrice(car.qualifyingBengaluruLakh) : "Model range only"],
    ["Prices & city", "Mumbai qualifying-trim estimate", car => car.qualifyingMumbaiLakh ? fmtPrice(car.qualifyingMumbaiLakh) : "Model range only"],
    ["Brochure details", "Body style / segment", car => car.segment],
    ["Brochure details", "Seating configuration", car => `${car.seats || 5}${car.seatOptions?.includes(7) ? " (5+2 option)" : ""}`],
    ["Brochure details", "Fuel choices", car => car.fuel?.join(", ")],
    ["Brochure details", "Transmission choices", car => car.transmissions?.join(", ")],
    ["Brochure details", "Powertrain range", car => car.powertrain],
    ["Brochure details", "Qualifying trim / combination", car => car.qualifyingVariant || "No qualifying trim identified"],
    ["Brochure details", "360° camera on automatic", car => car.automaticCamera ? "Documented; trim-specific" : "Not established"],
    ["Brochure details", "ADAS on automatic", car => car.automaticAdas ? "Documented; trim-specific" : "Not established"],
    ["Brochure details", "Key findings", car => car.highlights || car.nearMatch],
    ["Brochure details", "Brochure PDF", car => car.brochure || "Imported locally"],
    ["CarDekho specs listing", "Spec listing note", car => cardekhoSpecs[car.id]?.variantNote || "Not available for this local import"],
    ["CarDekho specs listing", "Engine", car => cardekhoSpecs[car.id]?.engine],
    ["CarDekho specs listing", "Displacement", car => cardekhoSpecs[car.id]?.displacement],
    ["CarDekho specs listing", "Maximum power", car => cardekhoSpecs[car.id]?.power],
    ["CarDekho specs listing", "Maximum torque", car => cardekhoSpecs[car.id]?.torque],
    ["CarDekho specs listing", "Cylinders", car => cardekhoSpecs[car.id]?.cylinders],
    ["CarDekho specs listing", "Gearbox / drive", car => cardekhoSpecs[car.id]?.gearbox],
    ["CarDekho specs listing", "Fuel economy", car => cardekhoSpecs[car.id]?.mileage],
    ["CarDekho specs listing", "Fuel tank", car => cardekhoSpecs[car.id]?.fuelTank],
    ["CarDekho specs listing", "Emission standard", car => cardekhoSpecs[car.id]?.emissions],
    ["CarDekho specs listing", "Dimensions / wheelbase", car => cardekhoSpecs[car.id]?.dimensions],
    ["CarDekho specs listing", "Ground clearance", car => cardekhoSpecs[car.id]?.groundClearance],
    ["CarDekho specs listing", "Boot space (CarDekho)", car => cardekhoSpecs[car.id]?.boot],
    ["CarDekho specs listing", "Suspension", car => cardekhoSpecs[car.id]?.suspension],
    ["CarDekho specs listing", "Brakes", car => cardekhoSpecs[car.id]?.brakes],
    ["CarDekho specs listing", "Tyres", car => cardekhoSpecs[car.id]?.tyres],
    ["CarDekho specs listing", "Safety equipment", car => cardekhoSpecs[car.id]?.safety],
    ["CarDekho specs listing", "Safety rating", car => cardekhoSpecs[car.id]?.safetyRating],
    ["Sources & notes", "CarDekho specs page", car => cardekhoSpecs[car.id]?.url || ""],
    ["Sources & notes", "Price source", car => car.source || "Not provided"],
    ["Sources & notes", "Price caveat", car => "Indicative online ranges; confirm exact variant and city quote."],
    ["Sources & notes", "Brochure assessment", car => car.nearMatch || car.highlights]
  ];
  let html = `<table class="compare-table"><thead><tr><th>COMPARISON</th>${cars.map(car => `<th>${safe(getName(car))}</th>`).join("")}</tr></thead><tbody>`;
  let group = "";
  rows.forEach(([section, label, value]) => {
    if (group !== section) { group = section; html += `<tr class="group-row"><td colspan="${cars.length + 1}">${safe(section)}</td></tr>`; }
    html += `<tr><th>${safe(label)}</th>${cars.map(car => {
      if (label === "CarDekho specs page") {
        const url = cardekhoSpecs[car.id]?.url || "";
        const validUrl = url.startsWith("https://www.cardekho.com/") ? url : "";
        return `<td>${validUrl ? `<a href="${safe(validUrl)}" target="_blank" rel="noopener noreferrer">Open CarDekho specs ↗</a>` : "Not available"}</td>`;
      }
      const isPrice = section === "Prices & city" && label.includes("estimate");
      return `<td class="${isPrice ? "price-cell" : ""}">${safe(value(car) ?? "Not listed")}</td>`;
    }).join("")}</tr>`;
  });
  $("#compare-table-wrap").innerHTML = `${html}</tbody></table><p class="tiny-note">CarDekho specs reviewed 25 Nov 2026. Values are a snapshot of the displayed listing and may represent one variant; the brochure describes the model range. Equipment, engine outputs and capacities can vary by trim. Confirm the exact variant before purchase.</p>`;
}
function getFilteredCars() {
  const city = $("#filter-city").value;
  const budget = Number($("#budget-range").value);
  const seats = $("#seats-filter").value;
  const type = $("#transmission-filter").value;
  const fuel = $("#fuel-filter").value;
  const needAuto = $("#need-auto").checked, needCamera = $("#need-camera").checked, needAdas = $("#need-adas").checked;
  return allCars().filter(car => {
    if (needAuto && !car.automaticTypes?.length) return false;
    if (needCamera && !car.automaticCamera) return false;
    if (needAdas && !car.automaticAdas) return false;
    if (seats === "5" && car.seats !== 5) return false;
    if (seats === "7" && !car.seatOptions?.includes(7)) return false;
    if (type !== "any") {
      const compatible = type === "DCT" ? ["DCT", "DCA", "DSG"] : type === "CVT" ? ["CVT", "IVT"] : [type];
      if (!car.automaticTypes?.some(item => compatible.some(value => item.toUpperCase().includes(value)))) return false;
    }
    if (fuel !== "any" && !car.fuel?.some(item => item.toLowerCase().includes(fuel.toLowerCase()))) return false;
    const p = priceRange(car, city);
    if (!p || p[0] > budget) return false;
    return true;
  }).sort((a, b) => scoreCar(b, $("#usage-filter").value, city) - scoreCar(a, $("#usage-filter").value, city));
}
function renderFilters() {
  $("#budget-label").textContent = `₹${Number($("#budget-range").value).toFixed(1)} lakh`;
  const cars = getFilteredCars();
  $("#filter-count").textContent = `${cars.length} ${cars.length === 1 ? "car" : "cars"} found`;
  $("#filter-grid").innerHTML = cars.length ? cars.map(car => cardMarkup(car, $("#filter-city").value, !isMatch(car))).join("") : '<div class="compare-empty">Nothing matches those choices. Try increasing your budget or relaxing a requirement.</div>';
  bindCardButtons();
}
function renderRanking() {
  const usage = $("#ranking-usage").value;
  const cars = allCars().sort((a, b) => scoreCar(b, usage) - scoreCar(a, usage));
  $("#ranking-list").innerHTML = cars.map((car, index) => {
    const score = scoreCar(car, usage);
    const reasons = car.highlights || car.nearMatch || "Automatic variant; validate equipment and exact trim with the dealer.";
    const status = isMatch(car) ? "Exact feature match" : "Does not meet all must-haves";
    return `<article class="rank-card"><div class="rank-num">${String(index + 1).padStart(2, "0")}</div><div class="rank-name"><b>${safe(getName(car))}</b><small>${safe(status)} · ${safe(car.qualifyingVariant)}</small></div><div class="rank-reason">${safe(reasons)}</div><div class="score-box"><div class="score-track"><i style="width:${score}%"></i></div></div><div class="rank-score">${score}<small>FIT SCORE</small></div></article>`;
  }).join("") || '<div class="compare-empty">No reviewed matches to rank.</div>';
}
function renderLibrary() {
  const list = [...seed.cars.map(car => ({ ...car, imported: false })), ...importedCars];
  $("#library-count").textContent = `${list.length} ${list.length === 1 ? "brochure" : "brochures"}`;
  $("#brochure-list").innerHTML = list.map(car => `<div class="brochure-item"><div><b>${safe(car.make)} ${safe(car.model)} ${car.imported ? "· Imported" : ""}</b><small>${safe(car.brochure || "Imported brochure")} · ${car.imported ? "Local draft" : isMatch(car) ? "Exact feature match" : "Analysed; no exact match"}</small></div>${car.imported ? `<button data-review="${safe(car.id)}">Review details →</button>` : `<button data-details="${safe(car.id)}">View findings →</button>`}</div>`).join("");
  bindCardButtons();
}

function openDetails(id) {
  const car = allCars().find(item => item.id === id);
  if (!car) return;
  const facts = [
    ["Brochure assessment", car.highlights || car.nearMatch || "Imported brochure; verify details before relying on them."],
    ["Powertrain", car.powertrain || "Not extracted"],
    ["Automatic feature fit", `Automatic: ${car.automaticTypes?.join(", ") || "not confirmed"} · 360° camera: ${car.automaticCamera ? "listed" : "not confirmed"} · ADAS: ${car.automaticAdas ? "listed" : "not confirmed"}`],
    ["Important qualification", car.qualifyingVariant || "No qualifying trim identified"]
  ];
  const quote = car.imported ? (car.extractedText || "").slice(0, 1400) : "";
  $("#dialog-content").innerHTML = `<p class="dialog-kicker">${safe(car.make)} · ${safe(car.segment || "Car")}</p><h2 class="dialog-title">${safe(car.model)}</h2>
    <div class="dialog-prices"><div class="dialog-price"><small>Ex-showroom estimate</small><b>${safe(fmtPrice(car.qualifyingExLakh || car.exShowroomLakh))}</b></div><div class="dialog-price"><small>Bengaluru on-road</small><b>${safe(fmtPrice(priceRange(car, "bengaluru")))}</b></div><div class="dialog-price"><small>Mumbai on-road</small><b>${safe(fmtPrice(priceRange(car, "mumbai")))}</b></div></div>
    ${facts.map(([title, value]) => `<div class="dialog-section"><h4>${safe(title.toUpperCase())}</h4><p>${safe(value)}</p></div>`).join("")}
    <div class="dialog-section"><h4>PRICES & SOURCE NOTES</h4><p>${safe(car.priceNote || seed.priceNote)} These are indicative model/trim ranges, not dealer quotations. On-road totals vary with registration, insurance, tax, accessories and offer.</p><p>Price source: ${safe(car.source || "Brochure imported locally; confirm pricing with a dealer.")}</p><p>Brochure: ${safe(car.brochure || "Locally imported PDF")}</p></div>
    ${quote ? `<div class="dialog-section"><h4>EXTRACTED BROCHURE TEXT · REVIEW REQUIRED</h4><p>${safe(quote)}${car.extractedText.length > 1400 ? "…" : ""}</p></div>` : ""}`;
  $("#car-dialog").showModal();
}

function bindCardButtons(root = document) {
  $$("[data-details]", root).forEach(button => button.onclick = () => openDetails(button.dataset.details));
  $$("[data-review]", root).forEach(button => button.onclick = () => openReview(button.dataset.review));
  $$("[data-compare]", root).forEach(button => button.onclick = () => {
    const ids = new Set(JSON.parse(sessionStorage.getItem("compare-picks") || "[]"));
    ids.add(button.dataset.compare);
    sessionStorage.setItem("compare-picks", JSON.stringify([...ids].slice(0, 4)));
    activateTab("compare");
  });
}

function openReview(id) {
  const car = importedCars.find(item => item.id === id);
  if (!car) return;
  const textFound = car.extractedText || "";
  const preview = textFound.slice(0, 520);
  $("#dialog-content").innerHTML = `<p class="dialog-kicker">LOCAL BROCHURE IMPORT · REVIEW BEFORE USE</p><h2 class="dialog-title">Confirm this car's details</h2>
    <form id="review-form" data-id="${safe(id)}">
      <label class="field-label">Make<input name="make" value="${safe(car.make)}" required></label>
      <label class="field-label">Model<input name="model" value="${safe(car.model)}" required></label>
      <label class="field-label">Seats<input name="seats" type="number" min="2" max="9" value="${safe(car.seats || 5)}"></label>
      <label class="field-label">Automatic transmission types<input name="transmission" value="${safe(car.automaticTypes?.join(", ") || "")}" placeholder="DCT, AT, CVT…"></label>
      <label class="field-label">Fuel types<input name="fuel" value="${safe(car.fuel?.join(", ") || "")}" placeholder="Petrol, Diesel…"></label>
      <label class="field-label">Ex-showroom low / high (₹ lakh)<input name="ex" value="${safe(car.exShowroomLakh?.join(" / ") || "")}" placeholder="e.g. 12.5 / 16"></label>
      <label class="field-label">Bengaluru on-road low / high (₹ lakh)<input name="blr" value="${safe(car.bengaluruLakh?.join(" / ") || "")}" placeholder="e.g. 14 / 18"></label>
      <label class="field-label">Mumbai on-road low / high (₹ lakh)<input name="mum" value="${safe(car.mumbaiLakh?.join(" / ") || "")}" placeholder="e.g. 13.8 / 17.5"></label>
      <label class="field-label">Qualifying variant / trim<input name="variant" value="${safe(car.qualifyingVariant || "")}" placeholder="Exact brochure trim name"></label>
      <label class="field-label">What the brochure says<textarea name="notes" rows="3">${safe(car.highlights || "")}</textarea></label>
      <div class="filter-locks">
        <label><input name="camera" type="checkbox" ${car.automaticCamera ? "checked" : ""}> 360° camera is confirmed on this automatic trim</label>
        <label><input name="adas" type="checkbox" ${car.automaticAdas ? "checked" : ""}> ADAS is confirmed on this automatic trim</label>
        <label><input name="confirmed" type="checkbox" ${car.userConfirmed ? "checked" : ""}> I reviewed the brochure and confirmed the selected trim/combination</label>
      </div>
      <p class="tiny-note">Automatic imports are never treated as confirmed matches until you verify the exact trim and tick the review confirmation. Prices are user-entered estimates.</p>
      <button class="button button-bright filter-submit" type="submit">Save reviewed details</button>
    </form>
    ${preview ? `<div class="dialog-section"><h4>EXTRACTED TEXT PREVIEW</h4><p>${safe(preview)}${textFound.length > 520 ? "…" : ""}</p></div>` : ""}`;
  $("#review-form").onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const readRange = name => parseRange(form.get(name));
    const types = String(form.get("transmission") || "").split(/[,;/]+/).map(x => x.trim()).filter(Boolean);
    const camera = form.has("camera"), adas = form.has("adas");
    const confirmed = form.has("confirmed");
    Object.assign(car, {
      make: String(form.get("make")).trim(), model: String(form.get("model")).trim(),
      seats: Number(form.get("seats")) || 5, automaticTypes: types,
      transmissions: types, fuel: String(form.get("fuel") || "").split(/[,;/]+/).map(x => x.trim()).filter(Boolean),
      exShowroomLakh: readRange("ex"), bengaluruLakh: readRange("blr"), mumbaiLakh: readRange("mum"),
      qualifyingVariant: String(form.get("variant") || "").trim() || "Not confirmed",
      highlights: String(form.get("notes") || "").trim(), automaticCamera: camera, automaticAdas: adas,
      userConfirmed: confirmed, matches: Boolean(confirmed && types.length && camera && adas),
      priceNote: "User-entered estimates; verify with an authorised dealer."
    });
    await storeTransaction("readwrite", store => store.put(car));
    $("#car-dialog").close();
    renderAll();
    showToast(car.matches ? "Reviewed. Added to your exact matches." : "Saved as a reviewed brochure; it does not meet every must-have.");
  };
  $("#car-dialog").showModal();
}

function parseRange(input) {
  const values = String(input || "").split(/[\/,–-]+/).map(value => Number(value.trim())).filter(Number.isFinite);
  if (!values.length) return undefined;
  return values.length === 1 ? [values[0], values[0]] : [Math.min(values[0], values[1]), Math.max(values[0], values[1])];
}
function priceEstimate(textContent) {
  const hits = [...textContent.matchAll(/(?:\u20b9|Rs\.?\s?)([\d,.]+)\s*(?:lakh|lac|l\b)/gi)].map(match => Number(match[1].replace(/,/g, ""))).filter(value => value > 0 && value < 100);
  if (!hits.length) return undefined;
  return [Math.min(...hits), Math.max(...hits)];
}
function suggestName(filename, content) {
  const first = content.split(/\r?\n/).map(line => line.trim()).find(line => line.length > 3 && line.length < 85 && /[a-z]/i.test(line));
  const model = first?.replace(/[^\p{L}\d &+-]/gu, "").trim() || filename.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ");
  const brands = ["Tata", "Hyundai", "Mahindra", "Maruti Suzuki", "Maruti", "Citroen", "Kia", "Honda", "Toyota", "Skoda", "Volkswagen", "Renault", "Nissan", "MG", "BYD"];
  const make = brands.find(brand => model.toLowerCase().includes(brand.toLowerCase())) || "Imported";
  return { make, model: make === "Imported" ? model : model.replace(new RegExp(make, "i"), "").trim() || model };
}
function candidateImportedCar(filename, extractedText) {
  const { make, model } = suggestName(filename, extractedText);
  const hasCamera = /360\s?(?:degree|°|[- ]?view)|surround\s?view/i.test(extractedText);
  const hasAdas = /\bADAS\b|advanced driver assistance/i.test(extractedText);
  const transmission = [...new Set((extractedText.match(/\b(?:CVT|IVT|DCT|DSG|DCA|AT|AMT)\b/gi) || []).map(x => x.toUpperCase()))];
  const prices = priceEstimate(extractedText);
  return {
    id: `import-${crypto.randomUUID()}`, make, model: model || filename.replace(/\.pdf$/i, ""),
    segment: "Imported brochure · classify after review", seats: 5, seatOptions: [5], fuel: [],
    transmissions: transmission, automaticTypes: transmission, exShowroomLakh: prices, bengaluruLakh: undefined, mumbaiLakh: undefined,
    powertrain: "", qualifyingVariant: "Review brochure for exact trim", automaticCamera: hasCamera, automaticAdas: hasAdas, matches: false,
    userConfirmed: false, imported: true, brochure: filename, extractedText, source: "Imported locally from your brochure.",
    highlights: `Automatic terms detected: ${transmission.join(", ") || "none"}. 360°/surround camera term: ${hasCamera ? "found" : "not found"}. ADAS term: ${hasAdas ? "found" : "not found"}. This is a text search only; verify the exact variant.`
  };
}
async function readPdf(file) {
  if (!file || file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error(`${file?.name || "Selected file"} is not a PDF.`);
  const pdfjs = await import("./vendor/pdf.js");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdf.worker.js", import.meta.url).href;
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNum = 1; pageNum <= document.numPages; pageNum++) {
    const page = await document.getPage(pageNum);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(" "));
  }
  return pages.join("\n").trim();
}
async function handleFiles(files) {
  const pdfs = [...files].filter(file => file.name.toLowerCase().endsWith(".pdf"));
  if (!pdfs.length) { showImportMessage("Please select at least one PDF brochure.", true); return; }
  $("#upload-progress").hidden = false;
  const added = [];
  try {
    for (let index = 0; index < pdfs.length; index++) {
      const file = pdfs[index];
      $("#progress-text").textContent = `Reading ${file.name}`;
      const textContent = await readPdf(file);
      if (!textContent) throw new Error(`${file.name}: no selectable text was found. This may be a scanned PDF; use a text-searchable brochure.`);
      const car = candidateImportedCar(file.name, textContent);
      await storeTransaction("readwrite", store => store.put(car));
      added.push(car);
      const percent = Math.round(((index + 1) / pdfs.length) * 100);
      $("#progress-percent").textContent = `${percent}%`;
      $("#progress-bar").style.width = `${percent}%`;
    }
    importedCars = await loadImports();
    renderAll();
    showImportMessage(`${added.length} brochure${added.length === 1 ? "" : "s"} added. Review the extracted car details and confirm trim-specific features before relying on them.`);
  } catch (error) {
    showImportMessage(error.message || "The brochure could not be processed.", true);
  } finally {
    $("#upload-progress").hidden = true;
    $("#file-input").value = "";
  }
}
function showImportMessage(message, isError = false) {
  const el = $("#import-message");
  el.hidden = false;
  el.classList.toggle("error", isError);
  el.textContent = message;
}
function renderAll() { renderDashboard(); renderMatches(); renderCompare(); renderFilters(); renderRanking(); renderLibrary(); }

$$(".tab").forEach(button => button.addEventListener("click", () => activateTab(button.dataset.tab)));
$$("[data-go]").forEach(button => button.addEventListener("click", () => activateTab(button.dataset.go)));
$("#city-select").onchange = event => {
  currentCity = event.target.value;
  $("#matches-city").value = currentCity;
  $("#compare-city").value = currentCity;
  renderDashboard(); renderMatches(); renderCompare();
};
$("#matches-city").onchange = renderMatches;
$("#compare-city").onchange = event => {
  currentCity = event.target.value;
  $("#city-select").value = currentCity;
  $("#matches-city").value = currentCity;
  renderDashboard(); renderMatches(); renderCompare();
};
$("#ranking-usage").onchange = renderRanking;
$("#usecase-grid").onclick = event => {
  const card = event.target.closest("[data-use]");
  if (!card) return;
  selectedUse = card.dataset.use;
  $("#ranking-usage").value = selectedUse;
  $("#usage-filter").value = selectedUse;
  renderDashboard(); renderRanking(); renderFilters();
};
$("#compare-picks").onchange = event => {
  if (!event.target.matches("[data-compare-pick]")) return;
  const checked = $$("[data-compare-pick]:checked", $("#compare-picks"));
  if (checked.length > 4) { event.target.checked = false; showToast("Choose up to four cars to compare."); }
  sessionStorage.setItem("compare-picks", JSON.stringify($$("[data-compare-pick]:checked", $("#compare-picks")).map(input => input.dataset.comparePick)));
  renderCompare();
};
$("#filter-form").onsubmit = event => { event.preventDefault(); renderFilters(); };
["budget-range", "filter-city", "seats-filter", "transmission-filter", "fuel-filter", "usage-filter", "need-auto", "need-camera", "need-adas"].forEach(id => {
  $(`#${id}`).addEventListener("input", renderFilters);
  $(`#${id}`).addEventListener("change", renderFilters);
});
$("#reset-filters").onclick = () => {
  $("#filter-city").value = "bengaluru"; $("#budget-range").value = "24";
  $("#seats-filter").value = "any"; $("#transmission-filter").value = "any"; $("#fuel-filter").value = "any";
  $("#usage-filter").value = "family"; $("#need-auto").checked = true; $("#need-camera").checked = true; $("#need-adas").checked = true;
  renderFilters();
};
$("#car-dialog").addEventListener("click", event => { if (event.target === $("#car-dialog")) $("#car-dialog").close(); });
$("#dialog-close").onclick = () => $("#car-dialog").close();
$("#upload-top").onclick = $("#upload-library").onclick = () => activateTab("library");
$("#browse-files").onclick = () => $("#file-input").click();
$("#file-input").onchange = event => handleFiles(event.target.files);
$("#drop-zone").ondragover = event => { event.preventDefault(); $("#drop-zone").classList.add("dragover"); };
$("#drop-zone").ondragleave = () => $("#drop-zone").classList.remove("dragover");
$("#drop-zone").ondrop = event => { event.preventDefault(); $("#drop-zone").classList.remove("dragover"); handleFiles(event.dataTransfer.files); };
$("#drop-zone").onkeydown = event => { if (event.key === "Enter" || event.key === " ") $("#file-input").click(); };
$("#export-data").onclick = () => {
  const blob = new Blob([JSON.stringify({ format: "car-finder-library-v1", exportedAt: new Date().toISOString(), cars: importedCars }, null, 2)], { type: "application/json" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "car-finder-library.json"; link.click(); URL.revokeObjectURL(link.href);
};
$("#import-data").onclick = () => $("#json-input").click();
$("#json-input").onchange = async event => {
  try {
    const data = JSON.parse(await event.target.files[0].text());
    if (!Array.isArray(data.cars) || data.cars.some(car => !car.id || !car.make || !car.model || !car.imported)) throw new Error("This file is not a valid Car Finder library export.");
    for (const car of data.cars) await storeTransaction("readwrite", store => store.put(car));
    importedCars = await loadImports(); renderAll(); showToast(`${data.cars.length} imported cars added to this device.`);
  } catch (error) { showImportMessage(error.message || "Could not import that library file.", true); }
  finally { event.target.value = ""; }
};
$("#install-button").onclick = async () => {
  if (!window.installPrompt) return;
  await window.installPrompt.prompt();
  window.installPrompt = null;
  $("#install-button").hidden = true;
};
window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); window.installPrompt = event; $("#install-button").hidden = false; });
window.addEventListener("online", () => { $("#connection-label").textContent = "Online · offline ready"; });
window.addEventListener("offline", () => { $("#connection-label").textContent = "Offline ready"; });
$("#connection-label").textContent = navigator.onLine ? "Online · offline ready" : "Offline ready";

try {
  importedCars = await loadImports();
} catch (error) {
  showImportMessage(`Local storage unavailable: ${error.message}`, true);
}
renderAll();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(error => console.error("Offline caching could not be enabled:", error));
}
