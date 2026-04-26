const fetch = require("node-fetch");
const sectors = require("./sectors.json");

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE = "https://finnhub.io/api/v1";

async function callFinnhub(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set("token", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Finnhub error ${resp.status}`);
  return resp.json();
}

async function fetchStock(ticker) {
  const symbol = `${ticker}.NS`;

  try {
    const quote = await callFinnhub("/quote", { symbol });
    const profile = await callFinnhub("/stock/profile2", { symbol });
    const metrics = await callFinnhub("/stock/metric", {
      symbol,
      metric: "all"
    });

    const m = metrics.metric || {};

    return {
      t: ticker,
      n: profile.name || ticker,
      p: quote.c || 0,
      h: m["52WeekHigh"] || 0,
      l: m["52WeekLow"] || 0,
      de: m.totalDebtToEquity || 0,
      pr: 0,
      pl: 0,
      rg: m.revenueGrowth3Y || 0,
      roe: m.roeTTM || 0,
      mc: profile.marketCapitalization || 0,
      cr: m.currentRatioAnnual || 0,
      s: sectors[ticker] || profile.finnhubIndustry || "Unknown"
    };
  } catch (e) {
    console.log("Fetch error for", ticker, e.message);
    return null;
  }
}

module.exports = fetchStock;
