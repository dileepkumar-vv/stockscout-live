const fetch = require("node-fetch");
const sectors = require("./sectors.json");

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE = "https://finnhub.io/api/v1";

if (!API_KEY) {
  console.error("Missing FINNHUB_API_KEY env var");
}

async function callFinnhub(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set("token", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const resp = await fetch(url.toString(), { timeout: 8000 });
  if (!resp.ok) throw new Error(`Finnhub ${path} ${resp.status}`);
  return resp.json();
}

async function fetchStock(ticker) {
  const symbol = `${ticker}.NS`;

  try {
    // 1) Quote (price, 52W high/low via metrics later)
    const quote = await callFinnhub("/quote", { symbol });

    // 2) Profile (name, sector, market cap)
    const profile = await callFinnhub("/stock/profile2", { symbol });

    // 3) Metrics (fundamentals)
    const metrics = await callFinnhub("/stock/metric", {
      symbol,
      metric: "all"
    });

    const m = metrics.metric || {};

    const price = quote.c || 0;
    const high52 = m["52WeekHigh"] || 0;
    const low52 = m["52WeekLow"] || 0;

    const mcCr = profile.marketCapitalization
      ? Math.round(profile.marketCapitalization)
      : 0;

    return {
      t: ticker,
      n: profile.name || ticker,
      p: price,
      h: high52,
      l: low52,
      de: m.totalDebtToEquity || 0,
      pr: 0, // promoter holding not in Finnhub
      pl: 0, // pledged not in Finnhub
      rg: m.revenueGrowth3Y || 0,
      roe: m.roeTTM || 0,
      mc: mcCr,
      cr: m.currentRatioAnnual || 0,
      s: sectors[ticker] || profile.finnhubIndustry || "Unknown"
    };
  } catch (e) {
    console.log("Fetch error for", ticker, e.message);
    return null;
  }
}

module.exports = fetchStock;
