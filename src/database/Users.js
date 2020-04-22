
const fs = require('fs')
let path;
let read;
let file;

function start() {
    path = './data/users.json'
    read = fs.readFileSync(path);
    file = JSON.parse(read);
    setInterval(bankAddInterest, 86400000);
}

function addUser(user) {
    file[user.id] = {
        name: user.username,
        balance: 100.0,
        bank: 0.0
    };
    sync()
}

function changeMoney(user, val) {
    checkUserExists(user)
    file[user.id]['balance'] += val;
    sync()
}

function changeBank(user) {
    checkUserExists(user)
    if (val > 0 && val <= this.getCashBalance(user)) {
        file[user.id]['balance'] -= val;
        file[user.id]['bank'] += val;
    } else if (val > 0 && val <= this.getCashBalance(user)) {
        file[user.id]['balance'] += val;
        file[user.id]['bank'] -= val;
    } else {
        return false;
    }
    sync();
    return true;
}

function bankAddInterest() {
    for (var a in file) {
        if(file.hasOwnProperty(a)) {
            file[a]['bank'] *= 1.05;
        }
    }
    sync();
}

function diceBet(user) {
    checkUserExists(user);
    if(getCashBalance(user) < amount) return [0,0,-1];
    let botroll = Math.floor(Math.random()*6)+1;
    let userroll = Math.floor(Math.random()*6)+1;

    if(botroll > userroll){
        changeMoney(user, -amount);
        return [userroll, botroll, -amount];
    }  else if(botroll < userroll){
        changeMoney(user, amount);
        return [userroll, botroll, amount];
    } else if(botroll == userroll) return [userroll, botroll, 0];
    sync();
}

function getCashBalance(user) {
    checkUserExists(user);
    return Math.round(file[user.id]['balance'] * 100) / 100;
}

function getBankBalance(user) {
    checkUserExists(user);
    return Math.round(file[user.id]['bank'] * 100) / 100;
}

function checkUserExists(user) {
    if (file[user.id] == null) addUser(user);
}

function sync() {
    fs.writeFileSync(path, JSON.stringify(file, null, 2));
}

module.exports = {
    start: start,
    addUser: addUser,
    changeMoney: changeMoney,
    changeBank: changeBank,
    getCashBalance: getCashBalance,
    getBankBalance: getBankBalance,
    checkUserExists: checkUserExists,
    diceBet: diceBet
};
