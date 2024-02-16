require('dotenv').config();

const asciiTable = require('ascii-table'), fs = require('fs'), colors = require('colors');
const { REST, Routes } = require('discord.js');
import { Client, Collection, Interaction, CommandInteraction } from 'discord.js';

interface Command {
    execute: (interaction: any) => void; // Define the structure of your command objects
    // Add any other properties that your commands have
}

interface CustomClient extends Client {
    commands: Collection<string, Command>;
    commandName: string;
}

module.exports = async (client: CustomClient) => {
    // Commands Loading \\

    const commands: string[] = [], commandsAscii = new asciiTable().setHeading('Command', 'Load Status');
    fs.readdirSync('./dist/commands').forEach((command: string) => {
        const cmd = require(`../commands/${command}`);
        
        if ((command.endsWith('.ts') || command.endsWith('.js')) && cmd && cmd.data.name) {
            commandsAscii.addRow(command, `✅ ${colors.green('Success')}`);
            commands.push(cmd.data.toJSON());
            client.commands.set(cmd.data.name, cmd);
        } else {
            commandsAscii.addRow(command, `❌ ${colors.red('Failed')}`);
        };
    });

    const rest = new REST().setToken(process.env.token);

    (async () => {
        try {
            await rest.put(
                Routes.applicationGuildCommands(process.env.clientId, process.env.guildId),
                { body: commands },
            );
        } catch (error) {
            console.error(error);
        };
    })();

    console.log(commandsAscii.toString());

    // Commands Handling \\

    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isCommand()) return;

        const commandInteraction = interaction.client as CustomClient;
        const command = commandInteraction.commands.get(interaction.commandName);
    
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
};