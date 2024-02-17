import { SlashCommandBuilder, CommandInteraction, CommandInteractionOptionResolver, TextChannel } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send_message')
        .setDescription('Send a message to a channel!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        if (!interaction.isCommand() || !interaction.guild) {
            return;
        }
        const options = interaction.options as CommandInteractionOptionResolver;
        if (!(interaction.channel instanceof TextChannel)) {
            await interaction.reply({ content: 'This command can only be used in a guild text channel.', ephemeral: true });
            return;
        }

        try {
            const message = options.getString('message', true);
            const formattedMessage = message.replace(/\\n/g, '\n');
            await interaction.channel.send(formattedMessage);
            await interaction.reply({ content: 'Message sent successfully!', ephemeral: true });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: 'There was an error while sending the message.', ephemeral: true });
        }
    },
};
