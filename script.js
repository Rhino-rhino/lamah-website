// ---- Settings: change these two lines ----
const EMAIL = "contact@lamahservices.com";
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID"; // see hosting notes

// ---- Prices & Metadata: edit numbers here and the whole site updates ----
const PRICES = {
  eot: [
    ["Studio", 195, "Fixed rate • Full checkout checklist", false],
    ["1 Bed, 1 Bath", 220, "Fixed rate • Full checkout checklist", true],
    ["2 Bed, 1 Bath", 265, "Fixed rate • Full checkout checklist", true],
    ["2 Bed, 2 Bath", 315, "Fixed rate • Full checkout checklist", false],
    ["3 Bed, 1 Bath", 360, "Fixed rate • Full checkout checklist", false],
    ["3 Bed, 2 Bath", 385, "Fixed rate • Full checkout checklist", false],
    ["3 Bed, 3 Bath", 435, "Fixed rate • Full checkout checklist", false],
    ["4 Bed, 2 Bath", 530, "Fixed rate • Full checkout checklist", false],
    ["4 Bed, 3 Bath", 575, "Fixed rate • Full checkout checklist", false],
    ["5 Bed, 2 Bath", 615, "Fixed rate • Full checkout checklist", false],
    ["5 Bed, 3 Bath", 660, "Fixed rate • Full checkout checklist", false],
    ["6 Bed, 2 Bath", 685, "Fixed rate • Full checkout checklist", false],
    ["6 Bed, 3 Bath", 735, "Fixed rate • Full checkout checklist", false]
  ],
  abnb: [
    ["Studio", 55, "Guest reset & sanitisation", false],
    ["1 Bed, 1 Bath", 60, "Guest reset & sanitisation", true],
    ["2 Bed, 1 Bath", 75, "Guest reset & sanitisation", true],
    ["2 Bed, 2 Bath", 85, "Guest reset & sanitisation", false],
    ["3 Bed, 1 Bath", 100, "Guest reset & sanitisation", false],
    ["3 Bed, 2 Bath", 110, "Guest reset & sanitisation", false],
    ["3 Bed, 3 Bath", 125, "Guest reset & sanitisation", false],
    ["4 Bed, 2 Bath", 135, "Guest reset & sanitisation", false],
    ["4 Bed, 3 Bath", 150, "Guest reset & sanitisation", false],
    ["5 Bed, 2 Bath", 160, "Guest reset & sanitisation", false],
    ["5 Bed, 3 Bath", 170, "Guest reset & sanitisation", false],
    ["6 Bed, 2 Bath", 180, "Guest reset & sanitisation", false],
    ["6 Bed, 3 Bath", 190, "Guest reset & sanitisation", false]
  ]
};

const ADD = {carpet: 55, recep: 70, bath: 50, wc: 30, minCarpet: 100};
const ADDONS = [
  ["Carpet steam cleaning", "Hot-water extraction per room", ADD.carpet, "carpets", true],
  ["Additional reception room", "Secondary lounge, dining room or study", ADD.recep, "recep", false],
  ["Additional bathroom / en-suite", "Full descaling & sanitisation", ADD.bath, "baths", false],
  ["Additional separate WC", "Toilet & basin sanitisation", ADD.wc, "wcs", false],
  ["Carpet-only call-out minimum", "Applies only when booked without a property clean", ADD.minCarpet, "carpetOnly", false]
];

const PG_NOTES = {
  eot: ["Includes internal oven, fridge/freezer, cupboards, limescale removal & 72-hour guarantee.", "Fixed rates • No hidden fees"],
  abnb: ["Includes bathroom & kitchen sanitisation, dusting, floors & damage photo check.", "Same-day turnovers available"],
  addons: ["Book carpets alongside an end-of-tenancy clean for £55/room with no minimum call-out.", "Bundle & save"]
};

const $ = id => document.getElementById(id);

// ---- Interactive Price Guide ----
let activePgTab = "eot";
function renderPriceGuide(tab) {
  activePgTab = tab;
  const [desc, badge] = PG_NOTES[tab];
  $("pgMeta").innerHTML = `<span>${desc}</span><strong>${badge}</strong>`;

  if (tab === "addons") {
    $("pgGrid").innerHTML = ADDONS.map(([title, sub, price, target, pop]) => `
      <button type="button" class="pg-card ${pop ? "popular" : ""}" data-addon="${target}">
        <div>
          ${pop ? '<span class="pg-badge">Most booked add-on</span>' : ""}
          <span class="pg-title">${title}</span>
          <span class="pg-sub">${sub}</span>
        </div>
        <div class="pg-bottom">
          <span class="pg-price">£${price}</span>
          <span class="pg-cta">Add to calculator &uarr;</span>
        </div>
      </button>
    `).join("");
  } else {
    $("pgGrid").innerHTML = PRICES[tab].map(([title, price, sub, pop], idx) => `
      <button type="button" class="pg-card ${pop ? "popular" : ""}" data-svc="${tab}" data-idx="${idx}">
        <div>
          ${pop ? '<span class="pg-badge">Most popular</span>' : ""}
          <span class="pg-title">${title}</span>
          <span class="pg-sub">${sub}</span>
        </div>
        <div class="pg-bottom">
          <span class="pg-price">£${price}</span>
          <span class="pg-cta">Select rate &uarr;</span>
        </div>
      </button>
    `).join("");
  }
}

document.querySelectorAll(".pg-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".pg-tab.active").classList.remove("active");
    btn.classList.add("active");
    renderPriceGuide(btn.dataset.pg);
  });
});

