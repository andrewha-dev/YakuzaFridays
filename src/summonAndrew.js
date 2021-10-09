const config = require('../config.json');
const guildId = config.DISCORD_GUILD_ID;
const andrewDiscordId = config.DISCORD_FIRST_USER_TO_TAG;
const afkChannelId = config.DISCORD_AFK_CHANNEL_ID;
const approvedSummoners = config.SUMMONERS;

const {getRandomElementFromArray} = require('./common');

const prefix = '.summon';

const summonAndrew = async (client) => {
  client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
      return;
    };

    const userId = message.author.id;
    const messageChannel = message.channel;

    // Check if theyre allowed to move me
    // Only Myself, Brett, Emily, Logan, Yaro
    const isInApprovedSummoners = approvedSummoners.some((discordId) => discordId == userId);

    let responseMessage = '';
    if (!isInApprovedSummoners) {
      responseMessage = getRandomElementFromArray(responses['summonerNoPermission']);
      message.channel.send(responseMessage);
      return;
    }

    const guild = client.guilds.cache.get(guildId);
    const memberCollection = await guild.members.fetch();

    const summoner = memberCollection.get(userId);
    const summonerVoiceState = summoner.voice;

    const summonerUsername = summoner.nickname ? summoner.nickname : summoner.user.username;

    const summonee = memberCollection.get(andrewDiscordId);
    const summoneeVoiceState = summonee.voice;

    if (!summoneeVoiceState.channelID) {
      responseMessage = getRandomElementFromArray(responses['andrewNotPresent']);
      responseMessage += '\nI\'ve sent Andrew a message letting him know you requested him';
      responseMessage += '\nNothing to do now except to wait...';

      sendMessageToSummonee(summonee, summonerUsername);
      messageChannel.send(responseMessage);
      return;
    }

    if (!summonerVoiceState.channelID) {
      responseMessage = getRandomElementFromArray(responses['summonerNotPresent']);
      responseMessage += '\nAction Required: Get in a Discord voice channel (not AFK)';
      messageChannel.send(responseMessage);
      return;
    }

    if (summonerVoiceState.channelID == afkChannelId) {
      responseMessage = getRandomElementFromArray(responses['summonerNotPresent']);
      responseMessage += '\nAction Required: Get out of AFK';
      messageChannel.send(responseMessage);
      return;
    }

    // If summoner is Muted or Deafened
    if (summonerVoiceState.selfDeaf || summonerVoiceState.selfMute) {
      responseMessage = getRandomElementFromArray(responses['summonerNotPresent']);
      responseMessage += '\nAction Required: Unmute/Undeafen yourself';
      messageChannel.send(responseMessage);
      return;
    }


    if (summonerVoiceState.channelID == summoneeVoiceState.channelID) {
      responseMessage = getRandomElementFromArray(responses['sameChannel']);
      messageChannel.send(responseMessage);
      return;
    }

    if (summoneeVoiceState.channelID == afkChannelId) {
      responseMessage = getRandomElementFromArray(responses['andrewNotPresent']);
      responseMessage += '\nAndrew is currently in the AFK channel so he cannot be summoned';
      responseMessage += '\nI\'ve sent Andrew a message letting him know you requested him';
      responseMessage += '\nNothing to do now except to wait...';

      sendMessageToSummonee(summonee, summonerUsername);
      messageChannel.send(responseMessage);
      return;
    }

    if (summoneeVoiceState.selfDeaf || summoneeVoiceState.selfMute) {
      responseMessage = getRandomElementFromArray(responses['andrewNotPresent']);
      responseMessage += '\nAndrew is currently muted/deafened so he cannot be summoned';
      responseMessage += '\nI\'ve sent Andrew a message letting him know you requested him';
      responseMessage += '\nNothing to do now except to wait...';
      messageChannel.send(responseMessage);

      sendMessageToSummonee(summonee, summonerUsername);
      return;
    }

    // Now we move myself to whichever channel they in
    // Check if they are in a voice channel
    summoneeVoiceState.setChannel(summonerVoiceState.channelID).catch((err) => {
      console.log('Error moving summonee to channel:', err);
    });
  });
};

const sendMessageToSummonee = (summonee, summonerUsername) => {
  summonee.send(`${summonerUsername} has requested you`);
};

const responses = {
  summonerNoPermission: [
    'You do not have permission to summon the wise Andrew',
    'You have no power here!',
    'Muggles trying to use magic, smh',
    'He does not acknowledge your presence',
  ],
  summonerNotPresent: [
    'Your presence is needed first',
    'You must first pay your respects',
    'Yo, you good? You must be here to summon me',
    'Summoning requires a human sacrifice',
    'Why aren\'t you available ?',
    'There are so many ways to fuck up, this shouldn\'t be one of them...',
    'Try again...',
    'You\'re not doing this right',
  ],
  andrewNotPresent: [
    'Andrew is currently busy delivering tofu on Mt. Akina, sorry!',
    'God Emperor Andrew is currently not here right now',
    'Andrew is currently busy malding over school assignments, sorry!',
    'Andrew\'s presence is elsewhere',
    'My Fish is drowning, but I will be back soon! - Andrew',
    'He\'s busy smoking up or smth idk... but he sure ain\'t here',
    'Hello, I have received your summon. Unfortunately, I am currently out of office. Please try again later. - Andrew',
    '"Hey man, I\'m busy right now man" - Andrew',
    'Andrew is busy watching pr0n or smth',
  ],
  sameChannel: [
    'You guys are already in the same channel...',
    'You had one job...',
    'What a waste of a summon...',
    'Why are you summoning me?',
    'Bruh... you guys are already in the same channel',
  ],
};


module.exports = summonAndrew;
