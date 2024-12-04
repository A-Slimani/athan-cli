# ATHAN CLI 
A simple terminal application that tells the athan time based of current geolocation

## Setup
### Windows
- Install the python libraries with the command `pip -r requirements.txt`
- Open up terminal profile with `notepad $PROFILE` then add the following
```
function athan {
    python "/your/athan/directory/here" $args
}
```
## Commands
- `athan` - tells the next prayer time
- `athan --all` - Shows all the prayer times for the day (including sunrise)
