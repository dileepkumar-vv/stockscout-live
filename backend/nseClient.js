const fetch = require("node-fetch");

const NSE_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Accept": "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.nseindia.com/",
  "Cache-Control": "no-cache"
};

async function nseFetch(url) {
  try {
    const res = await fetch(url, { headers: NSE_HEADERS });
    return await res.json();
  } catch (err) {
    console.log("NSE fetch error:", err.message);
    return null;
  }
}

module.exports = nseFetch;
