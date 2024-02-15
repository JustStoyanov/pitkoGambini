import { Client, VoiceState, VoiceChannel } from 'discord.js';

interface ENV {
    token: string;
    guildId: string;
};

const createdChannels: string[] = [];

const createVoiceCategoryIds = [
    {
        id: '1207698127549632523',
        userLimit: 5
    },
    {
        id: '1207739820554715258',
        userLimit: 2
    }
];
const createVoiceChannelIds = ['1207635841145376788', '1207739885646123078'];

module.exports = async (client: Client, env: ENV) => {
    const guildId = env.guildId;
    console.log('Create Voice module loaded!');
    
    client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
        for (let i = 0; i < createVoiceChannelIds.length; i++) {
            if (newState.channelId === createVoiceChannelIds[i] && newState.guild.id === guildId) {
                try {
                    const channel = await newState.guild.channels.create({
                        name: `${newState.member?.user.username}`,
                        type: 2,
                        parent: createVoiceCategoryIds[i].id,
                        userLimit: createVoiceCategoryIds[i].userLimit
                    });

                    if (newState.member && channel instanceof VoiceChannel) {
                        await newState.member.voice.setChannel(channel);
                    }
                    createdChannels.push(channel.id);
                } catch (error) {
                    console.error('Failed to create voice channel or move the member:', error);
                }
            }
        };

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
