const axios = require('axios');
const chalk = require('chalk');
const DiscordJS = require('discord.js');
const path = require('path');
const reqPath = path.join(__dirname, '../../../');
const { default: i18n } = require('new-i18n');
const newi18n = new i18n({ folder: path.join(reqPath, '/language'), languages: ['en','de'], fallback: 'en' })

class Discord {
    constructor(url, language) {
        this.url = url
        this.language = language
    }

    down(node) {
        let data = {
            embeds: [{
                title: newi18n.translate(this.language, 'notifications.discord.offline.title'),
                description: newi18n.translate(this.language, 'notifications.discord.offline.description', {node_nodeName: node.nodeName}),
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
                itle: newi18n.translate(this.language, 'notifications.discord.online.title'),
                description: newi18n.translate(this.language, 'notifications.discord.online.description', {node_nodeName: node.nodeName}),
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