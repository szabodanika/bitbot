const commands = require('../AnnotationParser');

const Discord = require('discord.js');
const CleanBot = require('../CleanBot');

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

class cleanDiscordBot extends CleanBot {

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
        //10% chance of getting 1 to 20 bits, so average 1 bit per message
        if (Math.random() > 0.9) {
            this.userdata.addMoney(msg.author, Math.floor(1 + Math.random() * 20));
        }
        const command = msg.content.trim().toLowerCase();
        const params = command.split(' ');
        let funcname = commands.getFunction(command);

        let com = commands.findCommand(funcname);
        let allowed = false;
        if(com != undefined && com.ranksallowed != null){
            for(let rank of com.ranksallowed){
                if(msg.member.roles.cache.has(rank)){
                    allowed = true;
                }
            }
        } else allowed = true;
        if(!allowed) return;

        try {
            if (funcname != undefined) this[funcname](msg, params.slice(1));
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * @Command(':crossed_swords: Ping-pong')
     * @Aliases(['p'])
     * @RanksAllowed(['662737409733034042'])
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
            if (command.visible) {
                let allowed = false;
                if(command.ranksallowed != null){
                    for(let rank of command.ranksallowed){
                        if(msg.member.roles.cache.has(rank)){
                            allowed = true;
                        }
                    }
                } else allowed = true;
                if(!allowed) continue;
                s += `**!${command.name}** `;
                if (command.params != undefined) {
                    for (let param of command.params) {
                        s += `[${param}] `
                    }
                }
                if (command.aliases.length != 0) {
                    let aliases = '';
                    for (let alias of command.aliases) {
                        aliases += `, !${alias}`
                    }
                    s += ` *(${aliases.substr(2)})*`;
                }
                s += `\n*${command.description}*\n`;
            }
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
     * @Aliases(['bal','bits'])
     */
    balance(msg, params) {
        this.reply(msg, `Your balance is currently **${this.userdata.getCashBalance(msg.author)} Bits** in cash and ` +
            `**${this.userdata.getBankBalance(msg.author)} Bits** in the bank.`)
    }

    /**
     * @Command("Deposits Bits in the bank. +5% every 24H. Usage: '!deposit 200'")
     * @Aliases(['dep'])
     * @Params(['amount'])
     */
    deposit(msg, params) {
        var amount;
        if (params[0] == 'all') {
            amount = this.userdata.getCashBalance(msg.author);
        } else {
            amount = parseInt(params[0]);
        }

        if (this.userdata.deposit(msg.author, amount)) {
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
        var amount;
        if (params[0] == 'all') {
            amount = this.userdata.getBankBalance(msg.author);
        } else {
            amount = parseInt(params[0]);
        }

        if (this.userdata.withdraw(msg.author, amount)) {
            this.reply(msg, `You have withdrawn **${params[0]} Bits**`);
        } else {
            this.reply(msg, `Insufficient funds`);
        }
    }

    /**
     * @Command(':crossed_swords: Give cash to user')
     * @Params(['user', 'amount'])
     * @RanksAllowed(['662737409733034042'])
     */
    givebit(msg, params) {
        let amount = parseInt(params[1]);
        let user = msg.mentions.users.first();
        if(user == undefined) this.say(msg.channel, `User not found`);
        if(this.userdata.addMoney(user, amount)){
            this.say(msg.channel, `Successfully gave ${user.username} ${amount} Bits`);
        } else {
            this.say(msg.channel, `Could not give Bits to ${user.username}`);
        }
    }

    /**
    * @Command(':crossed_swords:  Take cash from user')
    * @Params(['user', 'amount'])
    * @RanksAllowed(['662737409733034042'])
    */
    takebits(msg, params) {
        let amount = parseInt(params[1]);
        let user = msg.mentions.users.first();
        if(user == undefined) this.say(msg.channel, `User not found`);
        if(this.userdata.takeMoney(user, amount)){
            this.say(msg.channel, `Successfully took ${user.username}'s ${amount} Bits`);
        } else {
            this.say(msg.channel, `Could not take ${amount} Bits from ${user.username}`);
        }
    }

    /**
     * @Command(':crossed_swords:  Resets user\'s balance to the defailt 100 Bits cash and 0 Bits in bank')
     * @Params(['user'])
     * @RanksAllowed(['662737409733034042'])
     */
    resetbalance(msg, params) {
        let user = msg.mentions.users.first();
        if(user == undefined) this.say(msg.channel, `User not found`);
        if(this.userdata.resetBalance(user)){
            this.say(msg.channel, `Successfully reset ${user.username}'s balance`);
        } else {
            this.say(msg.channel, `Could not reset ${user.username}'s balance`);
        }
    }

    /**
     * @Command(':crossed_swords:  Shows a user\'s balance')
     * @Params(['user'])
     * @RanksAllowed(['662737409733034042'])
     */
    getbalance(msg, params) {
        let user = msg.mentions.users.first();
        if(user == undefined) this.say(msg.channel, `User not found`);
        else this.say(msg.channel, `${user.username}'s balance is currently **${this.userdata.getCashBalance(user)} Bits** in cash and ` +
            `**${this.userdata.getBankBalance(user)} Bits** in the bank.`)
    }


    /**
     * @Command("We both roll a d6, whoever rolls higher takes it all. Usage: '!dicebet 50'")
     * @Aliases(['d6'])
     * @Params(['amount'])
     */
    dicebet(msg, params) {
        var amount;
        if (params[0] == 'all') {
            amount = this.userdata.getCashBalance(msg.author);
        } else {
            amount = parseInt(params[0]);
        }
        let result = this.userdata.diceBet(msg.author, amount);
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
     * @Command("Shows all lottery prizes and their probabilities")
     */
    lotteryhelp(msg, params) {
        let s = `**Probabilities **
        50 Bits   -   22.5%
        100 Bits   -   11.25%
        clean-boi role   -   4.5%
        clean-bigboi role   -   1.41%
        clean-veteran role   -   0.45%
        clean-member role   -   0.14%`;
        this.say(msg.channel, s)
    }

    /**
     * @Command("Costs 25 Bits and you get a change for winning cool prizes. Type '!lotteryhelp'")
     * @Aliases(['lot'])
     */
    lottery(msg, params) {
        if (this.userdata.takeMoney(msg.author, 25)) {
            let result = Math.random();
            if (result < 0.0014) {
                if (!msg.member.roles.cache.has('662737796330684540')) {
                    msg.member.roles.add('662737796330684540');
                    this.reply(msg, `You won **clean-member role**`);
                } else {
                    this.userdata.addMoney(msg.author, 50);
                    this.reply(msg, `You won **50 Bits**`);
                }
            } else if (result < 0.0059) {
                if (!msg.member.roles.cache.has('703697642173235230')) {
                    msg.member.roles.add('703697642173235230');
                    this.reply(msg, `You won **clean-veteran role**`);
                } else {
                    this.userdata.addMoney(msg.author, 50);
                    this.reply(msg, `You won **50 Bits**`);
                }
            } else if (result < 0.02) {
                if (!msg.member.roles.cache.has('703700108180586606')) {
                    msg.member.roles.add('703700108180586606');
                    this.reply(msg, `You won **clean-bigboi role**`);
                } else {
                    this.userdata.addMoney(msg.author, 50);
                    this.reply(msg, `You won **50 Bits**`);
                }
            } else if (result < 0.065) {
                if (!msg.member.roles.cache.has('703669905110597692')) {
                    msg.member.roles.add('703669905110597692');
                    this.reply(msg, `You won **clean-boi role**`);
                } else {
                    this.userdata.addMoney(msg.author, 50);
                    this.reply(msg, `You won **50 Bits**`);
                }

            } else if (result < 0.1775) {
                this.userdata.addMoney(msg.author, 100);
                this.reply(msg, `You won **100 Bits**`);
            } else if (result < 0.4025) {
                this.userdata.addMoney(msg.author, 50);
                this.reply(msg, `You won **50 Bits**`);
            } else if (result < 1) {
                this.reply(msg, `You won didn't win anything this time :(`);
            }
        } else {
            this.reply(msg, `Insufficient funds`);
        }
    }

    /**
     * @Command("Spend your bits on a fancy rank. '!rankprices' for prices")
     * @Aliases(['brole', 'buyrank'])
     * @Params(['role name'])
     */
    buyrole(msg, params) {
        let rank = params[0];
        if (msg.member.roles.cache.has(rank)) {
            this.reply(msg, `You already have the rank **${rank}**`);
            return;
        }
        let self = this;
        var role, price;
        if (rank == 'clean-boi') {
            role = '703669905110597692';
            price = 250;
        } else if (rank == 'clean-bigboi') {
            role = '703700108180586606';
            price = 800;
        } else if (rank == 'clean-veteran') {
            role = '703697642173235230';
            price = 2500;
        } else if (rank == 'clean-member') {
            role = '662737796330684540';
            price = 8000;
        }
        if (self.userdata.takeMoney(msg.author, 500)) {
            msg.member.roles.add([role]).then(new function () {
                self.reply(msg, `You have bought the rank **${rank}**`);
            }).catch(new function () {
                self.userdata.addMoney(msg.author, price);
            });
        } else {
            this.reply(msg, `Insufficient funds`);
        }
    }

    /**
     * @Command("Lists the prices of all purchasable ranks")
     * @Aliases(['roles'])
     */
    rankprices(msg, params) {
        let s = `:one: **clean-member**\n  8000 Bits\n`;
        s += `:two: **clean-veteran**\n  2500 Bits\n`;
        s += `:three: **clean-bigboi**\n  800 Bits\n`;
        s += `:four: **clean-boi**\n  250 Bits\n`;
        this.say(msg.channel, s);
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
     * @Command('Shows all the triggers')
     * @Hidden
     */
    version(msg, params) {
        this.say(msg.channel, `BitBot v${this.buildVersion}`);
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
        message.setColor('#a760bf');
        channel.send(message);
        console.log(`DISCORD: ${message.description}`);
    }

    reply(msg, reply) {
        this.say(msg.channel, `${msg.author.toString()} ${reply}`)
    }

    memberJoined(member) {
        console.log(`DISCORD: ${member.user.username}" has joined ${member.guild.name}`);
        this.userdata.addUser(member.user);
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
            if (data != undefined && data['data'].length != 0) {
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
            if (data != null && data['data'].length != 0) {
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
