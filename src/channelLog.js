const config = require('../config.json');
const defaultTextChannel = config.DISCORD_CHANNEL_LOG_ID;

const channelLog = async (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const user = newState.guild.member(newState.id);
    const username = await retrieveUsername(client, user, newState);
    const channelToSend = await client.channels.fetch(defaultTextChannel);
    const message = await generateMessage(client, username, oldState, newState);
    channelToSend.send(message);
  });
};

const generateMessage = async (client, username, oldState, newState) => {
  return new Promise(async (resolve) => {
    const d = new Date();
    if (oldState.channelID == null && newState.channelID != null) {
      const newChannel = await client.channels.fetch(newState.channelID);
      message = `[${d.toLocaleTimeString()} - EST] **${username}** joined **${newChannel.name}**`;
      resolve(message);
    } else if (oldState.channelID != null && newState.channelID == null) {
      message = `[${d.toLocaleTimeString()} - EST] **${username}** has left the server`;
      resolve(message);
    } else if (oldState.channelID != null && newState.channelID != null &&
        (oldState.channelID !== newState.channelID)) {
      const oldChannel = await client.channels.fetch(oldState.channelID);
      const newChannel = await client.channels.fetch(newState.channelID);
      message = `[${d.toLocaleTimeString()} - EST] **${username}** ` +
      ` switched from **${oldChannel.name}** to **${newChannel.name}**`;
      resolve(message);
    }
  });
};

const retrieveUsername = async (client, user, newState) => {
  return new Promise(async (resolve) => {
    let username = user.nickname;
    if (username !== null) {
      resolve(username);
    }
    // Otherwise we need to fetch the username
    const updatedUser = await client.users.fetch(newState.id);
    username = updatedUser.username;
    resolve(username);
  });
};


module.exports = channelLog;
