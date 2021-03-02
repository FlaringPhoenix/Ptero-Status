const express = require("express");
const chalk = require("chalk");
const Cache = require('memory-cache');
const Discord = require('discord.js');
const Pterodactyl = require("./pterodactyl");

class Panel {
    constructor(port = 4000, options = {}) {
        // Node cache
        Cache.put('nodes', []);

        // Options
        if (options['token']) this.token = options['token'];
        if (options['guildID']) this.guildID = options['guildID'];
        if (options['channelID']) this.channelID = options['channelID'];
        if (options['interval']) this.interval = options['interval'] || 30000;
        if (options['node']) this.node = options['node'];
        this.online = this.node['online'] || '🟢 **ONLINE**';
        this.offline = this.node['offline'] || '🔴 **OFFLINE**';
        this.nodeMessage = this.node['message'] || '__**{node.name}**__: [Memory: {node.memory.used/{node.memory.total}] [Disk: {node.disk.used}/{node.disk.total}]';
        if (options['embed']) this.embed = options['embed'];
        this.color = this.embed['color'];
        this.title = this.embed['title'] || "Node Status [{nodes.total}]";
        this.description = this.embed['description'] || "**Nodes**:\n{nodes.list}";
        if (options['pterodactyl']) this.ptero = options['pterodactyl'];
        this.panel = this.ptero['panel'] || null;
        this.apiKey = this.ptero['apiKey'] || null;

        // Start bot
        this.startBot();

        // Start pterodactyl
        this.startPterodactyl();

        // Setup express
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));

        // CORS middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', '*');
            res.header('Access-Control-Allow-Headers', '*');
            next();
        });

        // Logging
        this.app.use((req, res, next) => {
            let realip = req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(`:`).pop();
            this.log(`${chalk.green(req.method)} request on ${chalk.red(req.originalUrl)} from ${chalk.white(realip)}`);
            next();
        });

        // Load routes
        this.app.use("/", require("./routes"));
        
        // Listen on the given port
        this.app.listen(port);
        this.log("Listening on port: " + port);
    }

    startBot(token = this.token, interval = this.interval) {
        if (!token) return;
        this.client = new Discord.Client();
        try {
            this.client.login(this.token);
        } catch(e) {
            console.error(e);
        }
        let that = this;
        setInterval(() => {
            that.log('Updating embed! Next update: ' + interval/1000 + ' seconds');
            that.updateEmbed();
        }, interval);
    }

    startPterodactyl(panel = this.panel, apiKey = this.apiKey, interval = this.interval) {
        if (!panel) return this.log("Missing pterodactyl panel url");
        if (!apiKey) return this.log("Missing pterodactyl panel application api key");
    
        this.pterodactyl = new Pterodactyl(panel, apiKey, interval);
        this.pterodactyl.init();
    }

    async updateEmbed() {
        if (this.guild == undefined) this.guild = this.client.guilds.cache.get(this.guildID);
        if (this.channel == undefined) this.channel = this.guild.channels.cache.get(this.channelID);
        if (this.message == undefined) {
            let messages = await this.channel.messages.fetch({ limit: 10 });
            let lastMessage = (messages.filter(m => m.author.id == this.client.user.id)).first();
            if (!lastMessage) lastMessage = await this.channel.send(new Discord.MessageEmbed().setTitle("Starting!").setColor(this.color));
            this.message = lastMessage;
        }

        let nodes = Cache.get('nodes');
        nodes.map((n, i) => nodes[i]['online'] = (Date.now() - n.lastUpdated) < n.cacheInterval * 2);

        let nodesOnline = nodes.filter(n => n.online).length;
        let nodesOffline = nodes.filter(n => !n.online).length;
        let nodesList = nodes.map(n => {

            return this.nodeMessage
                .replace('{node.name}', n.nodeName)
                .replace('{node.memory.used}', `${this.bytesToSize(n.stats.memory.used)}GB`)
                .replace('{node.memory.total}', `${this.bytesToSize(n.stats.memory.total)}GB`)
                .replace('{node.disk.used}', `${this.bytesToSize(n.stats.disk.used)}GB`)
                .replace('{node.disk.total}', `${this.bytesToSize(n.stats.disk.total)}GB`)
                .replace('{node.cpu.used}', `${(n.stats.cl.currentLoad).toFixed(2) || "unknown"}%`)
                .replace('{node.cpu.cores}', n.stats.cpu.cores)
                .replace('{node.cpu}', `${n.stats.cpu.manufacturer || ""} ${n.stats.cpu.brand || ""}`)
                .replace('{node.os}', n.stats.os.platform || "unknown")
                .replace('{node.cpu.bios}', n.stats.bios.vendor)
                .replace('{node.status}', n.online ? this.online : this.offline);
            
        }).join('\n');
        
            let nodesTotal = nodes.length;

        let totalMemory = this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.memory.total, 0));
        let totalDisk = this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.disk.total, 0));
        let totalCores = nodes.reduce((acc, node) => acc + node.stats.cpu.cores, 0);

        let usedMemory = this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.memory.used, 0));
        let usedDisk = this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.disk.used, 0));

        let that = this;
        function parse(text = "") {
            return text
                .replace('{nodes.online}', nodesOnline)
                .replace('{nodes.offline}', nodesOffline)
                .replace('{nodes.list}', nodesList)
                .replace('{nodes.total}', nodesTotal)

                .replace('{memory.total}', totalMemory + 'GB')
                .replace('{disk.total}', totalDisk + 'GB')
                .replace('{cores.total}', totalCores)

                .replace('{memory.used}', usedMemory + 'GB')
                .replace('{disk.used}', usedDisk + 'GB')
                .replace('{memory.used%}', (usedMemory/totalMemory).toFixed(2)*100 + '%')
                .replace('{disk.used%}', (usedDisk/totalDisk).toFixed(2)*100 + '%')

                .replace('{pterodactyl.users}', that.pterodactyl.getUserCount())
                .replace('{pterodactyl.servers}', that.pterodactyl.getServerCount());
        }

        this.editEmbed(
            this.channel,
            this.message,
            parse(this.title).substr(0, 256),
            parse(this.description).substr(0, 2048),
        )
    }

    editEmbed(channel, message, title, description, fields, footer, color, thumbnail) {
        return new Promise(async (resolve, reject) => {
            message.edit({
                embed: {
                    title: title,
                    description: description,
                    fields: fields,
                    thumbnail: { url: thumbnail || "" },
                    color: color || this.color,
                    footer: { text: footer || `Last Updated: ${new Date()}`}
                }
            }).then(message => {
                resolve(message);
            }).catch(err => {
                reject(err);
            });
        });
    }

    bytesToSize(bytes) {
        let GB = bytes/1024/1024/1024;
        return GB.toFixed(2);
    }

    log(message) {
        console.log(`${chalk.blue("[PANEL]")}${chalk.gray(":")} ${chalk.yellow(message)}`);
    }

}

module.exports = Panel;