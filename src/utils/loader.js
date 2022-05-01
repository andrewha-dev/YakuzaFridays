const fs = require('node:fs');
const {Collection} = require('discord.js');

const loadCommands = (discordClient) => {
  discordClient.commands = new Collection();
  const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    discordClient.commands.set(command.data.name, command);
  }

  discordClient.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = discordClient.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }
  });
};

const loadEventHandlers = (discordClient) => {
  const eventFiles = fs.readdirSync('./src/events').filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
      discordClient.once(event.name, (...args) => event.execute(...args));
    } else {
      discordClient.on(event.name, (...args) => event.execute(...args));
    }
  }
};

module.exports = {
  loadCommands,
  loadEventHandlers,
};
