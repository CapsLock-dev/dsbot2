"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarPlatinum = void 0;
const Stand_1 = require("../Stand");
class StarPlatinum extends Stand_1.Stand {
    constructor(maxhp = 115, lvl = 1, exp = 0, speed = 5, defence = 15, damage = 20, expPerLvl = 100, usedSkills = []) {
        super();
        this.maxhp = maxhp;
        this.lvl = lvl;
        this.exp = exp;
        this.status = null;
        this.speed = speed;
        this.defence = defence;
        this.damage = damage;
        this.expPerLvl = expPerLvl;
        this.skills = new Map([]);
        this.ability = { type: Stand_1.AbilityType.Passive, name: 'Block', description: 'Все атаки пробивают броню', use: undefined, active: true };
        this.infoForAi = { 'counterStands': [], 'role': Stand_1.StandRole.Carry, 'style': Stand_1.StandStyle.DamageDealer };
        this.setup();
        this.setupSkills(usedSkills);
    }
    setup() {
        this.skills.set(1, [
            {
                'name': 'Ora ora ora',
                'description': 'Наносит урон',
                'type': Stand_1.SkillType.Physical,
                'cooldown': 0,
                'use': this.ora_ora_ora,
                'gif': 'https://tenor.com/view/ora-star-platinum-jo-jos-bizarre-adventure-jojo-gif-5505650',
                damage: 1,
            },
            {
                'name': 'Time stop',
                'description': 'Останавливает время и повышает урон на 20%',
                'type': Stand_1.SkillType.Special,
                'cooldown': 3,
                'use': this.time_stop,
                'gif': 'https://tenor.com/view/star-platinum-za-warduo-gif-26209527',
                damage: 0,
            },
            {
                'name': 'Starfinger',
                'description': 'Наносит урон. Пробивает броню, проходит сквозь уклонение',
                'type': Stand_1.SkillType.Physical,
                'cooldown': 0,
                'use': this.starfinger,
                'gif': 'https://tenor.com/view/star-finger-long-fingers-star-platinum-jojo-bizzare-adventure-stardust-crusaders-gif-23788395',
                damage: 1,
            },
            {
                'name': 'Buff',
                'description': '',
                'type': Stand_1.SkillType.Physical,
                'cooldown': 99999,
                'use': this.buff,
                damage: 0,
            }
        ]);
    }
    ora_ora_ora(fight, enemy, self) {
        const status = self.status;
        return this.hit(status.damage, false, false);
    }
    time_stop(fight, enemy, self) {
        const status = self.status;
        return true;
    }
    starfinger(fight, enemy, self) {
        const status = self.status;
        return false;
    }
    buff(fight, enemy, self) {
        const status = self.status;
        return true;
    }
}
exports.StarPlatinum = StarPlatinum;
