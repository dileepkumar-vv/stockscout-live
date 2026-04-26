const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fetchStock = require("./fetchStock");
const nifty = require("./nifty500.json");

const app = express();
app.use(cors());

app.get("/api/test", (req, res) => {
  res.json({ status: "ok" });
});

// GLOBAL SEARCH (raw AlphaVantage)
app.get("/api/global", async (req, res) => {
  const q = (req.query.ticker || req.query.q || "").trim().toUpperCase();
  if (!q) return res.status(400).json({ error: "Missing ticker" });

  const API = process.env.ALPHA_KEY;

  try {
    const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${q}&apikey=${API}`;
    const search = await fetch(searchUrl).then(r => r.json());

    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${q}.NS&apikey=${API}`;
    const quote = await fetch(quoteUrl).then(r => r.json());

    res.json({ input: q, search, quote });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SINGLE STOCK
app.get("/api/stock", async (req, res) => {
  const t = (req.query.ticker || req.query.q || "").trim().toUpperCase();
  if (!t) return res.status(400).json({ error: "Missing ticker" });

  const data = await fetchStock(t);
  if (!data) return res.status(404).json({ error: "Not found" });

  res.json(data);
});

// SCREENER
app.get("/api/screen", async (req, res) => {
  const results = [];

  for (const t of nifty) {
    const data = await fetchStock(t);
    if (data) results.push(data);
  }

  res.json(results);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on", PORT));
