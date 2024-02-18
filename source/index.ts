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

// Modules Loading \\

const asciiTable = require('ascii-table'), fs = require('fs'), colors = require('colors');
const { db } = require('./modules/functions');

(async () => {
    const modulesTable = new asciiTable().setHeading('Module', 'Status');

    fs.readdirSync('./dist/modules').forEach((module: string) => {
        if (module.endsWith('.ts') || module.endsWith('.js')) {
            modulesTable.addRow(module, `✅ ${colors.green('Success')}`);
            const moduleValue = require(`./modules/${module}`);
            if (typeof moduleValue === 'function') moduleValue(client);
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
})();

require('dotenv').config();
client.login(process.env.token);