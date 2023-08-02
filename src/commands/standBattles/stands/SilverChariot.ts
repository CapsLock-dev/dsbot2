import { Skill, Stand, defaultValues, SkillType, AbilityType, StandRole, StandStyle } from "../Stand";
import { Fight } from "../Fight"
import { Afterimage } from "../effects/effects";

export class SilverChariot extends Stand {
    hasRapier = true
    ownerId: string = ''
    gifLink = ''
    image = 'https://static.wikia.nocookie.net/jjba/images/8/88/SilverChariot_AnimeAV.png/revision/latest/scale-to-width-down/270?cb=20160414095744'
    constructor(maxhp: number = 100, lvl: number = 1, exp: number = 0, speed: number = 5.5, defence: number = 20, damage: number = 20, expPerLvl: number = defaultValues.expPerLvl, usedSkills: string[] = []) {
        super();
        this.name = 'Silver Chariot'
        this.maxhp = maxhp
        this.lvl = lvl
        this.exp = exp
        this.status = null
        this.speed = speed
        this.defence = defence
        this.damage = damage
        this.expPerLvl = expPerLvl
        this.skills = new Map<Number, Skill[]>([])
        this.ability = { type: AbilityType.Passive, name: 'Rapier', description: 'Все атаки пробивают броню', use: undefined, active: true }
        this.infoForAi = { 'counterStands': [], 'role': StandRole.Carry, 'style': StandStyle.DamageDealer }
        this.setup()
        this.setupSkills(usedSkills)
    }
    setup() {
        this.skills.set(1, [
            {
                'name': 'Rapier hit',
                'description': 'Наносит урон',
                'type': SkillType.Physical,
                'cooldown': 0,
                'use': this.rapier_hit,
                damage: 1,
            },
            {
                'name': 'Take off armor',
                'description': 'Снижает вашу броню до 0 и увеличивает вашу скорость на 1',
                'type': SkillType.Special,
                'cooldown': 9999999,
                'use': this.remove_armor,
                damage: 0,
            },
            {
                'name': 'Afterimage',
                'description': 'Создает вашу иллюзию, которая увеличивает ваш шанс уворота от физических атак на (разница в скорости * 10%) на 2 хода',
                'type': SkillType.Special,
                'cooldown': 0,
                'use': this.afterimage,
                damage: 0,
            },
            {
                'name': 'Rapier shot',
                'description': 'Наносит урон всем противникам, но отключает Rapier и снижает ваш урон на 10%',
                'type': SkillType.Physical,
                'cooldown': 99999,
                'use': this.rapier_shot,
                damage: 0.7,
            }
        ])
    }
    rapier_hit(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return enemy.hit(status!.damage, self.ability.active, true)
    }
    remove_armor(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return self.editDefence(-status!.defence)
    }
    rapier_shot(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        for (const target of fight.anotherPlayer(self.ownerId).stands) {
            if (!target.status || target.status.hp == 0) continue
            target.editHp(-status!.damage * 0.7, false)
            target.hit(status!.damage, self.ability.active, true)
        }
        this.ability.active = false
        return true
    }
    afterimage(fight: Fight, enemy: Stand, self: Stand) {
        return self.addEffect(new Afterimage())
    }
    aiMovePicker(fight: Fight, enemy: Stand) {
        const status = this.status
        const owner = this.getOwner(fight)
        // Получение контрпиков
        const counterPicks = []
        for (const stand of owner.stands) {
            if (enemy.infoForAi.counterStands.includes(stand.name)) {
                counterPicks.push(stand)
            }
        }
        // Получение самого эффективного контрпика
        
    }
    aiSkillPicker(fight: Fight, enemy: Stand) {
        const status = this.status
        const owner = this.getOwner(fight)
    }
}

/**
 * TODO:
 * Доделать ИИ
 * 
 */
