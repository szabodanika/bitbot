const commands = require('../AnnotationParser');

const Discord = require('discord.js');
const CleanBot = require('../CleanBot');

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

class cleanDiscordBot extends CleanBot {

    currentlyLive = false;
    client = new Discord.Client();

    constructor(name, token, core) {
        super(name);
        this.client.login(token);
        this.core = core;
    }

    run() {
        this.client.on('ready', () => this.ready());
        this.client.on('message', (msg) => this.messageHandler(msg));
        this.client.on('guildMemberAdd', (member) => this.memberJoined(member))
    }

    ready() {
        this.core.ready(this, 'Discord bot connected as ' + this.client.user.tag);
        this.client.user.setPresence({activity: {name: 'type !bbhelp'}, status: 'idle'});
        this.startStreamStatusListener();
    }

    messageHandler(msg) {
        const command = msg.content.trim().toLowerCase().split(' ').join('_');
        const params = command.split(' ');
        let funcname = commands.getFunction(params[0].substr(1));
        try {
            if (funcname != undefined) this[funcname](msg, params.slice(1));
        } catch (e) {
            console.log(funcname + `is not a function`);
        }
    }

    /**
     * @Command('Ping-pong')
     * @Aliases(['p'])
     */
    ping(msg, params) {
        this.say(msg.channel, '...pong');
    }

    /**
     * @Command("Lists all the available commands")
     * @Aliases(['bhelp', 'bb'])
     */
    bbhelp(msg, params) {
        let s = '';
        for (let command of commands.getCommands()) {
            s += `**!${command.name}** `;
            if (command.params != undefined) {
                for (let param of command.params) {
                    s += `[${param}] `
                }
            }
            if (command.aliases.length != 0) {
                let aliases = ''
                for (let alias of command.aliases) {
                    aliases += `, !${alias}`
                }
                s += ` *(${aliases.substr(2)})*`;
            }
            s += `\n*${command.description}*\n`;
        }
        this.say(msg.channel, s);
    }

    /**
     * @Command("Shows info about this bot")
     * @Aliases(['binfo'])
     */
    bbinfo(msg, params) {
        this.say(msg.channel, `Hello! I am BitBot, the entirely unique and custom bot of this server. ` +
            `I have many useful functions, type **!bbhelp** to read all of them!`);
    }

    /**
     * @Command("Checks if there is a Twitch live stream currently")
     * @Aliases(['live'])
     */
    islive(msg, params) {
        this.requestLiveStreamStatus(msg.channel, this);
    }

    /**
     * @Command("Tells you your Bit balance")
     * @Aliases(['bal'])
     */
    balance(msg, params) {
        this.reply(msg, `Your balance is currently **${this.casino.getCashBalance(msg.author)} Bits** in cash and ` +
            `**${this.casino.getBankBalance(msg.author)} Bits** in the bank.`)
    }

    /**
     * @Command("Deposits Bits in the bank. +5% every 24H. Usage: '!deposit 200'")
     * @Aliases(['dep'])
     * @Params(['amount'])
     */
    deposit(msg, params) {
        let amount = parseInt(params[0]);
        if (this.casino.changeBank(msg.author, amount)) {
            this.reply(msg, `You have deposited **${params[0]} Bits**`);
        } else {
            this.reply(msg, `Insufficient funds`);
        }
    }

    /**
     * @Command("Withdraws Bits in the bank. Usage: '!withdraw 200'")
     * @Aliases(['wit'])
     * @Params(['amount'])
     */
    withdraw(msg, params) {
        let amount = parseInt(params[0]);
        if (this.casino.changeBank(msg.author, amount)) {
            this.reply(msg, `You have withdrawn **${params[0]} Bits**`);
        } else {
            tthis.reply(msg, `Insufficient funds`);
        }
    }

    /**
     * @Command("We both roll a d6, whoever rolls higher takes it all. Usage: '!dicebet 50'")
     * @Aliases(['d6'])
     * @Params(['amount'])
     */
    dicebet(msg, params) {
        let amount = parseInt(params[0]);
        let result = this.casino.diceBet(msg.author, amount);
        if (result[2] != -1) {
            if (result[2] < 0) {
                this.reply(msg, `You rolled ${result[0]}, I rolled ${result[1]}. You lost **${-result[2]} Bits**!`);
            } else if (result[2] > 0) {
                this.reply(msg, `You rolled ${result[0]}, I rolled ${result[1]}. You won **${result[2]} Bits**!`);
            } else if (result[2] == 0) {
                this.reply(msg, `You rolled ${result[0]}, I rolled ${result[1]}. Everyone can keep their bits.`);
            }
        } else {
            this.reply(msg, `Insufficient funds`);
        }
    }

