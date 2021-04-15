const chalk = require("chalk");
const si = require('systeminformation');
const Cache = require('liquidcache');
const { default: axios } = require("axios");

class Daemon {
    constructor(name, cache = 30000, options = {}) {
        if (!name) return new Error('Missing name');
        this.name = name;

        if (cache < 15000) this.log("We don't recommend having the cache lower than 15000ms");
        this.cache = cache;

        if (!options['ip']) return new Error('Missing panel ip address');
        if (!options['port']) return new Error('Missing panel port');
        this.panel = {
            ip: options['ip'],
            port: options['port'],
            secure: options['secure'] || false,
        };

        this.log("Started!");
        this.autoPost();
    }

    log(message) {
        console.log(`${chalk.blue("[DAEMON]")}${chalk.gray(":")} ${chalk.yellow(message)}`);
    }

    async autoPost() {
        let that = this;
        setInterval(async function() {
            await that.post(await that.stats());
        }, this.cache);
    }

    async post(stats) {
        let scheme = this.panel.secure ? 'https://' : 'http://';
        try {
            await axios.post(`${scheme}${this.panel.ip}:${this.panel.port}/stats/${this.name}`, stats);
            Cache.set('stats', stats);
        } catch(e) {
            return this.log("Failed to post stats");
        }
        return this.log("Posted stats!")

    }

    async stats() {
        let memory = await si.mem();
        let disk = await si.fsSize();
        let cpu = await si.cpu();
        let os = await si.osInfo();
        let cl =  await si.currentLoad();
        return {
            nodeName: this.name,
            lastUpdated: Date.now(),
            cacheInterval: this.cache,
            memory: {
                total: memory.total,
                used: memory.used,
                free: memory.free,
            },
            disk: {
                total: disk.reduce((last, current) => last.size + current.size, 0) || disk[0].size,
                used: disk.reduce((last, current) => last.used + current.used, 0) || disk[0].used,
                free: disk.reduce((last, current) => last.available + current.available, 0) || disk[0].available
            },
            cpu,
            os,
            cl: cl['currentLoad'],
        }
    }

}

module.exports = Daemon;
