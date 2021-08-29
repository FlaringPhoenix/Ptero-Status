const axios = require('axios');
const chalk = require('chalk');
const DiscordJS = require('discord.js');

class Discord {
    constructor(url) {
        this.url = url
    }

    down(node) {
        let data = {
            embeds: [{
                title: '❌ Offline',
                description: 'An outage has been detected on **' + node.nodeName + '**',
                thumbnail: { url: 'https://discord.com/assets/8becd37ab9d13cdfe37c08c496a9def3.svg' },
                color: DiscordJS.Util.resolveColor('#AA0000'),
                timestamp: new Date()
            }]
        }
        this.post(data);
    }

    up(node) {
        let data = {
            embeds: [{
                title: '✅ Online',
                description: 'The server is back online **' + node.nodeName + '**',
                thumbnail: { url: 'https://discord.com/assets/212e30e47232be03033a87dc58edaa95.svg' },
                color:  DiscordJS.Util.resolveColor('#55FF55'),
                timestamp: new Date()
            }]
        }
        this.post(data);
    }

    post(content) {
        try {
            axios.post(this.url, content);
        } catch(e) {
            this.log('Failed to post to discord webhook');
        }
    }

    log(message) {
        console.log(`${chalk.blue('[DISCORD-WEBHOOK]')}${chalk.gray(':')} ${chalk.yellow(message)}`)
    }
}

module.exports = Discord;