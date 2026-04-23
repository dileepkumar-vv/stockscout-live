StockScout Live

A mobile‑first stock screener designed for simplicity, speed, and clarity.  
Built with:

- Node.js + Express backend  
- Mobile‑first frontend (TradingView‑style UI)  
- Dark/Light theme toggle  
- NIFTY 500 universe + custom tickers  
- Yahoo Finance live data (unofficial)  
- No database required  

---

📁 Project Structure

`
stockscout-live/
  backend/
    server.js
    fetchStock.js
    package.json
    nifty500.json
  frontend/
    index.html
    assets/
      styles.css
      app.js
  run.sh
  start.bat
  .gitignore
`

---

🚀 Running the Project

Windows
`
start.bat
`

Linux / Mac / Android (Termux)
`
./run.sh
`

Backend runs at:
`
http://localhost:3000
`

Frontend:
- Open frontend/index.html directly in your browser  
- Or serve it using any static server (optional)

---

📡 API Endpoints

GET /api/stocks
Fetches all NIFTY 500 stocks + custom tickers.

GET /api/stock?ticker=TCS
Fetches a single stock.

---

📱 Features

✔ Mobile‑first UI
- Bottom navigation  
- Swipe‑friendly filters  
- Card‑based stock layout  
- Sticky header  
- Smooth transitions  

✔ Dark/Light theme toggle
Stored in localStorage.

✔ Watchlist
Add custom NSE tickers (e.g., IIFL, PAYTM).

✔ Screening engine
Filters by:
- ROE  
- Debt/Equity  
- Market Cap  

✔ Score system
Ranks stocks based on fundamentals.

---

🛠 Requirements

- Node.js 16+  
- Browser (Chrome recommended)

---

🌐 Deployment

You can deploy the backend to:
- Render  
- Railway  
- Vercel (serverless)  
- AWS / Azure / GCP  

Frontend can be deployed to:
- GitHub Pages  
- Netlify  
- Vercel  

---

🧩 Optional Enhancements

- Add charts (TradingView widget)  
- Add P/E, PEG, FCF, promoter holding  
- Add sector filters  
- Add export to CSV  
- Add login + cloud watchlist  
- Add PWA support (installable app)  

---

📝 License

Free for personal and educational use.
`

---

🧭 How to Upload This to GitHub

1. Go to github.com/new
2. Create a repo named stockscout-live
3. Do NOT initialize with README (you already have one)
4. After creation:
   - Click Add file → Upload files
   - Drag the entire folder structure:
     `
     backend/
     frontend/
     run.sh
     start.bat
     .gitignore
     README.md
     `
5. Commit changes
6. GitHub will automatically show a Download ZIP button

You now have a fully downloadable ZIP version of your project.

---

📱 How to Run on Android (Termux)

1. Install Termux  
2. Run:
   `
   pkg install nodejs
   `
3. Navigate to your project folder:
   `
   cd stockscout-live
   `
4. Start backend:
   `
   ./run.sh
   `
5. Open Chrome → type:
   `
   http://localhost:3000
   `
6. Open frontend/index.html from your file manager

---

💻 How to Run on Windows

1. Install Node.js  
2. Open the project folder  
3. Double‑click:
   `
   start.bat
   `
4. Open frontend/index.html

---

🍎 How to Run on Mac

`
chmod +x run.sh
./run.sh
`

Open frontend/index.html.
