import { Skill, SkillType, StandRole, StandStyle, AbilityType, Stand } from "../Stand";
import { Fight } from "../Fight"

export class TheWorld extends Stand{
    constructor(maxhp: number=115, lvl: number=1, exp: number=0, speed: number=5, defence: number=15, damage: number=20, expPerLvl: number=100, usedSkills: string[]=[]) {
        super()
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
                'name': 'Muda muda muda',
                'description': 'Наносит урон',
                'type': SkillType.Physical,
                'cooldown': 0,
                'use': this.ora_ora_ora,
                damage: 1,
            },
            {
                'name': 'Time stop',
                'description': 'Останавливает время и повышает урон на 20%',
                'type': SkillType.Special,
                'cooldown': 3,
                'use': this.time_stop,
                damage: 0,
            },
            {
                'name': 'Starfinger',
                'description': 'Наносит урон. Пробивает броню, проходит сквозь уклонение',
                'type': SkillType.Physical,
                'cooldown': 0,
                'use': this.starfinger,
                damage: 1,
            },
            {
                'name': 'Buff',
                'description': '',
                'type': SkillType.Physical,
                'cooldown': 99999,
                'use': this.buff,
                damage: 0,
            }
        ])
    }
    ora_ora_ora(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return this.hit(status!.damage, false, false)
    }
    time_stop(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return true
    }
    starfinger(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return false
    }
    buff(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return true
    }
}
