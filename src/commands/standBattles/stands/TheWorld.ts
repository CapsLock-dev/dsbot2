import { Skill, SkillType, StandRole, StandStyle, AbilityType, Stand } from "../Stand";
import { Fight } from "../Fight"
import { Bleed, TimeStop } from "../effects/effects";

export class TheWorld extends Stand{
    timeStopDuration = 1
    constructor(maxhp: number=115, lvl: number=1, exp: number=0, speed: number=5, defence: number=15, damage: number=20, expPerLvl: number=100, usedSkills: string[]=[]) {
        super()
        this.name = 'The World'
        this.maxhp = maxhp
        this.lvl = lvl
        this.exp = exp
        this.status = null
        this.speed = speed
        this.defence = defence
        this.damage = damage
        this.expPerLvl = expPerLvl
        this.skills = new Map<Number, Skill[]>([])
        this.ability = { type: AbilityType.Passive, name: 'Vampire', description: 'Восстанавливает здоровье при добивании стенда', use: undefined, active: true }
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
                'use': this.muda_muda_muda,
		        'gif': 'https://tenor.com/view/muda-the-world-punch-jo-jos-bizarre-adventure-gif-12851143',
                damage: 1,
            },
            {
                'name': 'Time stop',
                'description': 'Останавливает время и повышает урон на 20%',
                'type': SkillType.Special,
                'cooldown': 3,
                'use': this.time_stop,
		        'gif': 'https://tenor.com/view/time-stop-freeze-dio-discord-the-world-jojos-bizarre-adventure-gif-17873358',
                damage: 0,
            },
            {
                'name': 'Roadroller',
                'description': 'Заряжается 1 ход. Наносит двойной урон. Пробивает броню, проходит сквозь уклонение',
                'type': SkillType.Physical,
                'charging': true,
                'cooldown': 0,
                'use': this.roadroller,
                'useCharged': this.roadroller_cast,
                damage: 2,
		        'gif': 'https://tenor.com/view/anime-dio-brando-dio-the-invader-manga-series-road-roller-gif-16677670',
            },
            {
                'name': 'Throw knife',
                'description': 'Наносит урон. Накладывает на противника кровотечение',
                'type': SkillType.Special,
                'cooldown': 10,
                'use': this.throw_knife,
                'gif': 'https://tenor.com/view/dio-the-world-dagger-throw-gif-13331615',
                damage: 1,
            }
        ])
    }
    muda_muda_muda(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return enemy.hit(status!.damage, false, true)
    }
    time_stop(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return true
    }
    roadroller(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        this.chargingSkill = {Skill: this.roadroller_cast, time: 1}
        return true
    }
    roadroller_cast(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        return enemy.hit(status!.damage*2, true, false)
    }
    throw_knife(fight: Fight, enemy: Stand, self: Stand) {
        const status = self.status
        enemy.addEffect(new Bleed())
        return true
    }
}
