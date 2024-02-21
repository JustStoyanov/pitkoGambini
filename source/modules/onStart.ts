import { Client, ActivityType } from 'discord.js';
const config = require('../../config.json');

module.exports = (client: Client) => {
    client.once('ready', () => {
        client.user?.setStatus('dnd');
        client.user?.setUsername('Pitko Gambini');
        while (true) {
            setTimeout(() => {
                const status = config.statuses[Math.floor(Math.random() * config.statuses.length)];
                client.user?.setActivity(status, { type: ActivityType.Custom });
            }, 1000 * 60 * 60);
        };
    });
};