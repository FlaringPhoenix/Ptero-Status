const axios = require('axios');
const chalk = require('chalk');
const { options } = require('./routes');

class Pterodactyl {
    constructor(panel, key, interval) {
        this.panel = panel;
        this.key = key;
        this.interval = interval;
        this.headers = { 'authorization': 'Bearer ' + this.key };

        this.stats = {
            users: 0,
            servers: 0
        }
    }

    init(interval = this.interval) {
        let that = this;
        setInterval(async () => {
            that.fetch('users');
            that.fetch('servers');
        }, interval);
    }

    get servers() {
        return this.stats.servers || 0;
    }

    get users() {
        return this.stats.users || 0;
    }

    async fetch(type) {
        try {
            let res = await axios.get(this.panel + '/api/application/' + type, { headers: this.headers });
            let total = res['data']['meta']['pagination']['total'];
            this.stats[type] = total;
            this.log('Fetched pterodactyl ' + type + ' count');
            return total;
        } catch(e) {
            this.log('Could not fetch pterodactyl ' + type + ' count');
            return;
        }
    }

    log(message) {
        console.log(`${chalk.blue('[CONTROLLER]')}${chalk.gray(':')} ${chalk.yellow(message)}`);
    }

}

module.exports = Pterodactyl;