    /**
     * @Command("Shows your Bit rank")
     */
    rank(msg, params) {
        let amount = parseInt(params[0]);
        if (this.casino.changeBank(msg.author.id, amount)) {
            this.reply(msg, `You have withdrawn **${params[0]} Bits**`);
        } else {
            this.reply(msg, `Insufficient funds`);
        }
    }

    /**
     * @Command('Shows all the triggers')
     */
    triggers(msg, params) {
        let s = '';
        for (let trigger of commands.getTriggers()) {
            s += `, ${trigger.name.split('_').join(' ')}`;
            if (trigger.aliases.length != undefined) {
                for (let alias of trigger.aliases) {
                    s += `, ${alias.split('_').join(' ')}`;
                }
            }
        }
        this.say(msg.channel, s.substr(2));
    }

    /**
     * @Trigger('yeet')
     */
    yeet(msg) {
        this.say(msg.channel, 'yeet');
    }

    /**
     * @Trigger('nice')
     * @Aliases(['noice', 'cool'])
     */
    nice(msg) {
        this.say(msg.channel, 'nice');
    }

    /**
     * @Trigger('omae wa mou shindeiru')
     */
    omae_wa_mou_shindeiru(msg) {
        this.say(msg.channel, 'nani');
    }

    /**
     * @Trigger('nani')
     */
    nani(msg) {
        this.say(msg.channel, 'omae wa mou shindeiru');
    }

    say(channel, reply) {
        let message = new Discord.MessageEmbed();
        message.setDescription(reply);
        message.setColor('#a760bf')
        channel.send(message);
    }

    reply(msg, reply) {
        this.say(msg.channel, `${msg.author.toString()} ${reply}`)
    }

    memberJoined(member) {
        console.log(`${member.user.username}" has joined ${member.guild.name}`);
        this.casino.addUser(member.user);
    }

    startStreamStatusListener() {
        let thisCleanDiscordBot = this;
        setInterval(function () {
            thisCleanDiscordBot.checkStreamStatus(thisCleanDiscordBot);
        }, 5000);
    }

    requestLiveStreamStatus(channel) {
        var xhr = new XMLHttpRequest();
        let request = `https://api.twitch.tv/helix/streams/?user_login=${process.env.TWITCH_CHANNEL_NAME}`;
        xhr.open("GET", request, true);
        xhr.setRequestHeader('Client-ID', process.env.TWITCH_CLIENT_ID);
        xhr.send();
        let self = this;
        xhr.onload = function () {
            let data = JSON.parse(xhr.responseText);
            if (data['data'].length != 0) {
                self.say(channel, `${process.env.MY_NAME} is currently live!` +
                    `\n Join here: https://www.twitch.tv/${process.env.TWITCH_CHANNEL_NAME}`);
            } else {
                self.say(channel, `${process.env.MY_NAME} is currently not live.`);
            }
        }
    }

    checkStreamStatus(self) {
        var xhr = new XMLHttpRequest();
        let request = `https://api.twitch.tv/helix/streams/?user_login=${process.env.TWITCH_CHANNEL_NAME}`;
        xhr.open("GET", request, true);
        xhr.setRequestHeader('Client-ID', process.env.TWITCH_CLIENT_ID);
        xhr.send();
        xhr.onload = function () {
            let data = JSON.parse(xhr.responseText);
            if (data['data'].length != 0) {
                if (!self.currentlyLive) {
                    self.say(self.client.channels.cache.get(process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID),
                        `${process.env.MY_NAME} is currently live!` +
                        `\n Join here: https://www.twitch.tv/${process.env.TWITCH_CHANNEL_NAME}`);
                    self.currentlyLive = true;
                }
            } else {
                if (self.currentlyLive) self.currentlyLive = false;
            }
        }
    }
}

module.exports = cleanDiscordBot;
