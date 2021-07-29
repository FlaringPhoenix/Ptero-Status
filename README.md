# Ptero-Status
![](https://img.shields.io/github/stars/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/github/forks/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/github/issues/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/github/license/BlueFox-Development/Ptero-Status) ![](https://img.shields.io/discord/870418236078960791)

# About
PteroStatus is an easy to setup [pterodactyl](https://github.com/pterodactyl/panel) daemon status project. It will continuously update a discord embed with live stats from your daemons.

## Preview

![Preview](https://i.gyazo.com/fe785175ce3e08ece87ab234df6993ed.png)

# Installation

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
        message: '**{node.name}**: [Memory: {node.memory.used/{node.memory.total}] [Disk: {node.disk.used}/{node.disk.total}]',
        online: '🟢 **ONLINE**',
        offline: '🔴 **OFFLINE**'
    },
    embed: {
        color: '#06cce2',
        title: 'Node Status [{nodes.total} nodes]',
        description: '**Nodes**:\n{nodes.list}\n\n**Total**:\nMemory: {memory.used}/{memory.total}\nDisk: {disk.used}/{disk.total}\n\n**Pterodactyl:**\nUsers: {pterodactyl.users}\nServers: {pterodactyl.servers}',
        footer: {
            text: 'Last updated: {lastupdated}',
            icon: 'https://i.imgur.com/9b1qwml.jpg'
        }
    },
    interval: 15000
});
```


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
`{pterodactyl.locations}` - Number of current panel locations<br />

**DATES**:<br />
`{lastupdated}` - Last updated time<br />
`{lastupdated.date}` - Currently day of the month<br />
`{lastupdated.month}` - Current month of the year<br />
`{lastupdated.hours}` - Current hour of the day<br />
`{lastupdated.minutes}` - Current minute of the hour<br />
`{lastupdated.seconds}` - Current second of hour<br />
`{lastupdated.year}` - Current year<br />

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
