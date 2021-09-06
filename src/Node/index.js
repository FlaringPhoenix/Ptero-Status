const chalk = require('chalk');
const si = require('systeminformation');
const Cache = require('liquidcache');
const { default: axios } = require('axios');
const { response } = require('express');

class Node {
    constructor(options = {}) {

        if (!options['name']) return new Error('Missing node name');
        this.name = options['name'];

        if (!options['interval']) return new Error('Missing node update interval');
        this.interval = options['interval'];

        if (!options['controller']) return new Error('Missing controller address');
        this.controller = options['controller'];

        if (options['bearer_token']) {
            this.config = {
                headers: { Authorization: `Bearer ${options['bearer_token']}` }
            };
        }

        // Toggle running
        this.running = true;

        this.log(`Started! Posting to: ${this.controller}`);
        this.autoPost();
    }

    start() {
        if (this.running) return this.log('Tried to start but already started');
        this.running = true;
        this.log('Starting!');
    }

    stop() {
        if (!this.running) return this.log('Tried to stop but already stopped');
        this.running = false;
        this.log('Stopping!');
    }

    async autoPost() {
        let that = this;
        setInterval(async function() {
            await that.post(await that.stats());
        }, this.interval);
    }

    async post(stats) {
        if (!this.running) return;
        let scheme = this.controller.secure ? 'https://' : 'http://';
        try {
            if(this.config){
                await axios.post(`${this.controller}/stats/${this.name}`, stats, this.config);
            }else{
                await axios.post(`${this.controller}/stats/${this.name}`, stats);
            }
            Cache.set('stats', stats);
        } catch(e) {
            if (e.response.status === 403) {
                return this.elog(e.response.data.error);
            }
            return this.elog('Failed to post stats to controller');
        }
        return this.log('Posted stats to controller!')

    }

    async stats() {
        if (!this.running) return;
        let memory = await si.mem();
        let disk = await si.fsSize();
        let cpu = Cache.get('cpu') || await si.cpu();
        Cache.set('cpu', cpu);
        let os = Cache.get('os') || await si.osInfo();
        Cache.set('os', os);
        let cl =  await si.currentLoad();
        return {
            nodeName: this.name,
            lastUpdated: Date.now(),
            cacheInterval: this.interval,
            memory: {
                total: memory.total,
                used: (memory.total-memory.available),
                free: (memory.free+memory.available),
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

    log(message) {
        console.log(`${chalk.blue('[DAEMON]')}${chalk.gray(':')} ${chalk.yellow(message)}`);
    }

    elog(message) {
        console.log(`${chalk.blue('[DAEMON]')}${chalk.gray(':')} ${chalk.red(message)}`);
    }
}

module.exports = Node;
