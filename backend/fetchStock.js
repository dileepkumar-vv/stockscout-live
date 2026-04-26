async function fetchStock(ticker) {
  const primary = `${ticker}.NSE`;
  const fallback = `${ticker}.NS`;

  try {
    let quote = await td("/quote", { symbol: primary });

    // If primary fails, try fallback
    if (!quote || quote.code) {
      quote = await td("/quote", { symbol: fallback });
    }

    if (!quote || quote.code || !quote.symbol) {
      return null;
    }

    return {
      t: ticker,
      n: quote.name || ticker,
      p: Number(quote.close || 0),
      h: Number(quote.fifty_two_week?.high || 0),
      l: Number(quote.fifty_two_week?.low || 0),
      de: 0,
      pr: 0,
      pl: 0,
      rg: 0,
      roe: 0,
      mc: Number(quote.market_cap || 0),
      cr: 0,
      s: quote.exchange || "NSE"
    };

  } catch (e) {
    console.log("TwelveData error:", e.message);
    return null;
  }
}
