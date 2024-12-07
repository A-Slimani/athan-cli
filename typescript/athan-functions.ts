import { Location } from './types/Location';
import { AthanTimes } from './types/AthanTimes';  
import { table } from 'table';
import axios from 'axios';
import fs from 'fs';

export async function cachedDataCheck(cachedFile: string) {
  const ONE_DAY: number = 1000 * 60 * 60 * 24;
  if (fs.existsSync(cachedFile)) {
    const fileData = fs.readFileSync(cachedFile, 'utf8');
    const cachedData = JSON.parse(fileData);
    if (Date.now() - cachedData.timestamp < ONE_DAY) {
      return true;
    } else {
      return false;
    }
  } else {
    await getLocationInfo(cachedFile);
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

  fs.writeFileSync(athanCache, JSON.stringify(items)); // improve this only save the timings
}

export async function calculateAthanTimes(cachePath: string) {
  try {

    // load timings from cache
    const timingData: any = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    // filter which times I want to display
    const timingsFilter: string[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] 

    // get the timings for today
    const today: number = new Date().getDate();
    const todayTimings: any = timingData[today - 1].timings;

    const filteredTimings: AthanTimes = Object.keys(todayTimings)
      .filter(key => timingsFilter.includes(key))
      .reduce((obj: any, key: string) => {
        obj[key] = todayTimings[key].slice(0, 5);
        return obj;
      }, {});

    const current = new Date()
    const [currentMinutes , currentHours] = [current.getMinutes(), current.getHours()]
    const currentTime = currentHours * 60 + currentMinutes;

    let prayerTimeOutput = ''
    for (const timing  in filteredTimings) {
      if (filteredTimings.hasOwnProperty(timing)) {
        const [prayerHours, prayerMinutes] = (filteredTimings[timing] as string).split(':') 
        const prayerTime = parseInt(prayerHours) * 60 + parseInt(prayerMinutes)
        if (currentTime < prayerTime) {
          const timeLeft = prayerTime - currentTime;
          const hoursLeft =  Math.floor(timeLeft / 60);
          const minutesLeft = timeLeft % 60;
          if (hoursLeft === 0 && minutesLeft === 0) {
            prayerTimeOutput = `Time for ${timing} is now at ${filteredTimings[timing]}`;
            break;
          } else if (hoursLeft === 0) {
            prayerTimeOutput = `Next prayer ${timing} in ${minutesLeft} minutes at ${filteredTimings[timing]}`;
            break;
          } else {
            prayerTimeOutput = `Next prayer ${timing} in ${hoursLeft} hours and ${minutesLeft} minutes at ${filteredTimings[timing]}`;
            break;
          } 
        }
      }
    }
    if (prayerTimeOutput === '') prayerTimeOutput = `Next prayer Fajr at ${filteredTimings['Fajr']}` 
    console.log(prayerTimeOutput);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllAthanTimes(cachePath: string) {
  try {
    const timingData: any = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const timingFilter: string[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

    const today: number = new Date().getDate();
    const todayTimings: any = timingData[today - 1].timings;

    const filteredTimings: AthanTimes = Object.keys(todayTimings)
      .filter(key => timingFilter.includes(key))
      .reduce((obj: any, key: string) => {  
        obj[key] = todayTimings[key].slice(0, 5);
        return obj;
      }, {});

    console.log(table(Object.entries(filteredTimings)))
    console.table(Object.entries(filteredTimings))
  } catch (error) {
    console.error(error);
    throw error;
  }
}