
const fs = require('fs')
let path = require('path');
let read;
let file;

function start() {
    read = fs.readFileSync(path.join(__dirname, '../../data/users.json'));
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

function addMoney(user, amount) {
    return changeMoney(user, amount);
}

function takeMoney(user, amount) {
    return changeMoney(user, -amount);
}

function changeMoney(user, amount) {
    checkUserExists(user)
    if(getCashBalance(user) + amount < 0) return false;
    file[user.id]['balance'] += amount;
    sync()
    return true;
}

function deposit(user, amount){
    return changeBank(user, amount);
}

function withdraw(user, amount){
    return changeBank(user, -amount);
}

function changeBank(user, amount) {
    checkUserExists(user)
    if ((amount > 0 && amount <= getCashBalance(user)) || (amount < 0 && amount <= getBankBalance(user))) {
        file[user.id]['balance'] -= amount;
        file[user.id]['bank'] += amount;
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

function diceBet(user, amount) {
    checkUserExists(user);
    if(getCashBalance(user) < amount) return [0,0,-1];
    let botroll = Math.floor(Math.random()*6)+1;
    let userroll = Math.floor(Math.random()*6)+1;

    if(botroll > userroll){
        takeMoney(user, amount);
        return [userroll, botroll, -amount];
    }  else if(botroll < userroll){
        addMoney(user, amount);
        return [userroll, botroll, amount];
    } else if(botroll == userroll) return [userroll, botroll, 0];
    sync();
}

function getCombinedBalance(user){
    return getBankBalance(user) + getCashBalance(user);
}

function getCashBalance(user) {
    checkUserExists(user);
    return file[user.id]['balance'];
}

function getBankBalance(user) {
    checkUserExists(user);
    return file[user.id]['bank'];
}

function checkUserExists(user) {
    if (file[user.id] == null) addUser(user);
}

function sync() {
    fs.writeFileSync(path.join(__dirname, '../../data/users.json'), JSON.stringify(file, null, 2));
}

module.exports = {
    start: start,
    addUser: addUser,
    addMoney: addMoney,
    takeMoney: takeMoney,
    deposit: deposit,
    withdraw: withdraw,
    getCashBalance: getCashBalance,
    getBankBalance: getBankBalance,
    getCombinedBalance: getCombinedBalance,
    checkUserExists: checkUserExists,
    diceBet: diceBet
};
