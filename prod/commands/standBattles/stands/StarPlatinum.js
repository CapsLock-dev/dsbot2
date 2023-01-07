"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Starplatinum = void 0;
const Stand_1 = require("../Stand");
class Starplatinum extends Stand_1.Stand {
    constructor(maxhp = 100, lvl = 1, exp = 0, speed = 5, defence = 0, damage = 5, expPerLvl = 100, usedSkills = []) {
        super();
        this.maxhp = maxhp;
        this.lvl = lvl;
        this.exp = exp;
        this.speed = speed;
        this.defence = defence;
        this.damage = damage;
        this.expPerLvl = expPerLvl;
        this.usedSkills = usedSkills;
    }
}
exports.Starplatinum = Starplatinum;
