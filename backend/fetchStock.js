const nseFetch = require("./nseClient");
const fetch = require("node-fetch");

async function fetchFundamentals(ticker) {
  try {
    const url = `https://www.screener.in/api/company/${ticker}/`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchStock(ticker) {
  ticker = ticker.trim().toUpperCase();

  // 1) NSE Quote
  const quoteUrl = `https://www.nseindia.com/api/quote-equity?symbol=${ticker}`;
  const quote = await nseFetch(quoteUrl);

  if (!quote || !quote.info) return null;

  // 2) NIFTY 500 Bulk (market cap, sector, 52W)
  const bulkUrl = `https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20500`;
  const bulk = await nseFetch(bulkUrl);

  let bulkData = null;
  if (bulk && bulk.data) {
    bulkData = bulk.data.find(s => s.symbol === ticker);
  }

  // 3) Screener fundamentals
  const fund = await fetchFundamentals(ticker);

  return {
    t: ticker,
    n: quote.info.companyName || ticker,

    // PRICE
    p: Number(
      quote.priceInfo.lastPrice ||
      quote.priceInfo.closePrice ||
      quote.priceInfo.previousClose ||
      0
    ),

    // 52W HIGH / LOW
    h: Number(
      quote.priceInfo.weekHighLow?.max ||
      bulkData?.weekHighLow?.max ||
      0
    ),
    l: Number(
      quote.priceInfo.weekHighLow?.min ||
      bulkData?.weekHighLow?.min ||
      0
    ),

    // MARKET CAP
    mc: Number(
      bulkData?.marketCap ||
      quote.priceInfo.marketCap ||
      0
    ),

    // SECTOR
    s: bulkData?.industry ||
       quote.metadata?.industry ||
       "Unknown",

    // FUNDAMENTALS (from Screener)
    roe: fund?.ratios?.roe || 0,
    de: fund?.ratios?.debt_to_equity || 0,
    cr: fund?.ratios?.current_ratio || 0,
    rg: fund?.growth?.revenue || 0,
    pr: fund?.growth?.profit || 0,
    pl: fund?.ratios?.pledged_percentage || 0
  };
}

module.exports = fetchStock;
