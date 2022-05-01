const {yakuzaFridayMessage} = require('../libraries/yakuzaFridayLib');

module.exports = {
  name: 'ready',
  once: true,
  async execute(discordClient) {
    const build = '2.0.1';
    console.log('Build:', build);
    console.log(`Ready! Logged in as ${discordClient.user.tag}`);
    // Initiate Yakuza Fridays
    await yakuzaFridayMessage(discordClient);
  },
};
