var path = require('path');

const Registry = require('../lib/registry')
const Reader = require('../lib/reader')
const registry = new Registry()
const reader = new Reader(registry)

registry.registerAnnotation(path.join(__dirname, '/annotations/CommandAnnotation.js'));
registry.registerAnnotation(path.join(__dirname, '/annotations/TriggerAnnotation.js'));
registry.registerAnnotation(path.join(__dirname, '/annotations/AliasAnnotation.js'));
registry.registerAnnotation(path.join(__dirname, '/annotations/ParamsAnnotation.js'));

reader.parse(path.join(__dirname, '/discord/cleanDiscordBot.js'));


let commands = [];
let triggers = [];

load();

function getFunction(command) {
    foundcommand = findCommand(command);
    foundtrigger = findTrigger(command);
    if(foundcommand != undefined) return foundcommand.name;
    if(foundtrigger != undefined) return '!' + foundtrigger.name;
}

function load() {
    getCommands();
    getTriggers();
}

function getCommands() {
    if(commands.length == 0){
        const methodAnnotations = reader.methodAnnotations;
        methodAnnotations.forEach((annotation) => {
            if(annotation.constructor.name == 'Command'){
                if(findCommand(annotation.target) == undefined){
                    addCommand(annotation.target, annotation.value);
                }
            } else if(annotation.constructor.name == 'Aliases'){
                if(findCommand(annotation.target) != undefined){
                    addCommandAliases(annotation.target, annotation.value);
                }
            } else if(annotation.constructor.name == 'Params'){
                if(findCommand(annotation.target) != undefined){
                    addParams(annotation.target, annotation.value);
                }
            }
        });
    }
    return commands;
};

function getTriggers() {
    if(triggers.length == 0){
        const methodAnnotations = reader.methodAnnotations;
        methodAnnotations.forEach((annotation) => {
            if(annotation.constructor.name == 'Trigger'){
                if(findTrigger(annotation.target) == undefined){
                    addTrigger(annotation.target, annotation.value);
                }
            } else if(annotation.constructor.name == 'Aliases'){
                if(findTrigger(annotation.target) != undefined){
                    addTriggerAliases(annotation.target, annotation.value);
                }
            }
        });
    }
    return triggers;
};

function addCommandAliases(name, aliases) {
    commands[getCommandIndex(name)].aliases = aliases;
}

function addTriggerAliases(name, aliases) {
    triggers[getTriggerIndex(name)].aliases = aliases;
}

function addParams(name, params) {
    commands[getCommandIndex(name)].params = params;
}

function addCommand(name, description) {
    commands.push({
        name: name,
        aliases: [],
        description: description
    });
}

function addTrigger(name) {
    triggers.push({
        name: name,
        aliases: [],
    });
}

function findCommand(name){
    for(let c of commands){
        if(c.name == name) return c;
        if(c.aliases != undefined && c.aliases.length != 0){
            for(let a of c.aliases){
                if(a == name) return c;
            }
        }
    }
}

function findTrigger(name){
    for(let t of triggers){
        if(t.name == name) return t;
        if(t.aliases != undefined && t.aliases.length != 0){
            for(let a of t.aliases){
                if(a == name) return t;
            }
        }
    }
}

function getCommandIndex(name){
    for (let i = 0; i < commands.length; i++) {
        if(commands[i].name == name) return i;
    }
}

function getTriggerIndex(name){
    for (let i = 0; i < triggers.length; i++) {
        if(triggers[i].name == name) return i;
    }
}

module.exports = {
    getCommands: getCommands,
    getTriggers: getTriggers,
    getFunction: getFunction
};
