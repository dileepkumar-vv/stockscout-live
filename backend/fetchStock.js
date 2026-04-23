const fetch = require("node-fetch");

async function fetchStock(ticker) {
  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}.NS?modules=price,summaryDetail,defaultKeyStatistics,financialData`;

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!resp.ok) {
      console.log("Yahoo rejected:", ticker);
      return null;
    }

    const data = await resp.json();

    if (!data.quoteSummary || !data.quoteSummary.result) {
      console.log("Invalid Yahoo data:", ticker);
      return null;
    }

    const r = data.quoteSummary.result[0];

    const pct = v => (typeof v === "number" ? Math.round(v * 100) : 0);
    const cr = v => (typeof v === "number" ? Math.round(v / 10000000) : 0);

    return {
      t: ticker,
      n: r.price.longName || ticker,
      p: r.price.regularMarketPrice?.raw || 0,
      h: r.summaryDetail.fiftyTwoWeekHigh?.raw || 0,
      l: r.summaryDetail.fiftyTwoWeekLow?.raw || 0,
      de: r.defaultKeyStatistics.debtToEquity?.raw || 0,
      pr: pct(r.defaultKeyStatistics.heldPercentInsiders?.raw),
      pl: 0,
      rg: pct(r.financialData.revenueGrowth?.raw),
      roe: pct(r.financialData.returnOnEquity?.raw),
      mc: cr(r.price.marketCap?.raw)
    };
  } catch (e) {
    console.log("Fetch error:", ticker, e);
    return null;
  }
}

module.exports = fetchStock;
