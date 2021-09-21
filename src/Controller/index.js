const express = require('express');
const chalk = require('chalk');
const Cache = require('liquidcache');
const Discord = require('discord.js');
const Notifications = require('./notifications');
const Pterodactyl = require('./pterodactyl');
const EventEmitter = require('events');
const path = require('path');
const reqPath = path.join(__dirname, '../../');
const { default: i18n } = require('new-i18n');
const newi18n = new i18n({ folder: path.join(reqPath, '/language'), languages: ['en','de'], fallback: 'en' })

class Panel extends EventEmitter {
    constructor(port = 4000, language = 'de', options = {}) {
        super();

        // Node cache
        Cache.set('nodes', []);
        Cache.set('status', {});

        // Options
        if (options['interval']) this.interval = options['interval'] || 30000;

        if (options['discord']) {
            this.discord = options['discord'];
            this.token = this.discord['token'];
            this.channelID = this.discord['channel'];
        }

        if (options['telegram']) {
            this.telegram = options['telegram'];
            this.tgtoken = this.telegram['tgtoken'];
            this.tgchatID = this.telegram['tgchatID'];
        }

        if (options['node']) {
            this.node = options['node'];
            this.online = this.node['online'] || newi18n.translate(language, 'node.online');
            this.offline = this.node['offline'] || newi18n.translate(language, 'node.offline');
            this.nodeMessage = this.node['message'] || newi18n.translate(language, 'node.message');
        }

        if (options['embed']) {
            this.embed = options['embed'];
            this.color = this.embed['color'];
            this.title = this.embed['title'] || newi18n.translate(language, 'embed.title');
            this.description = this.embed['description'] || newi18n.translate(language, 'embed.description');
            this.footer = this.embed['footer'];
            this.footerText = this.footer['text'] || '';
            this.footerIcon = this.footer['icon'] || '';
            this.thumbnail = this.embed['thumbnail'] || '';
        }
        
        if (options['pterodactyl']) {
            this.ptero = options['pterodactyl'];
            this.panel = this.ptero['panel'] || null;
            this.apiKey = this.ptero['apiKey'] || null;
        }

        if (options['notifications']) {
            this.notifications = options['notifications'];
            if (this.notifications['discord']) this.discordWebhook = new Notifications.Discord(this.notifications['discord'], language);
            if (this.notifications['webhook']) this.webhook = new Notifications.Webhook(this.notifications['webhook']);
        }

        if (options['bearer_token']) {
            this.bearer_token = options['bearer_token']
        }

        // Repo Information
        this.version = require('../../package.json')['version'];
        this.homepage = require('../../package.json')['homepage'];

        // Start 
        if (this.discord) this.startBot();
        if (this.ptero) this.startPterodactyl();
        if (this.telegram) this.telegram = new Notifications.Telegram(this.tgtoken, this.tgchatID, language)

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

        //Bearer token auth middleware
        if (this.bearer_token) {
            this.app.use((req, res, next) => {
                if (!req.headers['authorization']) {
                    this.elog(`Deamon "${req.body.nodeName}" tryed to send data without authorization!`)
                    res.status(403).json({error: 'Bearer token is required'})
                }else if (req.headers['authorization'] !== `Bearer ${this.bearer_token}`){
                    this.elog(`Deamon "${req.body.nodeName}" tryed to send data with incorrect authorization!`)
                    res.status(403).json({error: 'Bearer token is not valid'})
                }else{
                    next();
                }
            });
        }

        // Logging
        this.app.use((req, res, next) => {
            let realip = req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(':').pop();
            this.log(`${chalk.green(req.method)} request on ${chalk.red(req.originalUrl)} from ${chalk.white(realip)}`);
            next();
        });

        // Load routes
        this.app.use('/', require('./routes'));
        
        // Listen on the given port
        this.app.listen(port);
        this.log('Started! Listening on port: ' + port);
    }

