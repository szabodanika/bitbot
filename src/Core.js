
require('dotenv').config({path: __dirname +'/.env'});

class Core{

    run(){
        this.startDiscordBot()
        this.startTwitchBot()
    }

    startTwitchBot(){
        const twitchBot = require('./twitch/CleanTwitchBot');
        this.twitch = new twitchBot("Discord Bot",
            process.env.TWITCH_BOT_USERNAME,
            process.env.TWITCH_OAUTH_TOKEN,
            process.env.TWITCH_CHANNEL_NAME,
            this
        );
        this.twitch.run();
    }

    startDiscordBot(){
        const discordBot = require('./discord/CleanDiscordBot');
        this.discord = new discordBot("Twitch Bot",
            process.env.DISCORD_TOKEN,
            this);
        this.discord.run();
    }

    ready(bot, message){
        console.log(bot.name + " : " + message);
    }
}

new Core().run();