$("pgGrid").addEventListener("click", e => {
  const card = e.target.closest(".pg-card");
  if (!card) return;
  if (card.dataset.svc) {
    setServicePill(card.dataset.svc);
    $("size").value = card.dataset.idx;
  } else if (card.dataset.addon === "carpetOnly") {
    setServicePill("carpet");
    $("carpets").value = 1;
  } else if (card.dataset.addon) {
    if ($("svc").value === "carpet") setServicePill("eot");
    const inp = $(card.dataset.addon);
    inp.value = (parseInt(inp.value) || 0) + 1;
  }
  calc();
  $("estimate").scrollIntoView({behavior: "smooth"});
});

// ---- Interactive Hero Checklist ----
const ROOMS = {
  kitchen: ["Oven cleaned inside & racks degreased", "Hob, extractor fan & splashback", "Behind and under white goods", "Inside all cupboards and drawers", "Sink descaled & polished", "Floors vacuumed and washed"],
  bath: ["Shower screen, tiles & taps descaled", "Toilet sanitised inside and out", "Extractor fan & mirrors polished", "Inside vanity units & cabinets", "Towel rails & skirting boards wiped", "Floors scrubbed and sanitised"],
  rooms: ["Skirting boards, doors & light switches", "Inside wardrobes & built-in storage", "Internal windows, sills & frames", "Cobwebs removed from ceilings", "Radiators wiped down", "Carpets vacuumed / hard floors mopped"]
};

function renderRoom(room) {
  $("roomList").innerHTML = ROOMS[room].map(item => `<li>${item}</li>`).join("");
}
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    btn.classList.add("active");
    renderRoom(btn.dataset.room);
  });
});
renderRoom("kitchen");

// ---- Estimator ----
let lastEstimate = "";
function setServicePill(val) {
  document.querySelectorAll("#svcPills .pill").forEach(b => b.classList.toggle("active", b.dataset.val === val));
  $("svc").value = val;
  fillSizes();
}

function fillSizes() {
  const list = PRICES[$("svc").value] || [];
  $("size").innerHTML = list.map(([n], i) => `<option value="${i}">${n}</option>`).join("");
  $("sizeWrap").hidden = $("svc").value === "carpet";
}

function calc() {
  const svc = $("svc").value, n = id => Math.max(0, parseInt($(id).value) || 0);
  const lines = []; let total = 0;
  if (svc === "carpet") {
    const rooms = Math.max(1, n("carpets"));
    if (n("carpets") === 0) $("carpets").value = 1;
    const raw = rooms * ADD.carpet;
    total = Math.max(raw, ADD.minCarpet);
    lines.push([`Carpet cleaning (${rooms} room${rooms > 1 ? "s" : ""})`, raw]);
    if (raw < ADD.minCarpet) lines.push(["Minimum call-out adjustment", ADD.minCarpet - raw]);
  } else {
    const [name, price] = PRICES[svc][$("size").value];
    lines.push([name, price]); total = price;
    [["carpets", "Carpet steam clean", ADD.carpet], ["recep", "Extra reception room", ADD.recep], ["baths", "Extra bathroom", ADD.bath], ["wcs", "Extra separate WC", ADD.wc]].forEach(([id, label, p]) => {
      if (n(id)) { lines.push([`${label} × ${n(id)}`, n(id) * p]); total += n(id) * p; }
    });
  }
  $("total").textContent = "£" + total;
  $("lines").innerHTML = lines.map(([a, p]) => `<li><span>${a}</span><span>£${p}</span></li>`).join("");
  lastEstimate = `Estimate: £${total} (${lines.map(l => l[0]).join("; ")})`;
}

document.querySelectorAll("#svcPills .pill").forEach(btn => {
  btn.addEventListener("click", () => {
    setServicePill(btn.dataset.val);
    calc();
  });
});

document.querySelectorAll("[data-step]").forEach(btn => {
  btn.addEventListener("click", () => {
    const inp = $(btn.dataset.step);
    const min = ($("svc").value === "carpet" && btn.dataset.step === "carpets") ? 1 : 0;
    inp.value = Math.max(min, (parseInt(inp.value) || 0) + parseInt(btn.dataset.d));
    calc();
  });
});

$("calc").addEventListener("input", () => calc());
$("useEst").addEventListener("click", () => {
  $("fService").value = document.querySelector("#svcPills .pill.active").textContent;
  $("fDetails").value = lastEstimate + "\n";
});

renderPriceGuide("eot");
fillSizes();
calc();

// ---- Email links ----
document.querySelectorAll("[data-mail]").forEach(el => {
  el.href = `mailto:${EMAIL}?subject=${encodeURIComponent(el.dataset.mail)}`;
});

// ---- Quote form ----
$("qform").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target, status = $("status");
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const files = $("fPhotos").files;
  let totalSize = 0;
  for (const file of files) totalSize += file.size;
  if (totalSize > 10 * 1024 * 1024) {
    status.textContent = "Photos are too large (max 10MB total). Please select fewer images or send them via WhatsApp.";
    return;
  }

  if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) {
    status.textContent = "The form isn't connected yet. Please call, WhatsApp or email us instead.";
    return;
  }
  status.textContent = "Sending...";
  try {
    const res = await fetch(FORM_ENDPOINT, {method: "POST", body: new FormData(form), headers: {Accept: "application/json"}});
    if (res.ok) { form.reset(); status.textContent = "Thank you. We'll reply with your written price soon."; }
    else status.textContent = "Something went wrong. Please call or WhatsApp us on 07867 027554.";
  } catch (err) {
    status.textContent = "We couldn't send that. Please check your connection or call 07867 027554.";
  }
});
