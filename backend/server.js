const express = require("express");
const cors = require("cors");
const fetchStock = require("./fetchStock");
const nifty500 = require("./nifty500.json");

const app = express();
app.use(cors());

let cache = {};
let cacheTime = 0;

app.get("/api/test", (req, res) => {
  res.json({ status: "ok" });
});

async function getAllStocks(extraTickers = []) {
  const now = Date.now();

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

app.get("/api/search", (req, res) => {
  const q = (req.query.q || "").trim().toUpperCase();
  if (!q) return res.json([]);
  const matches = nifty500.filter(t => t.includes(q));
  res.json(matches);
});

app.get("/api/screen", async (req, res) => {
  try {
    const data = await getAllStocks();
    res.json(Object.values(data));
  } catch (e) {
    console.error("Screen error:", e);
    res.status(500).json({ error: "Screening failed" });
  }
});

app.get("/api/stocks", async (req, res) => {
  try {
    const extra = req.query.extra
      ? req.query.extra.split(",").map(s => s.trim().toUpperCase())
      : [];
    const data = await getAllStocks(extra);
    res.json(Object.values(data));
  } catch (e) {
    console.error("Stocks error:", e);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/stock", async (req, res) => {
  const t = (req.query.ticker || "").trim().toUpperCase();
  if (!t) return res.status(400).json({ error: "Missing ticker" });

  const data = await fetchStock(t);
  if (!data) return res.status(404).json({ error: "Not found" });

  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
