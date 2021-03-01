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
            let res = await axios.get(this.panel + '/api/application/servers', {
                headers: {
                    'authorization': 'Bearer ' + this.key
                }
            });
            let total = res['data']['meta']['pagination']['total'];
            this.serverCount = total;
            return total;
        } catch(e) {
            console.error(e);
            return this.log('Could not fetch server count!');
        }
    }

    async updateUserCount() {
        try {
            let res = await axios.get(this.panel + '/api/application/users', {
                headers: {
                    'authorization': 'Bearer ' + this.key
                }
            });
            let total = res['data']['meta']['pagination']['total'];
            this.userCount = total;
            return total;
        } catch(e) {
            console.error(e);
            return this.log('Could not fetch user count!');
        }
    }

    log(message) {
        console.log(`${chalk.blue("[PANEL]")}${chalk.gray(":")} ${chalk.yellow(message)}`);
    }

}

module.exports = Pterodactyl;