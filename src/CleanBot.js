
require('dotenv').config()


class CleanBot{

    userdata = require('./database/Users.js');

    constructor(name) {
        this.name = name;
        this.userdata.start();
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
