const config = require('../config.json');
const guildId = config.DISCORD_GUILD_ID;
const prefix = '.d';

const channelSwap = async (client) => {
  // eslint-disable-next-line no-unused-vars
  let swapInitiated = false;
  // eslint-disable-next-line no-unused-vars
  let swapCompleted = false;
  let currMessage = null;


  client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
      return;
    };

    const userId = message.author.id;
    const guild = client.guilds.cache.get(guildId);
    const memberCollection = await guild.members.fetch();
    const dragger = memberCollection.get(userId);
    currMessage = message;
    // Check if they are in a voice channel
    if (!dragger.voice.channelID) {
      message.channel.send('Must be in a channel to initiate a drag');
      return;
    }

    const adminMembers = guild.roles.cache.get(config.DISCORD_ADMIN_ROLE).members;
    const adminMembersArray = Array.from(adminMembers.keys());

    // Are they an admin or one is already in progress
    if (!adminMembersArray.includes(userId) || swapInitiated) {
      return;
    }

    // Initiate the swap process
    initiateTimer(client, message.channel);
  });

  client.on('voiceStateUpdate', async (oldState, newState) => {
    if (swapInitiated && oldState.channelID != null && newState.channelID == null) {
      swapInitiated = false;
      currMessage.channel.send('Swap cancelled because requester left Discord');
    }

    if (swapInitiated && oldState.channelID != null && newState.channelID != null &&
        (oldState.channelID !== newState.channelID)) {
      const oldChannel = await client.channels.fetch(oldState.channelID);
      try {
        const guild = client.guilds.cache.get(guildId);
        const memberCollection = await guild.members.fetch();
        await initiateSwap(memberCollection, oldChannel.members, newState.channelID);
      } catch (e) {
        console.log(e);
        console.log('Error moving people');
        swapInitiated = false;
        swapCompleted = true;
      }
    }
  });

  const initiateTimer = (client, channel) => {
    channel.send('You have 30 seconds to move to a different channel');
    swapInitiated = true;
    swapCompleted = false;

    setTimeout(() => {
      console.log('Turning off');
      swapInitiated = false;
      if (!swapCompleted) {
        channel.send('Time limit expired. Please re-enter command');
      }
    }, 30000); // After 30 seconds we time out
  };

  const initiateSwap = async (memberCollection, oldChannelMembers, newChannelId) => {
    // console.log(memberCollection);
    oldChannelMembers.forEach(async (member) => {
      const draggee = memberCollection.get(member.user.id);
      const draggeeVoiceState = draggee.voice;
      draggeeVoiceState.setChannel(newChannelId).catch((err) => {
        console.log('Error moving draggee to channel:', err);
      });
    });

    swapInitiated = false;
    swapCompleted = true;
  };
};

module.exports = channelSwap;
