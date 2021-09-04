const axios = require('axios');
const chalk = require('chalk');
const path = require('path');
const reqPath = path.join(__dirname, '../../../');
const { default: i18n } = require('new-i18n');
const newi18n = new i18n({ folder: path.join(reqPath, '/language'), languages: ['en','de'], fallback: 'en' })

class Telegram {
    constructor(token, chatid, language) {
        this.url = 'https://api.telegram.org/'
        this.token = token
        this.chatID = chatid
        this.language = language
    }

    down(node) {
        let message = newi18n.translate(this.language, 'notifications.telegram.offline.description', {node_nodeName: node.nodeName})
        this.post(message);
    }

    up(node) {
        let message = newi18n.translate(this.language, 'notifications.telegram.online.description', {node_nodeName: node.nodeName})
        this.post(message);
    }

    post(content) {
        try {
            axios.get(`${this.url}bot${this.token}/sendMessage?chat_id=${this.chatID}&text=${content}&parse_mode=HTML`);
        } catch(e) {
            this.log('Failed to post to discord webhook');
        }
    }

    log(message) {
        console.log(`${chalk.blue('[TELEGRAM-WEBHOOK]')}${chalk.gray(':')} ${chalk.yellow(message)}`)
    }
}

module.exports = Telegram;