const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');

const cachedFilePath = path.join(os.tmpdir(), 'location.json');
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

async function fetchLocationInfo() {
  try {
    const response = await axios.get('https://ipinfo.io');
    const data = response.data;
    const cachedData = {
      city: data.city,
      region: data.region,
      country: data.country,
      loc: data.loc,
      timestamp: Date.now()
    };
    fs.writeFileSync(cachedFilePath, JSON.stringify(cachedData));
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function locationCachedData() {
  let cachedData;
  if (fs.existsSync(cachedFilePath)) {
    const fileData = fs.readFileSync(cachedFilePath, 'utf8');
    cachedData = JSON.parse(fileData);

    if (Date.now() - cachedData.timestamp < ONE_WEEK) {
      console.log('Using cached data');
      return cachedData;
    } else {
      console.log('Cache expired... Fetching new data');
      fetchLocationInfo();
    }
  } else {
    console.log('No cache found... Fetching new data');
    fetchLocationInfo();
  }
}

locationCachedData();
