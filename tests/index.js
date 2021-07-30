const Status = require('../index');
require('dotenv').config();

const Controller = new Status.Controller(4000, {
    token: process.env.token,
    guildID: '704423873415741510',
    channelID: '832318915366879263',
    color: '#06cce2', // Embed color
    pterodactyl: {
        panel: "https://panel.bluefoxhost.com",
        apiKey: process.env.apiKey,
    },
    node: {
        message: '**{node.name}**: {node.status}\n```Memory: {node.memory.used}/{node.memory.total}\nDisk: {node.disk.used}/{node.disk.total}\nCPU: {node.cpu.used} ({node.cpu.cores} cores)```',
        online: '🟢 **ONLINE**',
        offline: '🔴 **OFFLINE**'
    },
    embed: {
        color: '#06cce2',
        title: 'Node Status [{nodes.total} nodes]',
        description: '__**Nodes**__:\n{nodes.list}\n\n__**Total**__:\nMemory: {memory.used}/{memory.total} ({memory.used%})\nDisk: {disk.used}/{disk.total} ({disk.used%})\n\n__**Pterodactyl:**__\nUsers: {pterodactyl.users}\nServers: {pterodactyl.servers}',
        footer: {
            text: 'Last updated: {lastupdated}',
            icon: 'https://i.imgur.com/9b1qwml.jpg'
        }
    },
    interval: 15000
});



const Daemon = new Status.Daemon("Node1", 15000, {
    ip: "0.0.0.0",
    port: "4000",
    secure: false, // SSL
});