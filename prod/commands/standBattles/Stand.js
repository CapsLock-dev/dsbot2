"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbilityType = exports.defaultValues = exports.DispelType = exports.EffectType = exports.SkillType = exports.StandStyle = exports.StandRole = exports.Stand = void 0;
class Stand {
    startFight() {
        this.status = {
            maxhp: this.maxhp,
            hp: this.maxhp,
            speed: this.speed,
            defence: this.defence,
            evasion: 0,
            damage: this.damage,
            effects: [],
            cooldowns: []
        };
    }
    addExp(exp) {
        if (this.exp + exp >= this.expPerLvl) {
            this.exp += exp - this.expPerLvl;
            this.expPerLvl = exports.defaultValues.expPerLvlMultiplier;
        }
        else {
            this.exp += exp;
        }
    }
    setupSkills(skillNames) {
        if (skillNames.length == 0) {
            const skills = this.skills.get(1);
            this.usedSkills = skills;
        }
        else {
            for (const key of [...this.skills.keys()]) {
                const skills = this.skills.get(key);
                skills.forEach(el => {
                    if (skillNames.includes(el.name)) {
                        skillNames.splice(skillNames.indexOf(el.name), 1);
                        this.usedSkills.push(el);
                    }
                });
            }
        }
    }
    getCooldown(skill) {
        var _a;
        const cd = (_a = this.status) === null || _a === void 0 ? void 0 : _a.cooldowns.find(e => { e.skill = skill; });
        if (cd) {
            return cd.cd;
        }
        return 0;
    }
    addCooldown(skill) {
        var _a;
        (_a = this.status) === null || _a === void 0 ? void 0 : _a.cooldowns.push({ skill: skill, cd: skill.cooldown });
    }
    removeCooldown(skill) {
        this.status.cooldowns = this.status.cooldowns.filter(s => s.skill != skill);
    }
    removeAllCooldowns() {
        this.status.cooldowns = [];
    }
    update() {
        for (const entry of this.status.cooldowns) {
            entry.cd -= 1;
        }
        for (const effect of this.status.effects) {
            effect.duration -= 1;
        }
        this.status.cooldowns = this.status.cooldowns.filter(e => e.cd > 0);
        this.status.effects = this.status.effects.filter(e => e.duration > 0);
    }
    hit(dmg, ignoreDef, canMiss) {
        const evasion = this.status.evasion;
        if (canMiss || evasion <= 0) {
            if (Math.random() > evasion) {
                this.editHp(-dmg, ignoreDef);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            this.editHp(-dmg, ignoreDef);
            return true;
        }
    }
    addEffect(effect) {
        var _a, _b;
        (_b = (_a = this.status) === null || _a === void 0 ? void 0 : _a.effects) === null || _b === void 0 ? void 0 : _b.push(effect);
        return true;
    }
    purgeEffects() {
        this.status.effects = [];
    }
    editHp(value, ignoreDef) {
        var _a;
        if (!ignoreDef) {
            value -= value * this.defence / 100;
        }
        if (this.status.hp - value > 0) {
            this.status.hp -= value;
        }
        else {
            this.status.hp = 0;
        }
        console.log((_a = this.status) === null || _a === void 0 ? void 0 : _a.hp);
    }
    editDefence(value) {
        if (this.status.defence + value < 0) {
            this.status.defence = 0;
        }
        else {
            this.status.defence += value;
        }
        return true;
    }
    editDamage(value) {
        if (this.status.damage + value < 0) {
            this.status.damage = 0;
        }
        else {
            this.status.damage += value;
        }
        return true;
    }
    editSpeed(value) {
        if (this.status.speed + value < 0) {
            this.status.speed = 0;
        }
        else {
            this.status.speed += value;
        }
        return true;
    }
    getOwner(fight) {
        return fight.anotherPlayer(fight.anotherPlayer(this.ownerId));
    }
    isDead() {
        return this.status.hp <= 0;
    }
}
exports.Stand = Stand;
var StandRole;
(function (StandRole) {
    StandRole[StandRole["Support"] = 0] = "Support";
    StandRole[StandRole["Tank"] = 1] = "Tank";
    StandRole[StandRole["Carry"] = 2] = "Carry";
})(StandRole = exports.StandRole || (exports.StandRole = {}));
var StandStyle;
(function (StandStyle) {
    StandStyle[StandStyle["DamageDealer"] = 0] = "DamageDealer";
    StandStyle[StandStyle["Debuffer"] = 1] = "Debuffer";
    StandStyle[StandStyle["Buffer"] = 2] = "Buffer";
    StandStyle[StandStyle["Killer"] = 3] = "Killer";
    StandStyle[StandStyle["Disabler"] = 4] = "Disabler";
    StandStyle[StandStyle["Procast"] = 5] = "Procast";
    StandStyle[StandStyle["Exchange"] = 6] = "Exchange";
})(StandStyle = exports.StandStyle || (exports.StandStyle = {}));
var SkillType;
(function (SkillType) {
    SkillType[SkillType["Physical"] = 0] = "Physical";
    SkillType[SkillType["Special"] = 1] = "Special";
})(SkillType = exports.SkillType || (exports.SkillType = {}));
var EffectType;
(function (EffectType) {
    EffectType[EffectType["OnSwap"] = 0] = "OnSwap";
    EffectType[EffectType["Once"] = 1] = "Once";
    EffectType[EffectType["Periodic"] = 2] = "Periodic";
})(EffectType = exports.EffectType || (exports.EffectType = {}));
var DispelType;
(function (DispelType) {
    DispelType[DispelType["Normal"] = 0] = "Normal";
    DispelType[DispelType["Strong"] = 1] = "Strong";
    DispelType[DispelType["Death"] = 2] = "Death";
})(DispelType = exports.DispelType || (exports.DispelType = {}));
exports.defaultValues = {
    expPerLvl: 100,
    expPerLvlMultiplier: 100
};
var AbilityType;
(function (AbilityType) {
    AbilityType[AbilityType["Battlecry"] = 0] = "Battlecry";
    AbilityType[AbilityType["Passive"] = 1] = "Passive";
    AbilityType[AbilityType["Deathcry"] = 2] = "Deathcry";
})(AbilityType = exports.AbilityType || (exports.AbilityType = {}));
