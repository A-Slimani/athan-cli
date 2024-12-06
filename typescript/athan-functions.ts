import { Location } from './types/Location';
import { AthanTimes } from './types/AthanTimes';  
import axios from 'axios';
import fs from 'fs';

export async function cachedDataCheck(cachedFile: string): Promise<boolean> {
  const ONE_WEEK: number = 1000 * 60 * 60 * 24 * 7;
  if (fs.existsSync(cachedFile)) {
    const fileData = fs.readFileSync(cachedFile, 'utf8');
    const cachedData = JSON.parse(fileData);
    if (Date.now() - cachedData.timestamp < ONE_WEEK) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export async function getLocationInfo(locationCache: string): Promise<Location> {
  try {
    const response = await axios.get('https://ipinfo.io');
    const responseData: any = response.data;
    const updatedLocation = {
      city: responseData.city,
      region: responseData.region,
      country: responseData.country,
      loc: responseData.loc,
      timestamp: Date.now()
    };
    fs.writeFileSync(locationCache, JSON.stringify(updatedLocation));
    return updatedLocation;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function getAthanTimes(locationCache: string, athanCache: string) {
  const locationData: Location = JSON.parse(fs.readFileSync(locationCache, 'utf8'));
  const [lat, long] = locationData.loc.split(',');

  const url: string = `http://api.aladhan.com/v1/calendar`
  const params = {
    "latitude": lat,
    "longitude": long,
    "method": 3,
    "month": new Date().getMonth() + 1,
    "year": new Date().getFullYear(),
  }
  const response: any = await axios.get(url, { params });
  const items: any = response.data.data

  fs.writeFileSync(athanCache, JSON.stringify(items));
}

export async function calculateAthanTimes(cachePath: string) {
  try {

    // load timings from cache
    const timingData: any = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    // filter which times I want to display
    const timingsFilter: string[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    const timingsFilterWithSunrise: string[] = ['Sunrise', ...timingsFilter]

    // get the timings for today
    const today: number = new Date().getDate();
    const todayTimings: any = timingData[today - 1].timings;

    // will want to remove this ensure I dont need it 
    // const filteredTimings: AthanTimes = Object.keys(todayTimings)
    //   .filter(key => timingsFilter.includes(key))
    //   .reduce((obj: any, key: string) => {
    //     obj[key] = todayTimings[key].slice(0, 5);
    //     return obj;
    //   }, {});

    const filteredTimingsWithSunrise: AthanTimes = Object.keys(todayTimings)
      .filter(key => timingsFilterWithSunrise.includes(key))
      .reduce((obj: any, key: string) => {
        obj[key] = todayTimings[key].slice(0, 5);
        return obj;
      }, {});

    const current = new Date()
    const [currentMinutes , currentHours] = [current.getMinutes(), current.getHours()]
    const currentTime = currentHours * 60 + currentMinutes;

    let prayerTimeOutput = ''
    for (const timing  in filteredTimingsWithSunrise) {
      if (filteredTimingsWithSunrise.hasOwnProperty(timing)) {
        const [prayerHours, prayerMinutes] = (filteredTimingsWithSunrise[timing] as string).split(':') 
        const prayerTime = parseInt(prayerHours) * 60 + parseInt(prayerMinutes)
        if (currentTime < prayerTime) {
          prayerTimeOutput = `Next prayer is ${timing} at ${filteredTimingsWithSunrise[timing]}`;
          break;
        }
      }
    }
    if (prayerTimeOutput === '') {
      `Next prayer is ${filteredTimingsWithSunrise[0]} at ${filteredTimingsWithSunrise['Fajr']}` 
    }
    console.log(prayerTimeOutput)

  } catch (error) {
    console.error(error);
    throw error;
  }
}
