# Ptero-Status
![](https://img.shields.io/github/stars/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/github/forks/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/github/issues/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/github/license/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/discord/870418236078960791)

# About
PteroStatus is an easy to setup [pterodactyl](https://github.com/pterodactyl/panel) daemon status project. It will continuously update a discord embed with live stats from your daemons.

## Preview

![Preview](https://cdn.flaringphoenix.com/8j1s)

# Installation

Run the following command to install the npm package

```bash
npm i pterostatus
```

## Usage

### Node:
```javascript
const Status = require('pterostatus');

const Node = new Status.Node({
    name: 'Node1',
    interval: 15000,
    controller: 'http://91.109.117.42:4000'
});
```

### Controller: (Simple)
```javascript
const Status = require('pterostatus');

const Controller = new Status.Controller({
    port: 4000,
    interval: 15000
});
```

### Controller: (Advanced)
```javascript
const Status = require('pterostatus');

const Controller = new Status.Controller(4000, {
    discord: {
        token: 'BOT-TOKEN',
        channel: 'CHANNEL-ID',
    },
    pterodactyl: {
        panel: 'https://panel.domain.com',
        apiKey: 'API-KEY'
    },
    notifications: {
        discord: process.env.DISCORD_WEBHOOK,
        webhook: 'http://0.0.0.0:5000/webhook'
    },
    node: {
        message: '**{node.name}**: [Memory: {node.memory.used}/{node.memory.total}] [Disk: {node.disk.used}/{node.disk.total}]',
        online: '🟢 **ONLINE**',
        offline: '🔴 **OFFLINE**'
    },
    embed: {
        color: '#06cce2',
        title: 'Node Status',
        description: '**Nodes**:\n{nodes.list}\n\n**Total**:\nMemory: {memory.used}/{memory.total}\nDisk: {disk.used}/{disk.total}\n\n**Pterodactyl:**\nUsers: {pterodactyl.users}\nServers: {pterodactyl.servers}',
        footer: {
            text: 'Last updated: {lastupdated}',
            icon: 'https://i.imgur.com/9b1qwml.jpg'
        }
    },
    port: 4000,
    interval: 15000
});
```

### Events
```javascript
Controller.on('online', (node) => {
    console.log(`Node: "${node.nodeName}" has come back online!`);
});

Controller.on('offline', (node) => {
    console.log(`Node: "${node.nodeName}" has gone offline!`);
});
```

### Pterodactyl Application API Key
You need to have pterodactyl panel installed in order to use PteroStatus' pterodactyl integration.
Not all permissions are required on the api key. Please just give the following permissions to the api key
![Permissions](https://cdn.flaringphoenix.com/pRoQ)

### Placeholders:
**NODE**:<br />
`{node.name}` - Node's name<br />
`{node.memory.used}` - Total node's memory<br />
`{node.memory.total}` - Total used memory<br />
`{node.disk.used}` - Total used disk<br />
`{node.disk.total}` - Total node's disk<br />
`{node.cpu.used}` - Total used cpu<br />
`{node.cpu.cores}` - Total cpu cores<br />
`{node.cpu}` - Displays the cpu model<br />
`{node.os}` - Displays the os<br />
`{node.status}` - Shows if it's online or offline<br />

**NODES**:<br />
`{nodes.online}` - Number of online nodes<br />
`{nodes.offline}` - Number of offline nodes<br />
`{nodes.list}` - List of nodes along with their statuses<br />
`{nodes.total}` - Number of total nodes<br />

**TOTAL**:<br />
`{memory.total}` - Total memory<br />
`{disk.total}` - Total disk<br />
`{cores.total}` - Total cores<br />

**USED**:<br />
`{memory.used}` - Total memory used by nodes<br />
`{disk.used}` - Total disk used by nodes<br />
`{memory.used%}` - Total memory percentage used by nodes<br />
`{disk.used%}` - Total disk percentage used by nodes<br />

**PTERODACTYL**:<br />
`{pterodactyl.users}` - Number of current panel users<br />
`{pterodactyl.servers}` - Number of current panel servers<br />

# Support
Need some help setting up Ptero-Status?
Join BlueFox Development's Discord
> [https://discord.gg/KHbBfWSdnZ](https://discord.gg/KHbBfWSdnZ)
 
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
