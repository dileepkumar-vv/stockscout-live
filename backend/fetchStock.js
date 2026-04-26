const fetch = require("node-fetch");
const sectors = require("./sectors.json");

async function fetchStock(ticker) {
  const symbol = `${ticker}.NS`;

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
    symbol
  )}`;

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        Accept: "application/json,text/plain,*/*",
        Connection: "keep-alive",
        Referer: "https://finance.yahoo.com/"
      },
      timeout: 8000
    });

    if (!resp.ok) {
      console.log("Yahoo rejected:", ticker, resp.status);
      return null;
    }

    const data = await resp.json();
    const r = data.quoteResponse?.result?.[0];
    if (!r) {
      console.log("No quote data for:", ticker);
      return null;
    }

    const price = r.regularMarketPrice ?? 0;
    const high = r.fiftyTwoWeekHigh ?? 0;
    const low = r.fiftyTwoWeekLow ?? 0;

    const pct = v =>
      typeof v === "number" ? Math.round(v * 100) : 0;

    const mcCr =
      typeof r.marketCap === "number"
        ? Math.round(r.marketCap / 10000000)
        : 0;

    // Yahoo quote endpoint doesn’t expose all fundamentals;
    // we keep placeholders where needed.
    return {
      t: ticker,
      n: r.longName || r.shortName || ticker,
      p: price,
      h: high,
      l: low,
      de: 0,          // placeholder – not in quote endpoint
      pr: 0,          // promoter holding – not available
      pl: 0,          // pledged – not available
      rg: 0,          // revenue growth – not available
      roe: 0,         // ROE – not available
      mc: mcCr,
      cr: 0,          // current ratio – not available
      s: sectors[ticker] || "Unknown"
    };
  } catch (e) {
    console.log("Fetch error:", ticker, e.message);
    return null;
  }
}

module.exports = fetchStock;
