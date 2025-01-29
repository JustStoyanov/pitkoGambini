import { SlashCommandBuilder, CommandInteraction, GuildMember, VoiceBasedChannel, CommandInteractionOptionResolver } from 'discord.js';

interface ExtendedCommandInteraction extends CommandInteraction {
    member: GuildMember;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_team')
        .setDMPermission(false)
        .setDescription('Create a team with the people from the voice channel you are in with even players.')
        .addBooleanOption(option =>
            option.setName('tag_players')
                .setDescription('Whether to tag the players in the output')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('team_size')
                .setDescription('Number of players per team')
                .addChoices(
                    { name: '2 Players', value: 2 },
                    { name: '3 Players', value: 3 },
                    { name: '5 Players', value: 5 }
                )
                .setRequired(false)
        ),
    async execute(interaction: ExtendedCommandInteraction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel as VoiceBasedChannel;

        if (voiceChannel) {
            const options = interaction.options as CommandInteractionOptionResolver;
            const teamSize = options.getInteger('team_size', true) || 5, tagPlayers = options.getBoolean('tag_players', false) || false;

            const teamOne: string[] = [], teamTwo: string[] = [], spectators: string[] = [];
            const members = Array.from(voiceChannel.members.filter(m => !m.user.bot).values()); // Filter out bots

            for (let i = members.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [members[i], members[j]] = [members[j], members[i]];
            }

            members.forEach((member) => {
                if (teamOne.length < teamSize) {
                    teamOne.push(tagPlayers ? `<@${member.user.id}>` : member.user.displayName);
                } else if (teamTwo.length < teamSize) {
                    teamTwo.push(tagPlayers ? `<@${member.user.id}>` : member.user.displayName);
                } else {
                    spectators.push(tagPlayers ? `<@${member.user.id}>` : member.user.displayName);
                }
            });

            if (teamOne.length !== teamTwo.length) {
                const lastMember = teamOne.length > teamTwo.length ? teamOne.pop() : teamTwo.pop();
                if (lastMember) spectators.push(lastMember);
            }

            const response = [
                `**Team 1:** ${teamOne.join(', ') || 'Not enough players'}`,
                `**Team 2:** ${teamTwo.join(', ') || 'Not enough players'}`,
                `**Spectators:** ${spectators.join(', ') || 'None'}`
            ].join('\n');

            await interaction.reply(response);
        } else {
            await interaction.reply({ content: 'You need to be in a voice channel to create the teams.', ephemeral: true });
        }
    },
};