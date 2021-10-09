const Discord = require('discord.js');
const config = require('../config.json');
const channelLog = require('./channelLog');
const summonAndrew = require('./summonAndrew');
const yakuzaFriday = require('./yakuzaFriday');
const channelSwap = require('./channelSwap');
const discordClient = new Discord.Client();

const Twitter = require('twitter-lite');
const twitterClient = new Twitter({
  consumer_key: config.TWITTER_CONSUMER_KEY,
  consumer_secret: config.TWITTER_CONSUMER_SECRET,
  access_token_key: config.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET,
});

const build = '1.1.0'; // Change with each update
console.log('Build: ' + build);

discordClient.login(config.DISCORD_TOKEN);
discordClient.on('ready', () => {
  console.log(`Logged in as ${discordClient.user.username}!`);

  // Initiate channel log
  channelLog(discordClient);

  // Initiate summon Andrew
  summonAndrew(discordClient);

  // Initiate Yakuza Fridays
  yakuzaFriday(twitterClient, discordClient);

  // Initiate Channel Swap
  channelSwap(discordClient);
});


