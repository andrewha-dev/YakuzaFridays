const channelLog = require('../libraries/channelLogLib');
const {yakuzaFridayMusic} = require('../libraries/yakuzaFridayLib');

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState) {
    await channelLog(oldState, newState);
    await yakuzaFridayMusic(oldState, newState);
  },
};
