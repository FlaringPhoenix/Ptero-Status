# PteroStatus

PteroStatus is an easy to setup [pterodactyl](https://github.com/pterodactyl/panel) daemon status project. It will continuously update a discord embed with live stats from your daemons.

## Preview

![Preview](https://i.gyazo.com/fe785175ce3e08ece87ab234df6993ed.png)

## Installation

Run the following command to install the npm package

```bash
npm i pterostatus
```

## Usage

### Node:
```javascript
const Status = require('pterostatus');

const Daemon = new Status.Daemon("Node1", 15000, {
    ip: "CONTROLLER-IP",
    port: "CONTROLLER-PORT"
});
```

### Panel:
```javascript
const Status = require('pterostatus');

const Controller = new Status.Controller(4000, {
    token: "BOT-TOKEN",
    guildID: 'GUILD-ID',
    channelID: 'CHANNEL-ID',
    color: '#06cce2', // Embed color
    pterodactyl: {
        panel: "https://panel.domain.com",
        apiKey: "API-KEY",
    },
    node: {
        message: '[Memory: {node.memory.used/{node.memory.total}] [Disk: {node.disk.used}/{node.disk.total}]',
        online: '🟢 **ONLINE**',
        offline: '🔴 **OFFLINE**'
    },
    embed: {
        color: '#06cce2',
        title: 'Node Status [{nodes.total} nodes]',
        description: '**Nodes**:\n{nodes.list}\n\n**Total**:\nMemory: {memory.used}/{memory.total}\nDisk: {disk.used}/{disk.total}\n\n**Pterodactyl:**\nUsers: {pterodactyl.users}\nServers: {pterodactyl.servers}'
    },
    interval: 15000
});
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)