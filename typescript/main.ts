import { getLocationInfo, cachedDataCheck, getAthanTimes, calculateAthanTimes, getAllAthanTimes } from './athan-functions';
import os from 'os';
import fs from 'fs';
import path from 'path';

const locationCached: string = path.join(os.tmpdir(), 'location.json');
const athanCached: string = path.join(os.tmpdir(), 'athan.json');

async function main() {
  // check the cached data of if the file exists
  if (!cachedDataCheck(locationCached) || !fs.existsSync(locationCached)) await getLocationInfo(locationCached);
  if (!cachedDataCheck(athanCached) || !fs.existsSync(athanCached)) await getAthanTimes(locationCached, athanCached);

  // pass through arguments
  const args = process.argv.slice(2);
  if (args[0] === '--all') {
    await getAllAthanTimes(athanCached);
  } else {
    await calculateAthanTimes(athanCached)
  }
  process.exit(0);
}

main();