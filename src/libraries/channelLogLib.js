const config = require('../../config.json');
const defaultTextChannel = config.DISCORD_CHANNEL_LOG_ID;

const channelLog = async (oldState, newState) => {
  const userId = oldState.id;

  const username = retrieveUsername(userId, newState);
  const channelToSend = oldState.guild.channels.cache.get(defaultTextChannel);
  const message = generateMessage(username, oldState, newState);
  if (message) {
    await channelToSend.send(message);
  }
};

const generateMessage = (username, oldState, newState) => {
  let message = '';
  const d = new Date();
  if (oldState.channelId == null && newState.channelId != null) {
    const newChannel = newState.guild.channels.cache.get(newState.channelId);
    message = `[${d.toLocaleTimeString()} - EST] **${username}** joined **${newChannel.name}**`;
  } else if (oldState.channelId != null && newState.channelId == null) {
    message = `[${d.toLocaleTimeString()} - EST] **${username}** has left the server`;
  } else if (oldState.channelId != null && newState.channelId != null &&
          (oldState.channelId !== newState.channelId)) {
    const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
    const newChannel = newState.guild.channels.cache.get(newState.channelId);
    message = `[${d.toLocaleTimeString()} - EST] **${username}** ` +
        `switched from **${oldChannel.name}** to **${newChannel.name}**`;
  }
  return message;
};

const retrieveUsername = (userId, oldState) => {
  const users = oldState.guild.members.cache;
  const user = users.get(userId);
  if (user.nickname) {
    return user.nickname;
  };

  return user.user.username;
};

module.exports = channelLog;
