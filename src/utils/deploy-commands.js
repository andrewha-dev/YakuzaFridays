const {SlashCommandBuilder} = require('@discordjs/builders');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const config = require('../../config.json');

const clientId = config.DISCORD_CLIENT_ID;
const token = config.DISCORD_TOKEN;
const guildId = config.DISCORD_GUILD_ID;

const fs = require('node:fs');


const commands = [];
const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({version: '9'}).setToken(token);

// Deletes all commands
// rest.get(Routes.applicationGuildCommands(clientId, guildId))
//     .then((data) => {
//       const promises = [];
//       for (const command of data) {
//         const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`;
//         promises.push(rest.delete(deleteUrl));
//       }
//       return Promise.all(promises);
//     });

// console.log('Deleted Commands');


// Updates new commands
// rest.put(Routes.applicationGuildCommands(clientId,
//     guildId), {body: commands})
//     .then(() => console.log('Successfully registered application commands.'))
//     .catch(console.error);


