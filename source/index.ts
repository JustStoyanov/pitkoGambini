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

const config = require('../config.json');

// Bot Loading \\

import { ActivityType } from 'discord.js';
client.once('ready', () => {
    client.user.setStatus('dnd');
    client.user.setUsername('Pitko Gambini');
    client.user.setActivity('Competing on Grove Street', { type: ActivityType.Custom });
});

// Modules Loading \\

const asciiTable = require('ascii-table'), fs = require('fs'), colors = require('colors');
const loadModules = () => {
    const modulesTable = new asciiTable().setHeading('Module', 'Status');
    fs.readdirSync('./dist/modules').forEach((module: string) => {
        if (module.endsWith('.ts') || module.endsWith('.js')) {
            modulesTable.addRow(module, `✅ ${colors.green('Success')}`);
            require(`./modules/${module}`)(client, config);
        } else {
            modulesTable.addRow(module, `❌ ${colors.red('Failed')}`);
        };
    });
    console.log(modulesTable.toString());
};
loadModules();

require('dotenv').config();
client.login(process.env.token);