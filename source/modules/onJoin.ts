import { Client, TextChannel } from 'discord.js';
const config = require('../../config.json');

module.exports = async (client: Client) => {
    client.on('guildMemberAdd', member => {
        const channel = member.guild.channels.cache.get(config.onJoin.channelId) as TextChannel;
        channel?.send(config.onJoin.message.replace(/{member}/g, member)).catch(console.error);
        member.roles.add(config.onJoin.roleId).catch(console.error);
    });
};