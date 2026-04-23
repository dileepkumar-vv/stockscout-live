const express = require("express");
const cors = require("cors");
const fetchStock = require("./fetchStock");
const nifty500 = require("./nifty500.json");

const app = express();
app.use(cors());

// Health check
app.get("/api/test", (req, res) => {
  res.json({ status: "ok" });
});

// Cache
let cache = {};
let cacheTime = 0;

// Fetch all stocks (NIFTY500 + extra)
async function getAllStocks(extraTickers = []) {
  const now = Date.now();

  // 5‑minute cache
  if (now - cacheTime < 5 * 60 * 1000 && Object.keys(cache).length) {
    return cache;
  }

  const tickers = [...new Set([...nifty500, ...extraTickers])]
    .map(t => t.trim().toUpperCase())
    .filter(Boolean);

  const results = {};
  for (const t of tickers) {
    const data = await fetchStock(t);
    if (data) results[t] = data;
  }

  cache = results;
  cacheTime = now;

  return results;
}

// SEARCH
app.get("/api/search", (req, res) => {
  const q = (req.query.q || "").trim().toUpperCase();
  if (!q) return res.json([]);

  const matches = nifty500.filter(t => t.includes(q));
  res.json(matches);
});

// SCREEN – raw list (frontend will filter)
app.get("/api/screen", async (req, res) => {
  try {
    const data = await getAllStocks();
    res.json(Object.values(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Screening failed" });
  }
});

// VERDICT – simple example
app.get("/api/verdict", async (req, res) => {
  const t = (req.query.q || "").trim().toUpperCase();
  if (!t) return res.status(400).json({ error: "Missing ticker" });

  const data = await fetchStock(t);
  if (!data) return res.status(404).json({ error: "Not found" });

  const verdict = data.p > data.h * 0.8 ? "Expensive" : "Reasonable";

  res.json({
    ticker: t,
    verdict,
    price: data.p,
    high52: data.h,
    low52: data.l
  });
});

// CHECKLIST – simple example
app.get("/api/checklist", async (req, res) => {
  const t = (req.query.q || "").trim().toUpperCase();
  if (!t) return res.status(400).json({ error: "Missing ticker" });

  const data = await fetchStock(t);
  if (!data) return res.status(404).json({ error: "Not found" });

  const checklist = {
    above200dma: false, // placeholder
    above50dma: false,  // placeholder
    lowDebt: data.de < 1,
    goodROE: data.roe > 8,
    healthyCR: data.cr > 1
  };

  res.json({ ticker: t, checklist });
});

// ALL STOCKS
app.get("/api/stocks", async (req, res) => {
  try {
    const extra = req.query.extra
      ? req.query.extra.split(",").map(s => s.trim().toUpperCase())
      : [];

    const data = await getAllStocks(extra);
    res.json(Object.values(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

// SINGLE STOCK
app.get("/api/stock", async (req, res) => {
  const t = (req.query.ticker || "").trim().toUpperCase();
  if (!t) return res.status(400).json({ error: "Missing ticker" });

  const data = await fetchStock(t);
  if (!data) return res.status(404).json({ error: "Not found" });

  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
