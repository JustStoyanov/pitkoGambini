import { Client, ActivityType } from 'discord.js';

module.exports = (client: Client) => {
    client.once('ready', () => {
        client.user?.setStatus('dnd');
        client.user?.setUsername('Pitko Gambini');
        client.user?.setActivity('Competing on Grove Street', { type: ActivityType.Custom });
    });
};