# BizPro Hub — Business Management

A responsive business dashboard with a Node.js API and JSON-file storage. Includes customer records, manual sales/expense entry, automatic revenue/expense/net-profit calculations, a live chart, CSV export, and an optional OpenAI-powered business assistant.

## Run on Android (Termux) or a computer

1. Install Node.js 18+ and unzip.
2. Open a terminal in this folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000`.

In Termux, you can run:
```bash
pkg update -y
pkg install nodejs-lts unzip -y
termux-setup-storage
cd ~/storage/downloads
unzip BizPro-Hub.zip
cd BizPro-Hub
npm install
npm start
```

## Connect the AI assistant (optional)

The rest of the application works without an AI key. To activate real AI answers:

1. Create an API key in your OpenAI platform account.
2. Copy `.env.example` to `.env`.
3. Put the key after `OPENAI_API_KEY=` and optionally set `OPENAI_MODEL=gpt-4.1-mini`.
4. Restart the server (`Ctrl+C`, then `npm start`).

**Never put the API key in `public/app.js`, HTML, or any file served to the browser.** The server sends requests to OpenAI's Responses API so the key stays on the server. API usage may incur charges depending on your account and model. Do not commit `.env` to GitHub.

## Data and testing

- Customers and transactions are saved in `data/db.json`.
- Sales and expenses recalculate the dashboard totals and chart immediately.
- Add a sale linked to a customer more than once to see returning-customer counts.
- Use Export CSV or Download report to export transaction records.
- Delete controls remove saved records after confirmation.
- Data is stored locally in this project folder. Back up `data/db.json` regularly.
- This is a single-user starter system, not yet a multi-user SaaS. Before public production use, add authentication, role permissions, database backups, HTTPS, and a persistent database. Local JSON storage is not suitable for concurrent multi-user production traffic.
- The AI assistant receives the current business totals and the latest 20 transactions to answer business-specific questions. Avoid storing highly sensitive customer information.

## Contact links

WhatsApp: +256 705 398 480  
Email: emmaamoses00@gmail.com
