
require('dotenv').config()


class CleanBot{

    casino = require('./database/Users.js');

    constructor(name) {
        this.name = name;
        this.casino.start();
    }

    run(){
        throw new Error('You have to implement the method cleanBot.run!');
    }

    ready(){
        throw new Error('You have to implement the method cleanBot.ready!');
    }

    messageHandler(){
        throw new Error('You have to implement the method cleanBot.messageHandler!');
    }
}

module.exports = CleanBot;
