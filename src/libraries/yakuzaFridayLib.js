const {AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} = require('@discordjs/voice');
const config = require('../../config.json');
const {shuffle} = require('../utils/common');
const cron = require('node-cron');
const guildId = config.DISCORD_GUILD_ID;
const defaultTextChannel = config.DISCORD_YAKUZA_FRIDAY_CHANNEL_ID;
// const defaultTextChannel = '967660869922213898';
const yakuzaRole = config.DISCORD_YAKUZA_FRIDAY_ROLE;
const firstUserToTag = config.DISCORD_FIRST_USER_TO_TAG;

let alreadyPlayed = [];

const yakuzaFridayMusic = async (oldState, newState) => {
  const today = new Date();
  if (today.getDay() !== 5) {
    return;
  }

  if (!newState.channel || newState.selfDeaf || newState.selfMute || newState.selfVideo || newState.streaming) {
    return;
  }

  const member = oldState.member;
  const userId = oldState.id;
  const memberRoles = member._roles;

  if (memberRoles.some((role) => role === yakuzaRole) &&
      !alreadyPlayed.some((playedId) => playedId === userId)) {
    // Play music
    alreadyPlayed.push(member.user.id);
    await playMusic(newState);
  }
};

const yakuzaFridayMessage = async (discordClient) => {
  cron.schedule('0 10 * * 5', async () => {
    alreadyPlayed = [];
    await sendMessage(discordClient);
  });
};

const sendMessage = async (discordClient) => {
  const channelToSend = await discordClient.channels.fetch(defaultTextChannel);
  const usersToTag = await generateUsers(discordClient);
  const discordMessage = generateMessage(usersToTag);
  await channelToSend.send({
    content: discordMessage,
    files: [
      './videos/Friday_Night.mp4',
    ],
  });
  const otherDiscordMessage = 'Also don\'t forget your daily dose of Kelp!';
  await channelToSend.send({
    content: otherDiscordMessage,
    files: [
      './videos/Kelp.mp4',
    ],
  });
};

const generateMessage = (usersInRole) => {
  let generatedMessage = `Hey, `;
  usersInRole.forEach((userId) => {
    generatedMessage += `<@${userId}>, `;
  });
  generatedMessage += 'you know what today is!\n';
  generatedMessage += 'Friday at last...';

  return generatedMessage;
};

const generateUsers = async (discordClient) => {
  const guilds = discordClient.guilds.cache;
  const guild = await guilds.get(guildId);
  const members = await guild.members.fetch();
  const memberIds = [];

  members.forEach((member) => {
    if (member._roles.some((role) => role == yakuzaRole)) {
      memberIds.push(member.user.id);
    }
  });

  // Lets randomize it every week!
  shuffle(memberIds);

  // Modified members ... Always put a certain user first :)
  const modifiedMemberIds = [firstUserToTag, ...memberIds.filter((item) => item !== firstUserToTag)];
  return modifiedMemberIds;
};

const playMusic = async (newState) => {
  const connection = joinVoiceChannel({
    channelId: newState.channel.id,
    guildId: guildId,
    adapterCreator: newState.guild.voiceAdapterCreator,
  });
  const player = createAudioPlayer();
  const resource = createAudioResource('./music/Friday_Night.mp3');
  player.play(resource);
  connection.subscribe(player);
  player.on(AudioPlayerStatus.Playing, () => {
    console.log('The audio player has started playing!');
  }).on(AudioPlayerStatus.Idle, () => {
    player.stop();
    connection.destroy();
  }).on('error', (error) => {
    console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
  });
};

module.exports = {
  yakuzaFridayMessage,
  yakuzaFridayMusic,
};
