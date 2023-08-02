"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bleed = exports.TimeStop = exports.Afterimage = void 0;
const Stand_1 = require("../Stand");
class Afterimage {
    constructor() {
        this.name = 'Afterimage';
        this.description = 'Повышает уклонение на 10% за единицу разницы скорости';
        this.duration = 2;
        this.preventSwap = false;
        this.evasionBuff = 0;
        this.dispel = Stand_1.DispelType.Normal;
        this.type = Stand_1.EffectType.Once;
    }
    use(target, fight) {
        const e = fight.anotherPlayer(target.user).chosenStand;
        let r = target.speed - e.speed;
        if (r < 0) {
            r = 1;
        }
        target.status.evasion += r * 0.1;
        this.evasionBuff = target.status.evasion;
    }
    end(target, fight) {
        if (target.status.evasion - this.evasionBuff < 0) {
            target.status.evasion = 0;
        }
        else {
            target.status.evasion -= this.evasionBuff;
        }
    }
}
exports.Afterimage = Afterimage;
class TimeStop {
    constructor() {
        this.name = 'Time Stop';
        this.description = 'Замораживает любые действия противника. Усиливается после каждого применения';
        this.duration = 1;
        this.preventSwap = true;
        this.type = Stand_1.EffectType.Once;
    }
    use(user, enemy, fight) {
        this.duration = user.timeStopDuration;
        enemy.getOwner(fight).freezed = true;
    }
    end(user, enemy, fight) {
        enemy.getOwner(fight).freezed = false;
    }
}
exports.TimeStop = TimeStop;
class Bleed {
    constructor() {
        this.name = 'Bleed';
        this.description = 'Наносит переодический урон в 10% от текущего хп';
        this.duration = 5;
        this.preventSwap = false;
        this.dispel = Stand_1.DispelType.Normal;
        this.type = Stand_1.EffectType.Periodic;
    }
    use(target, fight) {
        const currentHp = target.status.hp;
        target.editHp(Math.ceil(currentHp * 0.05), true);
    }
    end(target, fight) {
    }
}
exports.Bleed = Bleed;
