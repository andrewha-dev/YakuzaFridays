const {SlashCommandBuilder} = require('@discordjs/builders');
const channelSwap = require('../libraries/channelSwapLib');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('d')
      .setDescription('Drag members members of your current channel to the next one you join!'),
  async execute(interaction) {
    await interaction.reply('Waiting for you to move channels');
    await channelSwap(interaction);
  },
};
