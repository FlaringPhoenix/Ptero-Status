# Ptero-Status

Ptero-Status is an easy to setup [pterodactyl](https://github.com/pterodactyl/panel) daemon status project. It will continuously update a discord embed with live stats from your daemons.

## Preview

![Preview](https://i.gyazo.com/fe785175ce3e08ece87ab234df6993ed.png)

## Installation

Run the following command to install the npm package

```bash
npm i ptero-status
```

## Usage

### Node:
```javascript
const Status = require('ptero-status');

const Daemon = new Status.Daemon("Node1", 15000, {
    ip: "PANEL-IP",
    port: "PANEL-PORT"
});
```

### Panel:
```javascript
const Status = require('ptero-status');

const Panel = new Status.Panel(4000, {
    token: "BOT-TOKEN",
    guildID: 'GUILD-ID',
    channelID: 'CHANNEL-ID',
    color: '#06cce2', // Embed color
    interval: 15000
});
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)