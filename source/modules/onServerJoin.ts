import { Client, TextChannel } from 'discord.js';
module.exports = async (client: Client, config: any) => {
    client.on('guildMemberAdd', member => {
        const channel = member.guild.channels.cache.get(config.onJoin.channelId) as TextChannel;
        channel?.send(config.onJoin.message.replace(/{member}/g, member)).catch(console.error);
    });
};