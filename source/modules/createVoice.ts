require('dotenv').config();
import { MongoClient } from 'mongodb';
import { Client, VoiceState, VoiceChannel } from 'discord.js';

// Mongo DB Handling \\

const mongoClient = new MongoClient(process.env.mongoURI as string);
const connectToMongoDB = async () => {
    try {
        await mongoClient.connect();
    } catch (error) {
        console.error('Could not connect to MongoDB:', error);
    }
};

let database = '', collection = '';
const addCreatedChannel = async (channelId: string) => {
    const collection = mongoClient.db(database).collection('channelsData');
    await collection.insertOne({ channelId });
};
  
const removeCreatedChannel = async (channelId: string) => {
    const collection = mongoClient.db(database).collection('channelsData');
    await collection.deleteOne({ channelId });
};
  
const getCreatedChannels = async () => {
    const collection = mongoClient.db(database).collection('channelsData');
    const channels = await collection.find({}).toArray();
    return channels.map(doc => doc.channelId);
};

// Main Function \\

module.exports = async (client: Client, config: any) => {
    database = config.mongo.database, collection = config.mongo.collection;
    await connectToMongoDB();
    const guildId = process.env.guildId as string;
    const createdChannels: string[] = await getCreatedChannels();
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

                    await addCreatedChannel(channel.id);
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
                        await removeCreatedChannel(channel.id);
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
                await removeCreatedChannel(channel.id);
            }
        }
    });
};