const fetch = require("node-fetch");
const sectors = require("./sectors.json");

const API = process.env.TWELVE_KEY;
const BASE = "https://api.twelvedata.com";

async function td(path, params) {
  const url = new URL(BASE + path);
  url.searchParams.set("apikey", API);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const r = await fetch(url.toString());
  return r.json();
}

async function fetchStock(ticker) {
  const symbol = `${ticker}.NSE`;

  try {
    // 1) Price + 52W high/low, volume, etc.
    const quote = await td("/quote", { symbol });

    if (!quote || quote.code || !quote.symbol) {
      return null;
    }

    // TwelveData doesn’t give all fundamentals we had before,
    // but we map what’s available and keep the structure.
    return {
      t: ticker,
      n: quote.name || ticker,
      p: Number(quote.close || 0),
      h: Number(quote.fifty_two_week.high || 0),
      l: Number(quote.fifty_two_week.low || 0),
      de: 0,   // not directly available – keep 0 or later compute from another source
      pr: 0,
      pl: 0,
      rg: 0,
      roe: 0,
      mc: Number(quote.market_cap || 0),
      cr: 0,
      s: sectors[ticker] || quote.exchange || "Unknown"
    };

  } catch (e) {
    console.log("TwelveData error:", e.message);
    return null;
  }
}

module.exports = fetchStock;
