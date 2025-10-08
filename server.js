const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PRICE_URLS, VERIFY_SERVICE_URL } = require('./environment');
const app = express();
const port = 8080;

const LOG_FILE_PATH = path.join(__dirname, 'check-price-logs.txt');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFile(LOG_FILE_PATH, logEntry, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
}

async function fetchPriceViaVerifyService() {
  for (const getPriceUrl of PRICE_URLS) {
    const verifyUrl = `${VERIFY_SERVICE_URL}/verify-price-error?targetUrl=${encodeURIComponent(getPriceUrl)}`;

    try {
      logToFile(`Calling verify service with target: ${getPriceUrl}`);
      const res = await axios.get(verifyUrl);
      const data = res.data;

      logToFile(`Response from verify service: ${JSON.stringify(data)}`);

      if (!data.hasError) {
        return data;
      }
    } catch (err) {
      logToFile(`Error calling verify service for ${getPriceUrl}: ${err.message}`);
    }
  }

  logToFile(`All verify attempts failed. Returning fallback.`);
  return { totalPrice: "0.00", hasError: true };
}

app.get('/check-price', async (req, res) => {
  const result = await fetchPriceViaVerifyService();
  res.json(result);
});

app.listen(port, () => {
  logToFile(`check-price service started on port ${port}`);
  console.log(`check-price service running at http://localhost:${port}`);
});
