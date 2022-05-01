const config = require('../../config.json');

const channelSwap = async (interaction) => {
  const adminRole = config.DISCORD_ADMIN_ROLE;
  const member = interaction.member;
  const memberRoles = member._roles;
  if (!memberRoles.some((role) => role === adminRole)) {
    await interaction.reply('You do not have permission to drag');
    return;
  }
  voiceStateUpdate(interaction);
};

const voiceStateUpdate = async (interaction) => {
  const user = interaction.member.user;
  interaction.client.once('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.id !== user.id) {
      console.log('Not the person, so looking again');
      voiceStateUpdate(interaction);
      return;
    }

    if (oldState.channelId != null &&
        newState.channelId != null &&
        oldState.channelId !== newState.channelId) {
      const voiceStates = interaction.guild.voiceStates.cache;
      const allMembers = await interaction.member.guild.members.fetch();
      const filteredVoiceStates = new Map(
          [...voiceStates]
              .filter(([k, v]) => v.channelId == oldState.channelId));
      try {
        for (const [key] of (filteredVoiceStates)) {
          const member = allMembers.get(key);
          member.voice.setChannel(newState.channelId);
        }
      } catch (exception) {
        console.log('Error trying to move user:', exception);
      }
    }
  });
};

module.exports = channelSwap;
