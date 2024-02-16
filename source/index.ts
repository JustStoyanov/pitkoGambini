const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});
module.exports = client;

// Bot Loading \\

import { ActivityType } from 'discord.js';
client.once('ready', () => {
    client.user.setStatus('dnd');
    client.user.setUsername('Pitko Gambini');
    client.user.setActivity('Competing on Grove Street', { type: ActivityType.Custom });
});

// Modules Loading \\

require('dotenv').config();
const env = process.env, asciiTable = require('ascii-table'), fs = require('fs'), colors = require('colors');

const loadModules = () => {
    const modulesTable = new asciiTable().setHeading('Module', 'Status');
    fs.readdirSync('./dist/modules').forEach((module: string) => {
        if (module.endsWith('.ts') || module.endsWith('.js')) {
            modulesTable.addRow(module, `✅ ${colors.green('Success')}`);
            require(`./modules/${module}`)(client);
        } else {
            modulesTable.addRow(module, `❌ ${colors.red('Failed')}`);
        };
    });
    console.log(modulesTable.toString());
};
loadModules();

client.login(env.token);