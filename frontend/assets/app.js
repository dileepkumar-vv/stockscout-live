document.addEventListener("DOMContentLoaded", () => {

  // TAB SWITCHING
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.getElementById(`tab-${tab}`).classList.add("active");
    });
  });

  // GLOBAL SEARCH
  const searchInput = document.getElementById("searchInput");
  const autocompleteList = document.getElementById("autocompleteList");
  const searchResult = document.getElementById("searchResult");

  searchInput.addEventListener("input", async () => {
    const q = searchInput.value.trim().toUpperCase();
    if (q.length < 2) {
      autocompleteList.innerHTML = "";
      return;
    }

    const res = await fetch(`/api/global?ticker=${q}`).then(r => r.json());

    if (!res.search || !res.search.data) {
      autocompleteList.innerHTML = "";
      return;
    }

    autocompleteList.innerHTML = res.search.data
      .filter(s => s.exchange === "NSE")
      .map(s => `
        <div class="autocomplete-item" data-symbol="${s.symbol}">
          ${s.symbol} — ${s.instrument_name}
        </div>
      `)
      .join("");

    document.querySelectorAll(".autocomplete-item").forEach(item => {
      item.addEventListener("click", () => {
        searchInput.value = item.dataset.symbol;
        autocompleteList.innerHTML = "";
        runSearch(item.dataset.symbol);
      });
    });
  });

  document.getElementById("btnSearch").addEventListener("click", () => {
    const t = searchInput.value.trim().toUpperCase();
    runSearch(t);
  });

  async function runSearch(ticker) {
    searchResult.innerHTML = `<div class="card info-card">Loading...</div>`;

    const data = await fetch(`/api/stock?ticker=${ticker}`).then(r => r.json());

    if (!data || data.error) {
      searchResult.innerHTML = `<div class="card info-card">No data found</div>`;
      return;
    }

    searchResult.innerHTML = `
      <div class="card stock-card">
        <div class="card-title">${data.n} (${data.t})</div>
        <div class="card-body">
          <p>Price: ₹${data.p}</p>
          <p>52W High: ₹${data.h}</p>
          <p>52W Low: ₹${data.l}</p>
          <p>Market Cap: ₹${data.mc}</p>
          <p>Sector: ${data.s}</p>
        </div>
      </div>
    `;
  }

});
