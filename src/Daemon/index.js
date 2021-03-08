const chalk = require('chalk');
const si = require('systeminformation');
const Cache = require('memory-cache');
const { default: axios } = require('axios');

class Daemon {
    constructor(name, cache = 30000, options = {}) {
        if (!name) return new Error('Missing name');
        this.name = name;

        if (cache < 15000) this.log('We don\'t recommend having the cache lower than 15000ms');
        this.cache = cache;

        if (!options['ip']) return new Error('Missing panel ip address');
        if (!options['port']) return new Error('Missing panel port');
        this.panel = {
            ip: options['ip'],
            port: options['port'],
            secure: options['secure'] || false,
        };

        this.log('Started!');
        this.initCache();
    }

    log(message) {
        console.log(`${chalk.blue('[DAEMON]')}${chalk.gray(':')} ${chalk.yellow(message)}`);
    }

    async initCache() {
        let that = this;
        let stats = await this.stats();
        this.log('Posted stats');
        Cache.put('stats', stats);
        this.postStats();
        setInterval(async function() {
            let stats = await that.stats();
            that.log('Posted stats');
            Cache.put('stats', stats);
            that.postStats();
        }, this.cache);
    }
  
    postStats() {
        let that = this.panel.secure ? 'https://' : 'http://';
        axios.post(`${scheme}${this.panel.ip}:${this.panel.port}/v1/stats/${this.name}`, Cache.get('stats')).catch((e) => {
            that.log('Failed to post the stats');
        });
    }

    async stats() {
        let memory = await si.mem();
        let disk = await si.fsSize();
        let cpu = await si.cpu();
        let network = await si.networkStats();
        let os = await si.osInfo();
        let bios = await si.bios();
        let docker = await si.dockerInfo();
        let cl =  await si.currentLoad();
        return {
            nodeName: this.name,
            lastUpdated: Date.now(),
            cacheInterval: this.cache,
            stats: {
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
                network,
                os,
                bios,
                docker: {
                    running: docker.running,
                    paused: docker.paused,
                    stopped: docker.stopped,
                },
                cl,
            }
        }
    }

}

module.exports = Daemon;
