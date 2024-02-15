import { Client, VoiceState, VoiceChannel } from 'discord.js';

interface ENV {
    token: string;
    guildId: string;
    createVoiceChannelId: string;
    createVoiceCategoryId: string;
};

const createdChannels: string[] = [];

module.exports = async (client: Client, env: ENV) => {
    const guildId = env.guildId, createVoiceChannelId = env.createVoiceChannelId;

    client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
        if (newState.channelId === createVoiceChannelId && newState.guild.id === guildId) {
            try {
                const channel = await newState.guild.channels.create({
                    name: `${newState.member?.user.username}`,
                    type: 2,
                    parent: env.createVoiceCategoryId
                });

                if (newState.member && channel instanceof VoiceChannel) {
                    await newState.member.voice.setChannel(channel);
                }
                createdChannels.push(channel.id);
            } catch (error) {
                console.error('Failed to create voice channel or move the member:', error);
            }
        }

        if (oldState.channelId && createdChannels.includes(oldState.channelId)) {
            const channel = oldState.channel;
            if (channel && channel.members.size === 0) {
                await channel.delete().then(() => {
                    const index = createdChannels.indexOf(channel.id);
                    if (index > -1) {
                        createdChannels.splice(index, 1);
                    }
                }).catch(console.error);
            }
        }
    });
};
