const API_BASE = "http://localhost:3000";

let DB = [];
let watchlist = [];

function loadWatchlist() {
  try {
    watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
  } catch {
    watchlist = [];
  }
  renderWatchlist();
}

function saveWatchlist() {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

function renderWatchlist() {
  const container = document.getElementById("watchlist");
  container.innerHTML = "";
  watchlist.forEach(t => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `
      <span>${t}</span>
      <button data-t="${t}">✕</button>
    `;
    container.appendChild(chip);
  });

  container.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      const t = btn.getAttribute("data-t");
      watchlist = watchlist.filter(x => x !== t);
      saveWatchlist();
      renderWatchlist();
    };
  });
}

async function loadDB() {
  try {
    const resp = await fetch(
      `${API_BASE}/api/stocks?extra=${watchlist.join(",")}`
    );
    DB = await resp.json();
  } catch (e) {
    console.error("Failed to load DB", e);
  }
}

function scoreStock(s) {
  let score = 0;
  if (s.roe >= 15) score += 2;
  if (s.de <= 1) score += 2;
  if (s.rg >= 10) score += 1;
  if (s.mc >= 5000) score += 1;
  return score;
}

function renderScreenResults(list) {
  const container = document.getElementById("screenResults");
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML =
      '<div class="card"><div class="card-body">No matches.</div></div>';
    return;
  }

  list.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";

    const changeBadge =
      s.p >= (s.l + s.h) / 2
        ? '<span class="badge badge-success">Strong</span>'
        : '<span class="badge badge-danger">Weak</span>';

    card.innerHTML = `
      <div class="card-title">
        ${s.t} <span class="card-subtitle">· ${s.n || ""}</span>
      </div>
      <div class="card-row">
        <span class="label">Price</span>
        <span class="value">₹${s.p.toFixed(2)}</span>
      </div>
      <div class="card-row">
        <span class="label">52W</span>
        <span class="value">₹${s.l.toFixed(0)} – ₹${s.h.toFixed(0)}</span>
      </div>
      <div class="card-row">
        <span class="label">ROE</span>
        <span class="value">${s.roe}%</span>
      </div>
      <div class="card-row">
        <span class="label">D/E</span>
        <span class="value">${s.de.toFixed(2)}</span>
      </div>
      <div class="card-row">
        <span class="label">Mkt Cap</span>
        <span class="value">${s.mc} Cr</span>
      </div>
      <div class="card-row">
        <span class="label">Score</span>
        <span class="value">${s._score} ${changeBadge}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

async function runScreen() {
  await loadDB();

  const roeMin = parseFloat(document.getElementById("f-roe").value || "0");
  const deMax = parseFloat(document.getElementById("f-de").value || "999");
  const mcMin = parseFloat(document.getElementById("f-mc").value || "0");

  const filtered = DB.filter(s => {
    if (s.roe < roeMin) return false;
    if (s.de > deMax) return false;
    if (s.mc < mcMin) return false;
    return true;
  }).map(s => ({ ...s, _score: scoreStock(s) }));

  filtered.sort((a, b) => b._score - a._score);
  renderScreenResults(filtered);
}

async function searchStock() {
  const q = document.getElementById("searchInput").value.trim().toUpperCase();
  if (!q) return;

  const container = document.getElementById("searchResult");
  container.innerHTML = "";

  try {
    const resp = await fetch(`${API_BASE}/api/stock?ticker=${q}`);
    const s = await resp.json();
    if (!s || s.error) {
      container.innerHTML =
        '<div class="card"><div class="card-body">Not found.</div></div>';
      return;
    }

    s._score = scoreStock(s);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-title">
        ${s.t} <span class="card-subtitle">· ${s.n || ""}</span>
      </div>
      <div class="card-row">
        <span class="label">Price</span>
        <span class="value">₹${s.p.toFixed(2)}</span>
      </div>
      <div class="card-row">
        <span class="label">52W</span>
        <span class="value">₹${s.l.toFixed(0)} – ₹${s.h.toFixed(0)}</span>
      </div>
      <div class="card-row">
        <span class="label">ROE</span>
        <span class="value">${s.roe}%</span>
      </div>
      <div class="card-row">
        <span class="label">D/E</span>
        <span class="value">${s.de.toFixed(2)}</span>
      </div>
      <div class="card-row">
        <span class="label">Mkt Cap</span>
        <span class="value">${s.mc} Cr</span>
      </div>
      <div class="card-row">
        <span class="label">Score</span>
        <span class="value">${s._score}</span>
      </div>
    `;
    container.appendChild(card);
  } catch (e) {
    container.innerHTML =
      '<div class="card"><div class="card-body">Error fetching data.</div></div>';
  }
}

function addCustomTicker() {
  const input = document.getElementById("customTicker");
  const t = input.value.trim().toUpperCase();
  if (!t) return;
  if (!watchlist.includes(t)) {
    watchlist.push(t);
    saveWatchlist();
    renderWatchlist();
  }
  input.value = "";
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");

  navItems.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute("data-tab");

      navItems.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      tabs.forEach(t => t.classList.remove("active"));
      document.getElementById(`tab-${tab}`).classList.add("active");
    };
  });
}

function setupThemeToggle() {
  const btn = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme") || "dark";
  document.body.className = saved === "light" ? "theme-light" : "theme-dark";

  btn.onclick = () => {
    const isDark = document.body.classList.contains("theme-dark");
    document.body.classList.toggle("theme-dark", !isDark);
    document.body.classList.toggle("theme-light", isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };
}

function setupEvents() {
  document
    .getElementById("btnRunScreen")
    .addEventListener("click", runScreen);

  document
    .getElementById("btnSearch")
    .addEventListener("click", searchStock);

  document
    .getElementById("btnAddCustom")
    .addEventListener("click", addCustomTicker);
}

window.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  setupThemeToggle();
  loadWatchlist();
  await loadDB();
});