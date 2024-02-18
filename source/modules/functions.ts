import { GuildMemberRoleManager } from 'discord.js';
const config = require('../../config.json');

// Roles Authorization \\

const authorized = async (roles: GuildMemberRoleManager) => {
    for (const role of config.permissionRoles) {
        if (roles.cache.some(r => r.id === role)) {
            return true;
        };
    };
};

// Mongo DB \\

import { MongoClient } from 'mongodb';

interface DBFunctions {
    connectToMongoDB: () => Promise<void>;
    getCollectionData: (collectionName: string) => Promise<any>;
    addCreatedChannel: (collectionName: string, channelId: string) => Promise<void>;
    removeCreatedChannel: (collectionName: string, channelId: string) => Promise<void>;
};

require('dotenv').config();
const mongoClient = new MongoClient(process.env.mongoURI as string), db = {} as DBFunctions;

db.connectToMongoDB = async () => {
    try {
        await mongoClient.connect();
    } catch (error) {
        console.error('Could not connect to MongoDB:', error);
    }
};

const database = config.mongo.database;
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

module.exports = { authorized, db, config };