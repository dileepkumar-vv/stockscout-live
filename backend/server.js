const express = require("express");
const cors = require("cors");
const fetchStock = require("./fetchStock");
const nseFetch = require("./nseClient");

const app = express();
app.use(cors());

let cache = {};
let cacheTime = 0;

app.get("/api/test", (req, res) => {
  res.json({ status: "ok" });
});

// GLOBAL SEARCH
app.get("/api/global", async (req, res) => {
  const q = (req.query.ticker || req.query.q || "").trim().toUpperCase();
  if (!q) return res.status(400).json({ error: "Missing ticker" });

  const url = `https://www.nseindia.com/api/search/autocomplete?q=${q}`;
  const search = await nseFetch(url);

  const quote = await fetchStock(q);

  res.json({ input: q, search, quote });
});

// SINGLE STOCK
app.get("/api/stock", async (req, res) => {
  const t = (req.query.ticker || "").trim().toUpperCase();
  if (!t) return res.status(400).json({ error: "Missing ticker" });

  const data = await fetchStock(t);
  if (!data) return res.status(404).json({ error: "Not found" });

  res.json(data);
});

// SCREEN (NIFTY 500)
app.get("/api/screen", async (req, res) => {
  const now = Date.now();

  if (now - cacheTime < 10 * 60 * 1000 && Object.keys(cache).length) {
    return res.json(Object.values(cache));
  }

  const url = `https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500`;
  const data = await nseFetch(url);

  if (!data || !data.data) return res.status(500).json({ error: "NSE error" });

  const results = {};

  for (const s of data.data) {
    results[s.symbol] = {
      t: s.symbol,
      n: s.symbol,
      p: s.lastPrice,
      h: s.weekHighLow?.max,
      l: s.weekHighLow?.min,
      mc: s.marketCap,
      s: s.industry || "Unknown",
      de: 0,
      pr: 0,
      pl: 0,
      rg: 0,
      roe: 0,
      cr: 0
    };
  }

  cache = results;
  cacheTime = now;

  res.json(Object.values(results));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
