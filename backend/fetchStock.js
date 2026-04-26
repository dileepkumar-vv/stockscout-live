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
  ticker = ticker.trim().toUpperCase();

  const NSE = `${ticker}.NSE`;
  const BSE = `${ticker}.BSE`;

  try {
    // 1) Try NSE first (will fail in free tier)
    let quote = await td("/quote", { symbol: NSE });

    // 2) If NSE fails, fallback to BSE
    if (!quote || quote.code) {
      quote = await td("/quote", { symbol: BSE });
    }

    // 3) If both fail → no data
    if (!quote || quote.code || !quote.symbol) {
      return null;
    }

    return {
      t: ticker,
      n: quote.name || ticker,
      p: Number(quote.close || 0),
      h: Number(quote.fifty_two_week?.high || 0),
      l: Number(quote.fifty_two_week?.low || 0),
      mc: Number(quote.market_cap || 0),
      de: 0,
      pr: 0,
      pl: 0,
      rg: 0,
      roe: 0,
      cr: 0,
      s: quote.exchange || "BSE"
    };

  } catch (e) {
    console.log("TwelveData error:", e.message);
    return null;
  }
}

module.exports = fetchStock;
