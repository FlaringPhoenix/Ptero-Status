const axios = require('axios');
const chalk = require('chalk');

class Webhook {
    constructor(url) {
        this.url = url
    }

    down(node) {
        let data = {
            type: 'offline',
            node
        }
        this.post(data);
    }

    up(node) {
        let data = {
            type: 'online',
            node
        }
        this.post(data);
    }

    post(content) {
        try {
            axios.post(this.url, content);
        } catch(e) {
            this.log('Failed to post to webhook');
        }
    }

    log(message) {
        console.log(`${chalk.blue('[WEBHOOK]')}${chalk.gray(':')} ${chalk.yellow(message)}`)
    }
}

module.exports = Webhook;