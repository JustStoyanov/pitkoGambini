const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.GuildMember]
});
module.exports = client, client.commands = new Collection();

require('dotenv').config();
const config = require('../config.json');

// Bot Loading \\

import { ActivityType } from 'discord.js';
client.once('ready', () => {
    client.user.setStatus('dnd');
    client.user.setUsername('Pitko Gambini');
    client.user.setActivity('Competing on Grove Street', { type: ActivityType.Custom });
});

// Mongo DB Connection \\

import { MongoClient } from 'mongodb';

interface DBFunctions {
    connectToMongoDB: () => Promise<void>;
    getCollectionData: (collectionName: string) => Promise<any>;
    addCreatedChannel: (collectionName: string, channelId: string) => Promise<void>;
    removeCreatedChannel: (collectionName: string, channelId: string) => Promise<void>;
};

const mongoClient = new MongoClient(process.env.mongoURI as string), db = {} as DBFunctions;

db.connectToMongoDB = async () => {
    try {
        await mongoClient.connect();
    } catch (error) {
        console.error('Could not connect to MongoDB:', error);
    }
};

const database = config.mongo.database, collection = config.mongo.collection;
db.getCollectionData = async (collectionName: string) => {
    const collection = mongoClient.db(database).collection(collectionName);
    const channels = await collection.find({}).toArray();
    return channels.map(doc => doc.channelId);
};

db.addCreatedChannel = async (collectionName: string, channelId: string) => {
    const collection = mongoClient.db(database).collection(collectionName);
    await collection.insertOne({ channelId });
};
  
db.removeCreatedChannel = async (collectionName: string, channelId: string) => {
    const collection = mongoClient.db(database).collection(collectionName);
    await collection.deleteOne({ channelId });
};

// Modules Loading \\

const asciiTable = require('ascii-table'), fs = require('fs'), colors = require('colors');
const loadModules = async () => {
    const modulesTable = new asciiTable().setHeading('Module', 'Status');
    fs.readdirSync('./dist/modules').forEach((module: string) => {
        if (module.endsWith('.ts') || module.endsWith('.js')) {
            modulesTable.addRow(module, `✅ ${colors.green('Success')}`);
            require(`./modules/${module}`)(client, config, db);
        } else {
            modulesTable.addRow(module, `❌ ${colors.red('Failed')}`);
        };
    });

    try {
        await db.connectToMongoDB();
        modulesTable.addRow('MongoDB', `✅ ${colors.green('Success')}`);
    } catch (error) {
        modulesTable.addRow('MongoDB', `❌ ${colors.red('Failed')}`);
        console.error('Could not connect to MongoDB:', error);
    };

    console.log(modulesTable.toString());
};
loadModules();
client.login(process.env.token);