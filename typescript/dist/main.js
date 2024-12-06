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
const athan_functions_1 = require("./athan-functions");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const locationCached = path_1.default.join(os_1.default.tmpdir(), 'location.json');
const athanCached = path_1.default.join(os_1.default.tmpdir(), 'athan.json');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // check the cached data
        if (!(yield (0, athan_functions_1.cachedDataCheck)(locationCached)))
            (0, athan_functions_1.getLocationInfo)(locationCached);
        if (!(yield (0, athan_functions_1.cachedDataCheck)(athanCached)))
            (0, athan_functions_1.getAthanTimes)(locationCached, athanCached);
        // pass through arguments
        const args = process.argv.slice(2);
        console.log(args.length);
        if (args.length === 0)
            (0, athan_functions_1.calculateAthanTimes)(athanCached);
    });
}
main();
