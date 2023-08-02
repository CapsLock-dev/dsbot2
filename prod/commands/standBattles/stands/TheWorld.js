"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheWorld = void 0;
const Stand_1 = require("../Stand");
class TheWorld extends Stand_1.Stand {
    constructor(maxhp = 115, lvl = 1, exp = 0, speed = 5, defence = 15, damage = 20, expPerLvl = 100, usedSkills = []) {
        super();
        this.timeStopDuration = 1;
        this.name = 'The World';
        this.maxhp = maxhp;
        this.lvl = lvl;
        this.exp = exp;
        this.status = null;
        this.speed = speed;
        this.defence = defence;
        this.damage = damage;
        this.expPerLvl = expPerLvl;
        this.skills = new Map([]);
        this.ability = { type: Stand_1.AbilityType.Passive, name: 'Vampire', description: 'Восстанавливает здоровье при добивании стенда', use: undefined, active: true };
        this.infoForAi = { 'counterStands': [], 'role': Stand_1.StandRole.Carry, 'style': Stand_1.StandStyle.DamageDealer };
        this.setup();
        this.setupSkills(usedSkills);
    }
    setup() {
        this.skills.set(1, [
            {
                'name': 'Muda muda muda',
                'description': 'Наносит урон',
                'type': Stand_1.SkillType.Physical,
                'cooldown': 0,
                'use': this.muda_muda_muda,
                'gif': 'https://tenor.com/view/muda-the-world-punch-jo-jos-bizarre-adventure-gif-12851143',
                damage: 1,
            },
            {
                'name': 'Time stop',
                'description': 'Останавливает время и повышает урон на 20%',
                'type': Stand_1.SkillType.Special,
                'cooldown': 3,
                'use': this.time_stop,
                'gif': 'https://tenor.com/view/time-stop-freeze-dio-discord-the-world-jojos-bizarre-adventure-gif-17873358',
                damage: 0,
            },
            {
                'name': 'Roadroller',
                'description': 'Наносит урон. Пробивает броню, проходит сквозь уклонение',
                'type': Stand_1.SkillType.Physical,
                'cooldown': 0,
                'use': this.roadroller,
                damage: 1,
                'gif': 'https://tenor.com/view/anime-dio-brando-dio-the-invader-manga-series-road-roller-gif-16677670',
            },
            {
                'name': 'Throw knife',
                'description': 'Наносит урон. Накладывает на противника кровотечение',
                'type': Stand_1.SkillType.Special,
                'cooldown': 99999,
                'use': this.throw_knife,
                'gif': 'https://tenor.com/view/dio-the-world-dagger-throw-gif-13331615',
                damage: 1,
            }
        ]);
    }
    muda_muda_muda(fight, enemy, self) {
        const status = self.status;
        return enemy.hit(status.damage, false, false);
    }
    time_stop(fight, enemy, self) {
        const status = self.status;
        return true;
    }
    roadroller(fight, enemy, self) {
        const status = self.status;
        return false;
    }
    throw_knife(fight, enemy, self) {
        const status = self.status;
        return true;
    }
}
exports.TheWorld = TheWorld;
