const tmi = require('tmi.js');
const CleanBot = require('../CleanBot');

class cleanTwitchBot extends CleanBot {

    constructor(name, username, password, channel, core) {
        super(name);
        this.opts = {
            identity: {username: username, password: password},
            channels: [channel]
        };
        this.core = core;
    }

    run() {
        this.client = new tmi.client(this.opts);
        this.client.on('chat', (target, context, msg, self) => this.messageHandler(target, context, msg, self));
        this.client.on('connected', (addr, port) => this.ready(addr, port));
        this.client.connect();
    }

    ready(addr, port) {
        this.core.ready(this, 'Twitch bot connected to ' + addr + ":" + port);
    }

    messageHandler(target, context, msg, self) {
        try {
            if (self) return;
            const command = msg.trim();
            if (command.startsWith('!ping')) {
                this.client.say(target, 'pong');
            }
            if (command.startsWith('!islive')) {
                this.client.say(target, this.getStreamStatusString())
            }
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = cleanTwitchBot;
