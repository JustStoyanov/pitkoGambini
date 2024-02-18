import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, VoiceBasedChannel } from 'discord.js';

interface ExtendedCommandInteraction extends CommandInteraction {
    member: GuildMember;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_team')
        .setDMPermission(false)
        .setDescription('Create a team with the people from the voice channel you are in with even players.'),
    async execute(interaction: ExtendedCommandInteraction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (voiceChannel) {
            const teamOne: string[] = [], teamTwo: string[] = [], spectators: string[] = [];
            const members = Array.from(voiceChannel.members.filter(m => !m.user.bot).values()); // Filter out bots

            for (let i = members.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [members[i], members[j]] = [members[j], members[i]];
            }

            members.forEach((member, index) => {
                if (index % 2 === 0 && teamOne.length < 5) {
                    teamOne.push(member.user.displayName);
                } else if (teamTwo.length < 5) {
                    teamTwo.push(member.user.displayName);
                } else {
                    spectators.push(member.user.displayName);
                }
            });

            if (teamOne.length !== teamTwo.length) {
                const lastMember = teamOne.length > teamTwo.length ? teamOne.pop() : teamTwo.pop();
                if (lastMember) spectators.push(lastMember);
            }

            const response = [
                `**Team 1:** ${teamOne.join(', ') || 'No members'}`,
                `**Team 2:** ${teamTwo.join(', ') || 'No members'}`,
                `**Spectators:** ${spectators.join(', ') || 'None'}`
            ].join('\n');

            await interaction.reply(response);
        } else {
            await interaction.reply({ content: 'You need to be in a voice channel to create the teams.', ephemeral: true });
        }
    },
};