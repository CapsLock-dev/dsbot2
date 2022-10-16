import { BattleStatus, Skill, Stand, defaultValues, standList, SkillType, AbilityType, StandRole, StandStyle } from "../Stand";
import { Fight } from "../Fight"

export class SilverChariot extends Stand {
    hasRapier = true
    ownerId: string = ''
    gifLink = ''
    constructor(maxhp: number = 100, lvl: number = 1, exp: number = 0, speed: number = 5.5, defence: number = 20, damage: number = 5, expPerLvl: number = defaultValues.expPerLvl, usedSkills: string[] = []) {
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
        this.skills = new Map<Number, Array<Skill>>
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
                'description': 'Снижает вашу броню до 0 и увеличивает вашу скорость на одну ступень',
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
                multi: true,
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
    rapier_hit(fight: Fight, enemy: Stand) {
        if (!enemy.status || !this.status) return
        const status = this.status
        enemy.editHp(status.damage, this.ability.active)
    }
    remove_armor(fight: Fight, enemy: Stand) {
        if (!enemy.status || !this.status) return
        const status = this.status
        this.editDefence(-status.defence)
    }
    rapier_shot(fight: Fight, enemy: Stand) {
        if (!enemy.status || !this.status) return
        const status = this.status
        for (const target of fight.anotherPlayer(this.ownerId).stands) {
            if (!target.status || target.status.hp == 0) continue
            target.editHp(-status.damage * 0.7, false)
        }
    }
    afterimage(fight: Fight, enemy: Stand) {
        if (!enemy.status || !this.status) return
        const status = this.status

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