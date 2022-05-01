const {Client, Intents} = require('discord.js');
const config = require('../config.json');
const {loadCommands, loadEventHandlers} = require('./utils/loader');
const intents = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_VOICE_STATES,
];
const discordClient = new Client({intents});

loadCommands(discordClient);
loadEventHandlers(discordClient);

discordClient.login(config.DISCORD_TOKEN);
