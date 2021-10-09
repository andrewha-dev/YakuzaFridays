const config = require('../config.json');
const defaultTextChannel = config.DISCORD_YAKUZA_FRIDAY_CHANNEL_ID;
const usersToTag = config.FRIDAY_NIGHTERS;
const yakuzaAccount = config.YAKUZA_FRIDAY_ACCOUNT_ID;
const customAccount = config.CUSTOM_ACCOUNT_ID;

let isAlreadyPlayed = true;

const yakuzaFriday = async (twitterClient, discordClient) => {
  const parameters = {
    follow: `${yakuzaAccount},${customAccount}`,
  };

  initPlayMusicOnJoin(discordClient);

  twitterClient.stream('statuses/filter', parameters)
      .on('start', (response) => console.log('Connected to Twitter!'))
      .on('data', (tweet) => handleTweet(tweet, discordClient))
  //   .on('ping', () => console.log('ping'))
      .on('error', (error) => console.log('error', error));
  //   .on('end', (response) => console.log('end'));
};

const handleTweet = async (tweet, discordClient) => {
  if (!isReply(tweet) && tweet.id_str && tweet.user) {
    const channelToSend = await discordClient.channels.fetch(defaultTextChannel);

    const username = tweet.user.screen_name;
    const tweetId = tweet.id_str;

    const statusUrl = generateTweetUrl(username, tweetId);
    const discordMessage = generateMessage(statusUrl);
    isAlreadyPlayed = false;
    channelToSend.send(discordMessage);
  }
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

const generateMessage = (tweetUrl) => {
  let generatedMessage = 'Hey, ';
  usersToTag.forEach((user) => {
    generatedMessage +=`<@${user.discordId}>, `;
  });

  generatedMessage += 'you know what today is!\n';
  generatedMessage += tweetUrl;

  return generatedMessage;
};

const initPlayMusicOnJoin = async (discordClient) => {
  discordClient.on('voiceStateUpdate', async (oldState, newState) => {
    const user = newState.guild.member(newState.id);
    const userId = user.id;

    const isUserInList = usersToTag.some((jsonElement) => jsonElement.discordId === userId);
    // Meaning person joins the Discord
    if (oldState.channelID == null && newState.channelID != null &&
      isUserInList && !isAlreadyPlayed) {
      isAlreadyPlayed = true;
      playSong(discordClient, newState.channelID);
    }
  });
};

const playSong = async (discordClient, channelToJoin) => {
  const channelResource = await discordClient.channels.fetch(channelToJoin);
  const connection = await channelResource.join();
  const dispatcher = connection.play('./music/Shawn-Michaels-Sexy-Boy-WWE.mp3');

  dispatcher.on('start', () => {
    console.log('Friday Night is now playing!');
  });

  dispatcher.on('finish', () => {
    console.log('Friday Night has finished playing!');
    channelResource.leave();
  });

  dispatcher.on('error', console.error);
};

module.exports = yakuzaFriday;