    startBot() {
        this.client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });
        try {
            this.client.login(this.token);
        } catch(e) {
            this.log('Invalid bot token!');
            return;
        }

        let that = this;
        setInterval(() => {
            that.log('Updating embed');
            that.updateEmbed();
        }, this.interval);
    }

    startPterodactyl(panel = this.panel, apiKey = this.apiKey, interval = this.interval) {
        if (!panel) return this.log('Missing pterodactyl panel url');
        if (!apiKey) return this.log('Missing pterodactyl panel application api key');
    
        this.pterodactyl = new Pterodactyl(panel, apiKey, interval);
        this.pterodactyl.init();
    }

    async updateEmbed() {
        if (this.channel == undefined) this.channel = this.client.channels.cache.get(this.channelID);
        if (this.message == undefined) {
            let messages = await this.channel.messages.fetch({ limit: 5 });
            let lastMessage = (messages.filter(m => m.author.id == this.client.user.id)).first();
            if (!lastMessage) lastMessage = await this.channel.send('Loading...');
            this.message = lastMessage;
        }

        let nodes = Cache.get('nodes');
        nodes.map((n, i) => nodes[i]['online'] = (Date.now() - n.lastUpdated) < n.cacheInterval * 2);

        let nodesOnline = nodes.filter(n => n.online).length;
        let nodesOffline = nodes.filter(n => !n.online).length;
        let nodesList = nodes.map(n => {

            // Node Status
            let status = Cache.get('status');
            let lastStatus = status[n.nodeName];
            this.handleStatus(lastStatus, n.online, n);
            status[n.nodeName] = n.online;
            Cache.set('status', status);

            // Parse
            return this.nodeMessage
                .replace('{node.name}', n.nodeName)
                .replace('{node.memory.used}', `${this.bytesToSize(n.memory.used)}GB`)
                .replace('{node.memory.total}', `${this.bytesToSize(n.memory.total)}GB`)
                .replace('{node.disk.used}', `${this.bytesToSize(n.disk.used)}GB`)
                .replace('{node.disk.total}', `${this.bytesToSize(n.disk.total)}GB`)
                .replace('{node.cpu.used}', `${(n.cl).toFixed(2) || 'unknown'}%`)
                .replace('{node.cpu.cores}', n.cpu.cores)
                .replace('{node.cpu}', `${n.cpu.manufacturer || ''} ${n.cpu.brand || ''}`)
                .replace('{node.os}', n.os.platform || 'unknown')
                .replace('{node.status}', n.online ? this.online : this.offline);
        }).join('\n');

        this.nodes = nodes;
        let nodesTotal = nodes.length;

        let totalMemory = this.bytesToSize(nodes.reduce((acc, node) => acc + node.memory.total, 0));
        let totalDisk = this.bytesToSize(nodes.reduce((acc, node) => acc + node.disk.total, 0));
        let totalCores = nodes.reduce((acc, node) => acc + node.cpu.cores, 0);
        let usedMemory = this.bytesToSize(nodes.reduce((acc, node) => acc + node.memory.used, 0));
        let usedDisk = this.bytesToSize(nodes.reduce((acc, node) => acc + node.disk.used, 0));

        let that = this;
        function parse(text = '') {
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

                .replace('{pterodactyl.users}', that.pterodactyl.users)
                .replace('{pterodactyl.servers}', that.pterodactyl.servers)
        }

        this.editEmbed(
            this.message,
            parse(this.title).substr(0, 256),
            parse(this.description).substr(0, 2048),
            [],
            parse(this.footerText).substr(0, 2048),
            this.color,
            this.thumbnail
        )
    }

    editEmbed(message, title, description, fields, footer, color, thumbnail) {
        return new Promise(async (resolve, reject) => {
            message.edit({
                content: `v${this.version}`,
                embeds: [{
                    title: title,
                    description: description,
                    fields: fields,
                    thumbnail: { url: thumbnail || '' },
                    color: color || this.color,
                    footer: { text: footer || this.footerText, icon_url: this.footerIcon },
                    timestamp: new Date()
                }]
            }).then(message => {
                resolve(message);
            }).catch(err => {
                reject(err);
            });
        });
    }

    handleStatus(oldStatus, newStatus, node) {
        if (oldStatus != undefined) {
            if (newStatus == true && oldStatus == false) {
                if (this.discordWebhook != undefined) this.discordWebhook.up(node);
                if (this.webhook != undefined) this.webhook.up(node);
                if (this.telegram != undefined) this.telegram.up(node);
                this.emit('online', node);
            } else if (newStatus == false && oldStatus == true) {
                if (this.discordWebhook != undefined) this.discordWebhook.down(node);
                if (this.webhook != undefined) this.webhook.down(node);
                if (this.telegram != undefined) this.telegram.down(node);
                this.emit('offline', node);
            }
        }
    }

    bytesToSize(bytes) {
        return (bytes/1024/1024/1024).toFixed(2)
    }

    log(message) {
        console.log(`${chalk.blue('[CONTROLLER]')}${chalk.gray(':')} ${chalk.yellow(message)}`)
    }

    elog(message) {
        console.log(`${chalk.blue('[CONTROLLER]')}${chalk.gray(':')} ${chalk.red(message)}`);
    }
}

module.exports = Panel;