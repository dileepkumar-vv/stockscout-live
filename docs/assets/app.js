const API_BASE = "https://stockscout-live.onrender.com";
const STORAGE_KEY = "stockscout7_filters_v1";

const state = {
  sector: "ALL",
  data: []
};

const els = {
  fall52: document.getElementById("fall52"),
  de: document.getElementById("de"),
  promHold: document.getElementById("promHold"),
  pledged: document.getElementById("pledged"),
  revGrowth: document.getElementById("revGrowth"),
  roe: document.getElementById("roe"),
  cr: document.getElementById("cr"),
  mc: document.getElementById("mc"),
  screenerQuery: document.getElementById("screenerQuery"),
  runScreen: document.getElementById("runScreen"),
  resetFilters: document.getElementById("resetFilters"),
  tableBody: document.querySelector("#resultsTable tbody"),
  sectorButtons: document.querySelectorAll(".sector-btn")
};

const DEFAULTS = {
  fall52: 30,
  promHold: 35,
  revGrowth: 10,
  roe: 8,
  de: 1,
  pledged: 10,
  cr: 1,
  mc: 500
};

function loadSavedFilters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveFilters() {
  const values = {
    fall52: Number(els.fall52.value) || DEFAULTS.fall52,
    promHold: Number(els.promHold.value) || DEFAULTS.promHold,
    revGrowth: Number(els.revGrowth.value) || DEFAULTS.revGrowth,
    roe: Number(els.roe.value) || DEFAULTS.roe,
    de: Number(els.de.value) || DEFAULTS.de,
    pledged: Number(els.pledged.value) || DEFAULTS.pledged,
    cr: Number(els.cr.value) || DEFAULTS.cr,
    mc: Number(els.mc.value) || DEFAULTS.mc
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

function applyFiltersToInputs(values) {
  els.fall52.value = values.fall52;
  els.promHold.value = values.promHold;
  els.revGrowth.value = values.revGrowth;
  els.roe.value = values.roe;
  els.de.value = values.de;
  els.pledged.value = values.pledged;
  els.cr.value = values.cr;
  els.mc.value = values.mc;
}

function buildScreenerQuery() {
  const fall = Number(els.fall52.value) || 0;
  const de = Number(els.de.value) || 0;
  const prom = Number(els.promHold.value) || 0;
  const pled = Number(els.pledged.value) || 0;
  const rg = Number(els.revGrowth.value) || 0;
  const roe = Number(els.roe.value) || 0;
  const cr = Number(els.cr.value) || 0;
  const mc = Number(els.mc.value) || 0;

  const lines = [
    `Down from 52w high > ${fall}`,
    `Debt to equity < ${de}`,
    `Promoter holding > ${prom}`,
    `Pledged percentage < ${pled}`,
    `Sales growth 3Years > ${rg}`,
    `Market Capitalization > ${mc}`,
    `Return on equity > ${roe}`,
    `Current Ratio > ${cr}`
  ];

  els.screenerQuery.textContent = lines.join(" AND\n");
}

function fallFromHigh(p, h) {
  if (!h || !p) return 0;
  return Math.round(((h - p) / h) * 100);
}

function passesFilters(stock) {
  const fall = Number(els.fall52.value) || 0;
  const de = Number(els.de.value) || 0;
  const prom = Number(els.promHold.value) || 0;
  const pled = Number(els.pledged.value) || 0;
  const rg = Number(els.revGrowth.value) || 0;
  const roe = Number(els.roe.value) || 0;
  const cr = Number(els.cr.value) || 0;
  const mc = Number(els.mc.value) || 0;

  const f = fallFromHigh(stock.p, stock.h);

  if (f < fall) return false;
  if (stock.de > de) return false;
  if (stock.pr < prom) return false;
  if (stock.pl > pled) return false;
  if (stock.rg < rg) return false;
  if (stock.roe < roe) return false;
  if (stock.cr < cr) return false;
  if (stock.mc < mc) return false;

  if (state.sector !== "ALL" && stock.s !== state.sector) return false;

  return true;
}

function renderTable() {
  els.tableBody.innerHTML = "";
  const filtered = state.data.filter(passesFilters);

  filtered.forEach(s => {
    const tr = document.createElement("tr");
    const f = fallFromHigh(s.p, s.h);

    tr.innerHTML = `
      <td>${s.t}</td>
      <td>${s.n}</td>
      <td>${s.p.toFixed(2)}</td>
      <td>${s.mc}</td>
      <td>${s.roe}</td>
      <td>${s.rg}</td>
      <td>${s.de.toFixed(2)}</td>
      <td>${s.pr}</td>
      <td>${s.pl}</td>
      <td>${s.h.toFixed(2)}</td>
      <td>${s.l.toFixed(2)}</td>
      <td>${f}</td>
      <td>${s.s}</td>
    `;

    els.tableBody.appendChild(tr);
  });
}

async function loadData() {
  els.runScreen.disabled = true;
  els.runScreen.textContent = "Loading...";

  try {
    const resp = await fetch(`${API_BASE}/api/screen`);
    const json = await resp.json();
    state.data = json;
    renderTable();
  } catch (e) {
    console.error(e);
    alert("Failed to load data from backend.");
  } finally {
    els.runScreen.disabled = false;
    els.runScreen.textContent = "Run Screen";
  }
}

function validateInput(el, { min = 0, max = null } = {}) {
  const row = el.closest(".input-row");
  const val = el.value === "" ? null : Number(el.value);
  let valid = true;

  if (val === null || Number.isNaN(val)) valid = false;
  if (valid && val < min) valid = false;
  if (valid && max !== null && val > max) valid = false;

  if (!valid) {
    row.classList.add("invalid");
  } else {
    row.classList.remove("invalid");
  }

  return valid;
}

function attachFilterEvents() {
  const config = {
    fall52: { min: 0 },
    promHold: { min: 0, max: 100 },
    revGrowth: { min: 0 },
    roe: { min: 0 },
    de: { min: 0 },
    pledged: { min: 0, max: 100 },
    cr: { min: 0 },
    mc: { min: 0 }
  };

  Object.entries(config).forEach(([key, rules]) => {
    const el = els[key];
    el.addEventListener("input", () => {
      validateInput(el, rules);
      saveFilters();
      buildScreenerQuery();
      renderTable();
    });
    el.addEventListener("blur", () => {
      if (!validateInput(el, rules)) {
        el.value = DEFAULTS[key];
        saveFilters();
        buildScreenerQuery();
        renderTable();
      }
    });
  });

  els.resetFilters.addEventListener("click", () => {
    applyFiltersToInputs(DEFAULTS);
    Object.values(els)
      .filter(e => e && e.classList && e.classList.contains("input-row"))
      .forEach(row => row.classList.remove("invalid"));
    saveFilters();
    buildScreenerQuery();
    renderTable();
  });
}

function attachSectorEvents() {
  els.sectorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      els.sectorButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.sector = btn.dataset.sector;
      renderTable();
    });
  });
}

function init() {
  const saved = loadSavedFilters();
  applyFiltersToInputs(saved);
  buildScreenerQuery();
  attachFilterEvents();
  attachSectorEvents();

  els.runScreen.addEventListener("click", () => {
    loadData();
  });
}

init();
