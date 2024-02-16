const { SlashCommandBuilder } = require('discord.js');
import { CommandInteraction } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Check the bot\'s info!'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!')
    },
};