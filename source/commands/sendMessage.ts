const { SlashCommandBuilder } = require('discord.js');
import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send_message')
        .setDescription('Send a message to a channel!')
        .addStringOption((option: any) =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const message = options.getString('message'), channel = interaction.channel;
        if (channel) {
            await channel.send(message as string);
            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply();
        } else {
            await interaction.reply({ content: 'Could not determine the channel to send the message.', ephemeral: true });
        }
    },
};