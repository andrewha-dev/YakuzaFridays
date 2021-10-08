const config = require('../config.json');
const defaultTextChannel = config.DISCORD_YAKUZA_FRIDAY_ID;
const usersToTag = config.FRIDAY_NIGHTERS;

const yakuzaFriday = async (twitterClient, discordClient) => {
  const parameters = {
    follow: '',
  };

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

module.exports = yakuzaFriday;
