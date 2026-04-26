const fetch = require("node-fetch");
const sectors = require("./sectors.json");

const API = process.env.ALPHA_KEY;

async function alpha(functionName, params) {
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", functionName);
  url.searchParams.set("apikey", API);

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const resp = await fetch(url.toString());
  return resp.json();
}

async function fetchStock(ticker) {
  const symbol = `${ticker}.NS`;

  try {
    // 1. GLOBAL QUOTE (price)
    const quote = await alpha("GLOBAL_QUOTE", { symbol });

    // 2. OVERVIEW (fundamentals)
    const overview = await alpha("OVERVIEW", { symbol });

    if (!quote["Global Quote"] || !overview.Symbol) {
      return null;
    }

    return {
      t: ticker,
      n: overview.Name || ticker,
      p: Number(quote["Global Quote"]["05. price"] || 0),
      h: Number(overview["52WeekHigh"] || 0),
      l: Number(overview["52WeekLow"] || 0),
      de: Number(overview["DebtToEquity"] || 0),
      pr: 0,
      pl: 0,
      rg: Number(overview["QuarterlyRevenueGrowthYOY"] || 0),
      roe: Number(overview["ReturnOnEquityTTM"] || 0),
      mc: Number(overview["MarketCapitalization"] || 0),
      cr: Number(overview["CurrentRatio"] || 0),
      s: sectors[ticker] || overview.Sector || "Unknown"
    };

  } catch (e) {
    console.log("Alpha error:", e.message);
    return null;
  }
}

module.exports = fetchStock;
