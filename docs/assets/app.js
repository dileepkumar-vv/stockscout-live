const API_BASE = "https://stockscout-live.onrender.com";

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
  tableBody: document.querySelector("#resultsTable tbody"),
  sectorButtons: document.querySelectorAll(".sector-btn")
};

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
    alert("Failed to load data");
  } finally {
    els.runScreen.disabled = false;
    els.runScreen.textContent = "Run Screen";
  }
}

function initEvents() {
  [
    els.fall52,
    els.de,
    els.promHold,
    els.pledged,
    els.revGrowth,
    els.roe,
    els.cr,
    els.mc
  ].forEach(input => {
    input.addEventListener("input", () => {
      buildScreenerQuery();
      renderTable();
    });
  });

  els.runScreen.addEventListener("click", () => {
    loadData();
  });

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
  buildScreenerQuery();
  initEvents();
}

init();
