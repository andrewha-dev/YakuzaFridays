const config = require('../config.json');
const {shuffle} = require('./common');
const cron = require('node-cron');
const guildId = config.DISCORD_GUILD_ID;
const defaultTextChannel = config.DISCORD_YAKUZA_FRIDAY_CHANNEL_ID;
// const defaultTextChannel = '898576989785567303';
const yakuzaRole = config.DISCORD_YAKUZA_FRIDAY_ROLE;
const firstUserToTag = config.DISCORD_FIRST_USER_TO_TAG;
const yakuzaAccount = config.YAKUZA_FRIDAY_ACCOUNT_ID;
const customAccount = config.CUSTOM_ACCOUNT_ID;

let BACKUP_PLAN = true;

const yakuzaFriday = async (twitterClient, discordClient) => {
  const parameters = {
    follow: `${yakuzaAccount},${customAccount}`,
  };

  const fridayNighters = {};
  const usersToTag = generateUsers(discordClient);

  // Initialize to current users in role
  initUsers(fridayNighters, usersToTag, true);
  initPlayMusicOnJoin(discordClient, fridayNighters);

  // eslint-disable-next-line no-unused-vars
  const stream = twitterClient.stream('statuses/filter', parameters)
      .on('start', (response) => console.log('Connected to Twitter!'))
      .on('data', (tweet) => handleTweet(tweet, discordClient, fridayNighters))
      .on('ping', () => console.log('Twitter Stream: Ping'))
      .on('error', (error) => console.log('Twitter Stream Error:', error))
      .on('end', (response) => console.log('end'));

  cron.schedule('0 10 * * 5', async () => {
    if (BACKUP_PLAN) {
      await sendFridayMessage(discordClient, fridayNighters);
    }
  });
};

const sendFridayMessage = async (discordClient, fridayNighters) => {
  const channelToSend = await discordClient.channels.fetch(defaultTextChannel);
  const usersToTag = generateUsers(discordClient);
  const discordMessage = generateMessageNew(usersToTag);
  initUsers(fridayNighters, usersToTag, false);
  channelToSend.send(discordMessage, {
    files: [
      './videos/Friday_Night.mp4',
    ],
  });
  setExpire(fridayNighters, usersToTag);
};


const handleTweet = async (tweet, discordClient, fridayNighters) => {
  if (tweet.user && tweet.user.screen_name ==' YakuzaFriday') {
    console.log(tweet);
  }
  if (!isReply(tweet)) {
    console.log(tweet);
  }
  if (!isReply(tweet) && tweet.id_str && tweet.user) {
    BACKUP_PLAN = false;
    const channelToSend = await discordClient.channels.fetch(defaultTextChannel);

    const username = tweet.user.screen_name;
    const tweetId = tweet.id_str;

    const statusUrl = generateTweetUrl(username, tweetId);
    const usersToTag = generateUsers(discordClient);
    const discordMessage = generateMessage(statusUrl, usersToTag);
    initUsers(fridayNighters, usersToTag, false);
    channelToSend.send(discordMessage);
    setExpire(fridayNighters, usersToTag);
  }
};

const initUsers = (fridayNighters, usersToTag, isAlreadyPlayed) => {
  const currDate = new Date();
  console.log('Init Users Before:', currDate.toDateString(), currDate.toLocaleTimeString());
  console.log(fridayNighters, '\n');
  // We first want to clear all the users
  const currUsers = Object.keys(fridayNighters);
  currUsers.forEach((user) => delete fridayNighters[user]);
  // Now we add current list of users
  usersToTag.forEach((user) => {
    fridayNighters[user] = isAlreadyPlayed;
  });

  console.log('Init Users After:', currDate.toDateString(), currDate.toLocaleTimeString());
  console.log(fridayNighters, '\n');
};

const setExpire = (fridayNighters, usersToTag) => {
  // 16 hours
  const timeout = 1000 * 60 * 60 * 16;
  setTimeout(() => {
    BACKUP_PLAN = true;
    initUsers(fridayNighters, usersToTag, true);
  }, timeout);
};

const isReply = (tweet) => {
  if (tweet.retweeted_status ||
      tweet.in_reply_to_status_id ||
      tweet.in_reply_to_status_id_str ||
      tweet.in_reply_to_user_id ||
      tweet.in_reply_to_user_id_str ||
      tweet.in_reply_to_screen_name) {
    return true;
  }
  return false;
};

const generateTweetUrl = (username, statusId) => {
  return `https://twitter.com/${username}/status/${statusId}`;
};

const generateMessage = (tweetUrl, usersInRole) => {
  let generatedMessage = `Hey, `;
  usersInRole.forEach((userId) => {
    generatedMessage += `<@${userId}>, `;
  });
  generatedMessage += 'you know what today is!\n';
  generatedMessage += tweetUrl;

  return generatedMessage;
};

const generateMessageNew = (usersInRole) => {
  let generatedMessage = `Hey, `;
  usersInRole.forEach((userId) => {
    generatedMessage += `<@${userId}>, `;
  });
  generatedMessage += 'you know what today is!\n';
  generatedMessage += 'Friday at last...';

  return generatedMessage;
};

const generateUsers = (discordClient) => {
  const guild = discordClient.guilds.cache.get(guildId);
  const roleMemberCollection = guild.roles.cache.get(yakuzaRole).members;
  const memberIds = [];
  roleMemberCollection.forEach((member) => {
    memberIds.push(member.id);
  });

  // Lets randomize it every week!
  shuffle(memberIds);

  // Modified members ... Always put a certain user first :)
  const modifiedMemberIds = [firstUserToTag, ...memberIds.filter((item) => item !== firstUserToTag)];
  return modifiedMemberIds;
};

const initPlayMusicOnJoin = async (discordClient, fridayNighters) => {
  discordClient.on('voiceStateUpdate', async (oldState, newState) => {
    const user = newState.guild.member(newState.id);
    const userId = user.id;
    const usersToTag = generateUsers(discordClient);
    const isUserInList = usersToTag.some((userInList) => userInList === userId);
    // Meaning person joins the Discord
    if (oldState.channelID == null && newState.channelID != null &&
      isUserInList && !fridayNighters[userId]) {
      fridayNighters[userId] = true;
      // If someone else joins at the same time the song is playing, their turn will be wasted
      playSong(discordClient, newState.channelID);
      const currDate = new Date();
      console.log('Song Played:', currDate.toDateString(), currDate.toLocaleTimeString());
      console.log(fridayNighters, '\n');
    }
  });
};

const playSong = async (discordClient, channelToJoin) => {
  const channelResource = await discordClient.channels.fetch(channelToJoin);
  const connection = await channelResource.join();
  const dispatcher = await connection.play('./music/Friday_Night.mp3');

  dispatcher.on('start', () => {
    console.log('Friday Night is now playing!');
  });

  dispatcher.on('finish', () => {
    console.log('Friday Night has finished playing!');
    channelResource.leave();
  });

  dispatcher.on('error', (err) => console.error('Error while trying to enjoy Friday', err));
};

module.exports = yakuzaFriday;
