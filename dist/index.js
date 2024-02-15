"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});
module.exports = client;
// Bot Loading \\
client.once('ready', () => {
    client.user.setStatus('dnd');
    client.user.setUsername('Pitko Gambini');
    client.user.setActivity('Praim gi na Grove Street!');
});
// Modules Loading \\
const asciiTable = require('ascii-table'), fs = require('fs'), colors = require('colors');
() => {
    const modulesTable = new asciiTable().setHeading('Module', 'Status');
    fs.readdirSync('./dist/modules').forEach((module) => {
        if (module.endsWith('.ts') || module.endsWith('.js')) {
            modulesTable.addRow(module, `✅ ${colors.green('Success')}`);
            require(`./modules/${module}`)(client);
        }
        else {
            modulesTable.addRow(module, `❌ ${colors.red('Failed')}`);
        }
        ;
    });
    console.log(modulesTable.toString());
};
// Bot Login \\
const guildId = process.env.guildId, createVoiceChannelId = process.env.createVoiceChannelId;
require('dotenv').config();
client.on('voiceStateUpdate', (_, newState) => {
    if (newState.channelId === createVoiceChannelId && newState.guild.id === guildId) {
        console.log(`${newState.member?.user.username} has joined the specific voice channel.`);
    }
});
client.login(process.env.token);
