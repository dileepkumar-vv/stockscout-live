const cors = require("cors");
app.use(cors());
const express = require("express");
const cors = require("cors");
const fetchStock = require("./fetchStock");
const nifty500 = require("./nifty500.json");

const app = express();
const PORT = 3000;

app.use(cors());

let cache = {};
let cacheTime = 0;

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

app.get("/api/stocks", async (req, res) => {
  try {
    const extra = req.query.extra
      ? req.query.extra.split(",").map(s => s.trim().toUpperCase())
      : [];
    const data = await getAllStocks(extra);
    res.json(Object.values(data));
  } catch (e) {
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

app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
