const Status = require('../index');
require('dotenv').config();

/*
Embed Placeholders:

NODES:
{nodes.online} - Number of online nodes
{nodes.offline} - Number of offline nodes
{nodes.list} - List of nodes along with their statuses
{nodes.total} - Number of total nodes

TOTAL:
{memory.total} - Total memory
{disk.total} - Total disk
{cores.total} - Total cores

USED:
{memory.used} - Total memory used by nodes
{disk.used} - Total disk used by nodes
{memory.used%} - Total memory percentage used by nodes 
{disk.used%} - Total disk percentage used by nodes

PTERODACTYL:
{pterodactyl.users} - Number of current panel users
{pterodactyl.servers} - Number of current panel servers
*/

const Controller = new Status.Controller(4000, {
    token: process.env.token,
    guildID: '704423873415741510',
    channelID: '815707495880065064',
    color: '#06cce2', // Embed color
    pterodactyl: {
        panel: 'https://panel.bluefoxhost.com',
        apiKey: process.env.apiKey,
    },
    embed: {
        color: '#06cce2',
        title: 'Node Status [{nodes.total} nodes]',
        description: '__**Nodes**__:\n{nodes.list}\n\n__**Total**__:\nMemory: {memory.used}/{memory.total} ({memory.used%})\nDisk: {disk.used}/{disk.total} ({disk.used%})\n\n__**Pterodactyl:**__\nUsers: {pterodactyl.users}\nServers: {pterodactyl.servers}'
    },
    interval: 15000
});

const Daemon = new Status.Daemon('Node1', 15000, {
    ip: '0.0.0.0',
    port: '4000'
});
