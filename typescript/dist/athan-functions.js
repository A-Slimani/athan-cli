"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachedDataCheck = cachedDataCheck;
exports.getLocationInfo = getLocationInfo;
exports.getAthanTimes = getAthanTimes;
exports.calculateAthanTimes = calculateAthanTimes;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
function cachedDataCheck(cachedFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
        if (fs_1.default.existsSync(cachedFile)) {
            const fileData = fs_1.default.readFileSync(cachedFile, 'utf8');
            const cachedData = JSON.parse(fileData);
            if (Date.now() - cachedData.timestamp < ONE_WEEK) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    });
}
function getLocationInfo(locationCache) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://ipinfo.io');
            const responseData = response.data;
            const updatedLocation = {
                city: responseData.city,
                region: responseData.region,
                country: responseData.country,
                loc: responseData.loc,
                timestamp: Date.now()
            };
            fs_1.default.writeFileSync(locationCache, JSON.stringify(updatedLocation));
            return updatedLocation;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    });
}
function getAthanTimes(locationCache, athanCache) {
    return __awaiter(this, void 0, void 0, function* () {
        const locationData = JSON.parse(fs_1.default.readFileSync(locationCache, 'utf8'));
        const [lat, long] = locationData.loc.split(',');
        const url = `http://api.aladhan.com/v1/calendar`;
        const params = {
            "latitude": lat,
            "longitude": long,
            "method": 3,
            "month": new Date().getMonth() + 1,
            "year": new Date().getFullYear(),
        };
        const response = yield axios_1.default.get(url, { params });
        const items = response.data.data;
        fs_1.default.writeFileSync(athanCache, JSON.stringify(items));
    });
}
function calculateAthanTimes(cachePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // load timings from cache
            const timingData = JSON.parse(fs_1.default.readFileSync(cachePath, 'utf8'));
            // filter which times I want to display
            const timingsFilter = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const timingsFilterWithSunrise = ['Sunrise', ...timingsFilter];
            // get the timings for today
            const today = new Date().getDate();
            const todayTimings = timingData[today - 1].timings;
            const filteredTimings = Object.keys(todayTimings)
                .filter(key => timingsFilter.includes(key))
                .reduce((obj, key) => {
                obj[key] = todayTimings[key].slice(0, 5);
                return obj;
            }, {});
            const filteredTimingsWithSunrise = Object.keys(todayTimings)
                .filter(key => timingsFilterWithSunrise.includes(key))
                .reduce((obj, key) => {
                obj[key] = todayTimings[key].slice(0, 5);
                return obj;
            }, {});
            const current = new Date();
            const [currentMinutes, currentHours] = [current.getMinutes(), current.getHours()];
            const currentTime = currentHours * 60 + currentMinutes;
            let prayerTimeOutput = '';
            for (const timing in filteredTimingsWithSunrise) {
                if (filteredTimingsWithSunrise.hasOwnProperty(timing)) {
                    const [prayerHours, prayerMinutes] = filteredTimingsWithSunrise[timing].split(':');
                    const prayerTime = parseInt(prayerHours) * 60 + parseInt(prayerMinutes);
                    if (currentTime < prayerTime) {
                        prayerTimeOutput = `Next prayer is ${timing} at ${filteredTimingsWithSunrise[timing]}`;
                        break;
                    }
                }
            }
            if (prayerTimeOutput === '') {
                `Next prayer is ${filteredTimingsWithSunrise[0]} at ${filteredTimingsWithSunrise['Fajr']}`;
            }
            console.log(prayerTimeOutput);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    });
}
