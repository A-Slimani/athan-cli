#!/usr/bin/env python3

from argparse import ArgumentParser, Namespace
from datetime import time, datetime, timedelta
from requests_cache import CachedSession
from prettytable import PrettyTable
import platform

# geolocation handling
ds = platform.system()
addr = '/tmp/athan-loc' if ds == 'Linux' else 'C:\\Windows\\Temp\\athan-loc'
session = CachedSession(cache_name=addr, expire_after=86400)  # after one day
response = session.get('https://ipinfo.io')
data = response.json()
loc = data['loc'].split(',')
lat, long = loc[0], loc[1]

# athan api handling section
url = f'http://api.aladhan.com/v1/timings?latitude={lat}&longitude={long}&method=3'
addr = '/tmp/athan-times' if ds == 'Linux' else 'C:\\Windows\\Temp\\athan-times'
session = CachedSession(cache_name=addr, expire_after=86400)  # after one day
response = session.get(url)

prayer_times, all_prayer_times = [], []

if response.status_code == 200:
    data = response.json()
    timings = data.get('data', {}).get('timings', {})

    prayer_list = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    all_prayer_list = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    for k, v in timings.items():
        if k in prayer_list:
            prayer_times.append({k: datetime.strptime(v, "%H:%M").time()})
        if k in all_prayer_list:
            all_prayer_times.append({k: datetime.strptime(v, "%H:%M").time()})
else:
    print('failed http request: ', url)


# calculate which prayer is next
current_time: time = datetime.now().time()
next_prayer_obj, prev_prayer_obj = {}, {}

for i in range(len(prayer_times)):
    if current_time < list(prayer_times[i].values())[0]:
        next_prayer_obj = prayer_times[i]
        prev_prayer_obj = prayer_times[i - 1]
        break

if next_prayer_obj == {}:
    next_prayer_obj = prayer_times[0]
    prev_prayer_obj = prayer_times[-1]

next_prayer_name = list(next_prayer_obj.keys())[0]
next_prayer_time = list(next_prayer_obj.values())[0]
prev_prayer_name = list(prev_prayer_obj.keys())[0]

td: timedelta
nt = datetime.combine(datetime.min, next_prayer_time)
ct = datetime.combine(datetime.min, current_time)
if ct > nt:
    td = datetime.combine(datetime(1, 1, 2), next_prayer_time) - datetime.combine(datetime.min, current_time)
else:
    td = datetime.combine(datetime.min, next_prayer_time) - datetime.combine(datetime.min, current_time)

sr = int(td.total_seconds())
hours = sr // 3600
minutes = (sr % 3600) // 60

st = datetime.combine(datetime.min, list(all_prayer_times[1].values())[0])
next_prayer_str = f"Currently {prev_prayer_name} time. " if ct < st else ""
next_prayer_str += f"Next prayer is {next_prayer_name} at {next_prayer_time.strftime('%H:%M')} "
if hours > 0:
    next_prayer_str += f"in {hours} hours and {minutes} minutes."
else:
    next_prayer_str += f"in {minutes} minutes."

# get all athan times and other relevant info
athan_table = PrettyTable()
athan_table.field_names = ["Athan", "Time"]
athan_table.align["Athan"] = "l"
for prayer in all_prayer_times:
    row = list(prayer.keys())
    row.append(list(prayer.values())[0].strftime("%H:%M"))
    athan_table.add_row(row)


# Parser section
parser = ArgumentParser()

parser.add_argument('athan', help='gives the next athan time', action='store_true')
parser.add_argument('--all', '-a', help='gives all athan and relevant times', action='store_true')
# find a way to get pass through city and country
parser.add_argument('--country', '-c', help='Select Country to get athan times', action='store_true')

args: Namespace = parser.parse_args()

if args.all:
    print(athan_table)
else:
    print(next_prayer_str)
