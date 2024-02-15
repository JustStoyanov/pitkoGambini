import { Client, VoiceState, VoiceChannel } from 'discord.js';

interface ENV {
    token: string;
    guildId: string;
};

const fs = require('fs');

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
    const createdChannels: string[] = JSON.parse(fs.readFileSync('./source/modules/createdChannels.json'))
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

                    fs.writeFileSync('./source/modules/createdChannels.json', JSON.stringify(createdChannels));
                } catch (error) {
                    console.error('Failed to create voice channel or move the member:', error);
                }
            }
        }

        for (let i = 0; i < createdChannels.length; i++) {
            if (oldState.channelId === createdChannels[i] && oldState.guild.id === guildId) {
                const channel = oldState.guild.channels.cache.get(createdChannels[i]) as VoiceChannel;
                if (channel && channel.members.size === 0) {
                    try {
                        await channel.delete();
                        createdChannels.splice(i, 1);
                        fs.writeFileSync('./source/modules/createdChannels.json', JSON.stringify(createdChannels));
                    } catch (error) {
                        console.error('Failed to delete voice channel:', error);
                    }
                }
            }
        }
    });

    client.once('ready', async () => {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.error('Guild not found');
            return;
        }

        for (let i = createdChannels.length - 1; i >= 0; i--) {
            const channel = guild.channels.cache.get(createdChannels[i]) as VoiceChannel;
            if (channel && channel.members.size === 0) {
                await channel.delete();
                createdChannels.splice(i, 1);  // Safe to remove while iterating backwards
            }
        }        

        fs.writeFileSync('./source/modules/createdChannels.json', JSON.stringify(createdChannels));
    });
};