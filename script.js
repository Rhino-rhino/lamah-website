// ---- Settings: change these two lines ----
const EMAIL = "contact@lamahservices.com";
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID"; // see the hosting notes

// ---- Prices: edit numbers here and the whole site updates ----
const PRICES = {
  eot: [["Studio",195],["1 Bed, 1 Bath",220],["2 Bed, 1 Bath",265],["2 Bed, 2 Bath",315],["3 Bed, 1 Bath",360],["3 Bed, 2 Bath",385],["3 Bed, 3 Bath",435],["4 Bed, 2 Bath",530],["4 Bed, 3 Bath",575],["5 Bed, 2 Bath",615],["5 Bed, 3 Bath",660],["6 Bed, 2 Bath",685],["6 Bed, 3 Bath",735]],
  abnb: [["Studio",55],["1 Bed, 1 Bath",60],["2 Bed, 1 Bath",75],["2 Bed, 2 Bath",85],["3 Bed, 1 Bath",100],["3 Bed, 2 Bath",110],["3 Bed, 3 Bath",125],["4 Bed, 2 Bath",135],["4 Bed, 3 Bath",150],["5 Bed, 2 Bath",160],["5 Bed, 3 Bath",170],["6 Bed, 2 Bath",180],["6 Bed, 3 Bath",190]]
};
const ADD = {carpet:55, recep:70, bath:50, wc:30, minCarpet:100};
const ADDONS = [["Carpet cleaning","per room",ADD.carpet],["Additional reception room","secondary living room, dining room or study",ADD.recep],["Additional bathroom or en-suite","",ADD.bath],["Additional separate WC","",ADD.wc],["Minimum call-out charge","carpet cleaning booked on its own",ADD.minCarpet]];

const $ = id => document.getElementById(id);
const row = (a, s, p) => `<tr><td>${a}${s ? `<small>${s}</small>` : ""}</td><td>£${p}</td></tr>`;
$("eot").innerHTML = PRICES.eot.map(([a,p]) => row(a,"",p)).join("");
$("abnb").innerHTML = PRICES.abnb.map(([a,p]) => row(a,"",p)).join("");
$("addons").innerHTML = ADDONS.map(([a,s,p]) => row(a,s,p)).join("");

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
function fillSizes() {
  const list = PRICES[$("svc").value] || [];
  $("size").innerHTML = list.map(([n,p],i) => `<option value="${i}">${n}</option>`).join("");
  $("sizeWrap").hidden = $("svc").value === "carpet";
}
function calc() {
  const svc = $("svc").value, n = id => Math.max(0, parseInt($(id).value) || 0);
  const lines = []; let total = 0;
  if (svc === "carpet") {
    const rooms = Math.max(1, n("carpets"));
    const raw = rooms * ADD.carpet;
    total = Math.max(raw, ADD.minCarpet);
    lines.push([`Carpet cleaning, ${rooms} room${rooms>1?"s":""}`, raw]);
    if (raw < ADD.minCarpet) lines.push(["Minimum call-out charge applied", ADD.minCarpet - raw]);
  } else {
    const [name, price] = PRICES[svc][$("size").value];
    lines.push([name, price]); total = price;
    [["carpets","Carpet cleaning (rooms)",ADD.carpet],["recep","Additional reception rooms",ADD.recep],["baths","Additional bathrooms or en-suites",ADD.bath],["wcs","Additional separate WCs",ADD.wc]].forEach(([id,label,p]) => {
      if (n(id)) { lines.push([`${label} x ${n(id)}`, n(id)*p]); total += n(id)*p; }
    });
  }
  $("total").textContent = "£" + total;
  $("lines").innerHTML = lines.map(([a,p]) => `<li><span>${a}</span><span>£${p}</span></li>`).join("");
  lastEstimate = `Estimate: £${total} (${lines.map(l => l[0]).join("; ")})`;
}

// Pill & Stepper listeners
document.querySelectorAll("#svcPills .pill").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector("#svcPills .pill.active").classList.remove("active");
    btn.classList.add("active");
    $("svc").value = btn.dataset.val;
    fillSizes(); calc();
  });
});
document.querySelectorAll("[data-step]").forEach(btn => {
  btn.addEventListener("click", () => {
    const inp = $(btn.dataset.step);
    inp.value = Math.max(0, (parseInt(inp.value) || 0) + parseInt(btn.dataset.d));
    calc();
  });
});

$("calc").addEventListener("input", () => calc());
$("useEst").addEventListener("click", () => {
  $("fService").value = document.querySelector("#svcPills .pill.active").textContent;
  $("fDetails").value = lastEstimate + "\n";
});
fillSizes(); calc();

// ---- Email links ----
document.querySelectorAll("[data-mail]").forEach(el => {
  el.href = `mailto:${EMAIL}?subject=${encodeURIComponent(el.dataset.mail)}`;
});

// ---- Quote form ----
$("qform").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target, status = $("status");
  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) {
    status.textContent = "The form isn't connected yet. Please call, WhatsApp or email us instead.";
    return;
  }
  status.textContent = "Sending...";
  try {
    const res = await fetch(FORM_ENDPOINT, {method:"POST", body:new FormData(form), headers:{Accept:"application/json"}});
    if (res.ok) { form.reset(); status.textContent = "Thank you. We'll reply with your written price soon."; }
    else status.textContent = "Something went wrong. Please call or WhatsApp us on 07867 027554.";
  } catch (err) {
    status.textContent = "We couldn't send that. Please check your connection or call 07867 027554.";
  }
});
