const nseFetch = require("./nseClient");

async function fetchStock(ticker) {
  ticker = ticker.trim().toUpperCase();

  const url = `https://www.nseindia.com/api/quote-equity?symbol=${ticker}`;
  const data = await nseFetch(url);

  if (!data || !data.info) return null;

  return {
    t: ticker,
    n: data.info.companyName || ticker,
    p: Number(data.priceInfo.lastPrice || 0),
    h: Number(data.priceInfo.weekHighLow?.max || 0),
    l: Number(data.priceInfo.weekHighLow?.min || 0),
    mc: Number(data.priceInfo.marketCap || 0),
    s: data.metadata?.industry || "Unknown",
    de: 0,
    pr: 0,
    pl: 0,
    rg: 0,
    roe: 0,
    cr: 0
  };
}

module.exports = fetchStock;
