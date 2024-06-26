"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SilverChariot = void 0;
const Stand_1 = require("../Stand");
const effects_1 = require("../effects/effects");
class SilverChariot extends Stand_1.Stand {
    constructor(maxhp = 100, lvl = 1, exp = 0, speed = 5.5, defence = 20, damage = 20, expPerLvl = Stand_1.defaultValues.expPerLvl, usedSkills = []) {
        super();
        this.hasRapier = true;
        this.ownerId = '';
        this.gifLink = '';
        this.image = 'https://static.wikia.nocookie.net/jjba/images/8/88/SilverChariot_AnimeAV.png/revision/latest/scale-to-width-down/270?cb=20160414095744';
        this.name = 'Silver Chariot';
        this.maxhp = maxhp;
        this.lvl = lvl;
        this.exp = exp;
        this.status = null;
        this.speed = speed;
        this.defence = defence;
        this.damage = damage;
        this.expPerLvl = expPerLvl;
        this.skills = new Map([]);
        this.ability = { type: Stand_1.AbilityType.Passive, name: 'Rapier', description: 'Все атаки пробивают броню', use: undefined, active: true };
        this.infoForAi = { 'counterStands': [], 'role': Stand_1.StandRole.Carry, 'style': Stand_1.StandStyle.DamageDealer };
        this.setup();
        this.setupSkills(usedSkills);
    }
    setup() {
        this.skills.set(1, [
            {
                'name': 'Rapier hit',
                'description': 'Наносит урон',
                'type': Stand_1.SkillType.Physical,
                'cooldown': 0,
                'use': this.rapier_hit,
                damage: 1,
            },
            {
                'name': 'Take off armor',
                'description': 'Снижает вашу броню до 0 и увеличивает вашу скорость на 1',
                'type': Stand_1.SkillType.Special,
                'cooldown': 9999999,
                'use': this.remove_armor,
                damage: 0,
            },
            {
                'name': 'Afterimage',
                'description': 'Создает вашу иллюзию, которая увеличивает ваш шанс уворота от физических атак на (разница в скорости * 10%) на 2 хода',
                'type': Stand_1.SkillType.Special,
                'cooldown': 0,
                'use': this.afterimage,
                damage: 0,
            },
            {
                'name': 'Rapier shot',
                'description': 'Наносит урон всем противникам, но отключает Rapier и снижает ваш урон на 10%',
                'type': Stand_1.SkillType.Physical,
                'cooldown': 99999,
                'use': this.rapier_shot,
                damage: 0.7,
            }
        ]);
    }
    rapier_hit(fight, enemy, self) {
        const status = self.status;
        return enemy.hit(status.damage, self.ability.active, true);
    }
    remove_armor(fight, enemy, self) {
        const status = self.status;
        return self.editDefence(-status.defence);
    }
    rapier_shot(fight, enemy, self) {
        const status = self.status;
        for (const target of fight.anotherPlayer(self.ownerId).stands) {
            if (!target.status || target.status.hp == 0)
                continue;
            target.editHp(-status.damage * 0.7, false);
            target.hit(status.damage, self.ability.active, true);
        }
        this.ability.active = false;
        return true;
    }
    afterimage(fight, enemy, self) {
        return self.addEffect(new effects_1.Afterimage());
    }
    aiMovePicker(fight, enemy) {
        const status = this.status;
        const owner = this.getOwner(fight);
        // Получение контрпиков
        const counterPicks = [];
        for (const stand of owner.stands) {
            if (enemy.infoForAi.counterStands.includes(stand.name)) {
                counterPicks.push(stand);
            }
        }
        // Получение самого эффективного контрпика
    }
    aiSkillPicker(fight, enemy) {
        const status = this.status;
        const owner = this.getOwner(fight);
    }
}
exports.SilverChariot = SilverChariot;
/**
 * TODO:
 * Доделать ИИ
 *
 */
