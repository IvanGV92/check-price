const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PRICE_URLS } = require('./environment');
const app = express();
const port = 8080;



const MAX_ATTEMPTS_PER_URL = 3;
const LOG_FILE_PATH = 'C:\\check-price-logs.txt';

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFile(LOG_FILE_PATH, logEntry, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
}

async function fetchPriceFromUrls() {
  for (const url of PRICE_URLS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_URL; attempt++) {
      try {
        logToFile(`Trying ${url} (Attempt ${attempt})`);
        const res = await axios.get(url);
        const data = res.data;

        logToFile(`Response from ${url}: ${JSON.stringify(data)}`);

        if (!data.hasError) {
          return data;
        }
      } catch (err) {
        logToFile(`Error calling ${url}: ${err.message}`);
        break; // Skip to next URL if unreachable
      }
    }
  }

  logToFile(`All attempts failed. Returning fallback response.`);
  return { totalPrice: "0.00", hasError: true };
}

app.get('/check-price', async (req, res) => {
  const result = await fetchPriceFromUrls();
  res.json(result);
});

app.listen(port, () => {
  logToFile(`check-price service started on port ${port}`);
  console.log(`check-price service running at http://localhost:${port}`);
});
