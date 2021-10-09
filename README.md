# Yakuza Friday Bot x Channel Logger
## Yakuza Friday Bot
Plays Yakuza 0's Friday everytime you join your Discord server for the first time on a Friday.

### How does it work?
Based off of the Yakuza Friday Twitter Account:
https://twitter.com/YakuzaFriday

Every time the Twitter account tweets, the bot will send the message to a predetermined channel. 
The bot will also tag Discord members who are specified in the config file, letting them know its Friday!

The first time any of the tagged members join the Discord after the @YakuzaFriday tweet, the bot will join and play Friday Night!

## Channel Logger
Sends messages to a specified channel, letting you know which Users left/joined a voice channel in Discord.
Stop dealing with the frustrations of knowing who left/who joined and at what time. Utilizes Discord's `voiceStateUpdate` and logs the result to a specified channel.
## Pre-requisites
1. Docker (Not required, although really helps setup)
2. FFMPEG (if you don't use Docker)
3. .mp3 file you want to use. (ex: Friday_Night.mp3)
## How to use
1. Clone the repository `git clone https://github.com/andrewha-dev/YakuzaFridays.git`
2. Put your own version of the Friday Night into the `music` folder. Rename the file to be `Friday_Night.mp3`
3. Rename `.example.config.js` to `config.js`
4. Fill in all the values for the `config.js` file. Add `1165068053786312704` for `YAKUZA_FRIDAY_ACCOUNT_ID`.
Note that there is a `CUSTOM_ACCOUNT_ID` field. You can add your own custom account to stream tweets from for testing purposes. 
If you choose to leave it blank then you must modify the `follow` variable in `yakuzaFriday.js` from 
```
const parameters = {
    follow: `${yakuzaAccount},${customAccount}`,
};
```

to 

```
const parameters = {
    follow: `${yakuzaAccount}`,
};
```

Also note the following: 
```
"FRIDAY_NIGHTERS": [{"discordUsername": "", "discordId": ""}]`
``` 
`discordUsername` isn't used in the code and just to help visually link ids. While `discordId` is used to tag users.


5. `cd` into main directory and run the command `docker-compose build` and wait the container to build
6. Afterwards, run `docker-compose up` and the bot should start running
7. Run `docker-compose down -v` to stop and remove the container


## Flaws and Limitations
### Yakuza Friday
1. Will destroy ear drums if volume isn't lowered
2. Can only be triggered once per Friday. This means if we have 4 users subscribed to the service. The bot will only join once and play if one of the 4 users join for the first time. This means that subscribed users who don't join on time will "miss" the music functionality of the bot.
3. Highly dependent on @YakuzaFriday on twitter, the reset to play music is dependent on the Tweet getting posted. Tweets are not very consistent either.

### Channel log
1. Removes sense of privacy for users of your server
2. Hidden channels are no longer hidden, as users can see you join/leave them


## Credits
1. Sample mp3 file provided from Bensound 




