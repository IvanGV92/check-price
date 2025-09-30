const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001;

const PRICE_URLS = [
  'http://localhost:3000/get-price',
  'http://localhost:3002/get-price',
  'http://localhost:3003/get-price'
];

const MAX_ATTEMPTS_PER_URL = 3;

async function fetchPriceFromUrls() {
  for (const url of PRICE_URLS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_URL; attempt++) {
      try {
        console.log(`Trying ${url} (Attempt ${attempt})`);
        const res = await axios.get(url);
        const data = res.data;

        if (!data.hasError) {
          return data;
        }
      } catch (err) {
        console.error(`Error calling ${url}:`, err.message);
        break; // Skip to next URL if unreachable
      }
    }
  }

  // If all attempts failed
  return { totalPrice: "0.00", hasError: true };
}

app.get('/check-price', async (req, res) => {
  const result = await fetchPriceFromUrls();
  res.json(result);
});

app.listen(port, () => {
  console.log(`Multi-retry service running at http://localhost:${port}`);
});
