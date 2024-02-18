require('dotenv').config();
import { Client, VoiceState, VoiceChannel } from 'discord.js';

// Main Function \\

interface DBFunctions {
    connectToMongoDB: () => Promise<void>;
    getCollectionData: (collectionName: string) => Promise<any>;
    addCreatedChannel: (collectionName: string, channelId: string) => Promise<void>;
    removeCreatedChannel: (collectionName: string, channelId: string) => Promise<void>;
};


module.exports = async (client: Client, config: any, db: DBFunctions) => {
    const guildId = config.guildId as string;
    const createdChannels: string[] = await db.getCollectionData('channelsData');
    const createVoiceCategoryIds = config.createVoice.categoryIds, createVoiceChannelIds = config.createVoice.channelIds;
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

                    await db.addCreatedChannel('channelsData', channel.id);
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
                        await db.removeCreatedChannel('channelsData', channel.id);
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
                createdChannels.splice(i, 1);
                await db.removeCreatedChannel('channelsData', channel.id);
            }
        }
    });
};