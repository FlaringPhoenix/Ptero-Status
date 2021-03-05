const axios = require('axios');
const chalk = require('chalk');

class Pterodactyl {
    constructor(panelURL, apiKey, interval) {
        this.panel = panelURL;
        this.key = apiKey;
        this.interval = interval;
    }

    init(interval = this.interval) {
        let that = this;
        setInterval(async () => {
            await that.updateServerCount();
            await that.updateUserCount();
        }, interval);
    }

    getServerCount() {
        return this.serverCount;
    }

    getUserCount() {
        return this.userCount;
    }

    async updateServerCount() {
        try {
            let res = await axios.get(`${this.panel}/api/application/servers`, {
                headers: {
                    'authorization': 'Bearer ' + this.key
                }
            });
            let total = res['data']['meta']['pagination']['total'];
            this.serverCount = total;
            this.log('Updated pterodactyl server count!');
            return total;
        } catch(e) {
            console.error(e);
            this.log('Could not fetch pterodactyl server count!');
            return;
        }
    }

    async updateUserCount() {
        try {
            let res = await axios.get(`${this.panel}/api/application/users`, {
                headers: {
                    'authorization': 'Bearer ' + this.key
                }
            });
            let total = res['data']['meta']['pagination']['total'];
            this.userCount = total;
            this.log('Updated pterodactyl user count!');
            return total;
        } catch(e) {
            console.error(e);
            this.log('Could not fetch pterodactyl user count!');
            return;
        }
    }

    log(message) {
        console.log(`${chalk.blue('[PANEL]')}${chalk.gray(':')} ${chalk.yellow(message)}`);
    }

}

module.exports = Pterodactyl;
