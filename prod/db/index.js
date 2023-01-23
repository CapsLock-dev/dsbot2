"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStandTeam = exports.updateStand = exports.addStand = exports.getStands = exports.addElementInv = exports.getInventory = exports.removeUser = exports.getExp = exports.getLvl = exports.updateExp = exports.updateLvl = exports.updateBalance = exports.getBalance = exports.addUser = void 0;
const Inventory_1 = require("../commands/classes/Inventory");
const data_1 = require("../commands/standBattles/data");
function addUser(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`INSERT INTO users (id, balance, inventory) VALUES (${id}, 150, ARRAY['']) ON CONFLICT DO NOTHING`);
    });
}
exports.addUser = addUser;
function getBalance(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield pool.query(`SELECT balance FROM users WHERE id='${id}'`);
        return result.rows[0].balance;
    });
}
exports.getBalance = getBalance;
function updateBalance(pool, id, balance) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`UPDATE users SET balance=${balance} WHERE id='${id}'`);
    });
}
exports.updateBalance = updateBalance;
function updateLvl(pool, id, lvl) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`UPDATE users SET lvl=${lvl} WHERE id='${id}'`);
    });
}
exports.updateLvl = updateLvl;
function updateExp(pool, id, exp) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`UPDATE users SET exp=${exp} WHERE id='${id}'`);
    });
}
exports.updateExp = updateExp;
function getLvl(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield pool.query(`SELECT lvl FROM users WHERE id='${id}'`);
        return result.rows[0].lvl;
    });
}
exports.getLvl = getLvl;
function getExp(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield pool.query(`SELECT exp FROM users WHERE id='${id}'`);
        return result.rows[0].exp;
    });
}
exports.getExp = getExp;
function removeUser(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`DELETE FROM users WHERE id='${id}'`);
    });
}
exports.removeUser = removeUser;
function getInventory(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield pool.query(`SELECT inventory FROM users WHERE id='${id}'`);
        if (!result.rows[0].inventory) {
            yield pool.query(`UPDATE users SET inventory=ARRAY[['']] WHERE id='${id}'`);
            result = yield pool.query(`SELECT inventory FROM users WHERE id='${id}'`);
        }
        return new Inventory_1.Inventory(result.rows[0].inventory);
    });
}
exports.getInventory = getInventory;
function addElementInv(pool, id, type, element) {
    return __awaiter(this, void 0, void 0, function* () {
        const inv = (yield getInventory(pool, id));
        element = type + ":" + element;
        inv.push(element);
        let str = '[';
        for (let i = 0; i < inv.array.length - 1; i++) {
            str += i + 1 >= inv.array.length ? "'" + inv.array[i] + "'" : "'" + inv.array[i] + "',";
        }
        str += ']';
        yield pool.query(`UPDATE users SET inventory=ARRAY${str} WHERE id='${id}'`);
    });
}
exports.addElementInv = addElementInv;
function getStands(pool, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const stands = yield pool.query(`SELECT * FROM stands WHERE user_id='${id}'`);
        const array = [];
        for (const stand of stands.rows) {
            array.push(new data_1.standList[stand.name](stand.maxhp, stand.lvl, stand.exp, stand.speed, stand.defence, stand.damage, stand.expPerLvl, stand.usedSkills));
        }
        return array;
    });
}
exports.getStands = getStands;
function addStand(pool, id, stand) {
    return __awaiter(this, void 0, void 0, function* () {
        let team = true;
        if ((yield getStands(pool, id)).length >= 5) {
            team = false;
        }
        yield pool.query(`INSERT INTO stands (user_id, name, maxhp, lvl, exp, speed, defence, damage, expPerLvl, usedSkills, team) VALUES ` +
            `(${id}, '${stand.name}', ${stand.maxhp}, ${stand.lvl}, ${stand.exp}, ${stand.speed}, ${stand.defence}, ${stand.damage}, ${stand.expPerLvl}, ARRAY${skillsToArray(stand.usedSkills)}, ${team})`);
    });
}
exports.addStand = addStand;
function updateStand(pool, id, stand) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`UPDATE stands SET (user_id, name, maxhp, lvl, exp, speed, defence, damage, expPerLvl, usedSkills, team) ` +
            `(${stand.maxhp}, ${stand.lvl}, ${stand.exp}, ${stand.speed}, ${stand.defence}, ${stand.damage}, ${stand.expPerLvl}, ${skillsToArray(stand.usedSkills)}) ` +
            `WHERE user_id='${id}' AND name=${stand.name}`);
    });
}
exports.updateStand = updateStand;
function updateStandTeam(pool, id, name, team) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.query(`UPDATE stands SET team=${team} WHERE user_id='${id}' AND name=${name}`);
    });
}
exports.updateStandTeam = updateStandTeam;
function skillsToArray(skills) {
    let str = '[';
    for (let i = 0; i <= skills.length - 1; i++) {
        str += "'" + (i + 1 >= skills.length ? skills[i].name : skills[i].name) + "'";
        if (i + 1 <= skills.length - 1) {
            str += ',';
        }
    }
    str += ']';
    console.log(str);
    return str;
}
