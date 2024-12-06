import { getLocationInfo, cachedDataCheck, getAthanTimes, calculateAthanTimes, /* calculateAthanTimes */ } from './athan-functions';
import os from 'os';
import path from 'path';

const locationCached: string = path.join(os.tmpdir(), 'location.json');
const athanCached: string = path.join(os.tmpdir(), 'athan.json');

async function main() {
  // check the cached data
  if (!await cachedDataCheck(locationCached)) getLocationInfo(locationCached);
  if (!await cachedDataCheck(athanCached)) getAthanTimes(locationCached, athanCached);

  // pass through arguments
  const args = process.argv.slice(2);
  // check the argument strings see if they are valid
  // --all -> this will show a table of all the athan times
  calculateAthanTimes(athanCached)
}

main();