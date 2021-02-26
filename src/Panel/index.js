const express = require("express");
const chalk = require("chalk");
const Cache = require('memory-cache');
const Discord = require('discord.js');

class Panel {
    constructor(port = 4000, options = {}) {

        // Node cache
        Cache.put('nodes', []);

        // Options
        if (options['token']) this.token = options['token'];
        if (options['guildID']) this.guildID = options['guildID'];
        if (options['channelID']) this.channelID = options['channelID'];
        if (options['interval']) this.interval = options['interval'] || 30000;
        if (options['color']) this.color = options['color'] || '#06cce2'

        // Start bot
        this.startBot();

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

        nodes.map((n, i) => {
            nodes[i]['online'] = (Date.now() - n.lastUpdated) < n.cacheInterval * 2 
        })

        this.editEmbed(
            this.channel,
            this.message,
            `Node Stats [${nodes.length} nodes]`,
`__**Nodes**__:
${nodes.map(n => `**${n.nodeName}** ➤ ${n.online ? '🟢 **ONLINE**' : '🔴 **OFFLINE**'} [Memory: ${this.bytesToSize(n.stats.memory.used)}/${this.bytesToSize(n.stats.memory.total)}] [Disk: ${this.bytesToSize(n.stats.disk.used)}/${this.bytesToSize(n.stats.disk.total)}]`).join('\n')}

__**Overall**__:
Online: ${nodes.filter(n => n.online).length}
Offline: ${nodes.filter(n => !n.online).length}
Memory: ${this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.memory.used, 0))}/${this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.memory.total, 0))}
Disk: ${this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.disk.used, 0))}/${this.bytesToSize(nodes.reduce((acc, node) => acc + node.stats.disk.total, 0))}
Cores: ${nodes.reduce((acc, node) => acc + node.stats.cpu.cores, 0)}
`,
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
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + sizes[i];
    }

    log(message) {
        console.log(`${chalk.blue("[PANEL]")}${chalk.gray(":")} ${chalk.yellow(message)}`);
    }

}

module.exports = Panel;