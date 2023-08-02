import { Fight } from "./Fight"
import { StandUser } from "./StandUser"
import { standList } from "./data"
import { Effect } from './effects/effects'

export abstract class Stand {
    name!: keyof typeof standList
    maxhp!: number
    lvl!: number
    exp!: number
    speed!: number
    defence!: number
    damage!: number
    expPerLvl!: number
    status!: BattleStatus | null
    skills!: Map<Number, Array<Skill>>
    usedSkills!: Array<Skill>
    user!: StandUser
    ability!: Ability
    infoForAi!: InfoForAi
    ownerId!: string
    image!: string
    chargingSkill!: ChargingSkill | undefined
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
        }
    }
    addExp(exp: number) {
        if (this.exp + exp >= this.expPerLvl) {
            this.exp += exp - this.expPerLvl
            this.expPerLvl = defaultValues.expPerLvlMultiplier
        } else {
            this.exp += exp
        }
    }
    setupSkills(skillNames: Array<string>) {
        if (skillNames.length == 0) {
            const skills = this.skills.get(1)
            this.usedSkills = skills as Skill[]
        } else {
            for (const key of [...this.skills.keys()]) {
                const skills = this.skills.get(key) as Skill[]
                skills.forEach(el => {
                    if (skillNames.includes(el.name)) {
                        skillNames.splice(skillNames.indexOf(el.name), 1)
                        this.usedSkills.push(el)
                    }
                });
            }
        }
    }
    getCooldown(skill: Skill) { 
        const cd = this.status?.cooldowns.find(e => {e.skill = skill})
        if (cd) {
            return cd.cd
        } 
        return 0
    }
    addCooldown(skill: Skill) {
        this.status?.cooldowns.push({skill: skill, cd: skill.cooldown})
    }
    removeCooldown(skill: Skill) {
        this.status!.cooldowns = this.status!.cooldowns.filter(s => s.skill != skill)
    }
    removeAllCooldowns() {
        this.status!.cooldowns = []
    }
    update() {
        for (const entry of this.status!.cooldowns) {
            entry.cd -= 1
        }
        for (const effect of this.status!.effects as Effect[]) {
            effect.duration -= 1
        }
        this.status!.cooldowns = this.status!.cooldowns.filter(e => e.cd > 0)
        this.status!.effects  = this.status!.effects!.filter(e => e.duration > 0)
        if (this.chargingSkill) {
            this.chargingSkill.time -= 1
        }
    }
    hit(dmg: number, ignoreDef: boolean, canMiss: boolean) {
        const evasion = this.status!.evasion
        if (canMiss || evasion <= 0) {
            if (Math.random() > evasion) {
                this.editHp(-dmg, ignoreDef)
                return true
            } else {
                return false
            }
        } else {
            this.editHp(-dmg, ignoreDef)
            return true
        }
    }
    addEffect(effect: Effect) {
        this.status?.effects?.push(effect)
        return true
    }
    purgeEffects() {
        this.status!.effects = []
    }
    editHp(value: number, ignoreDef: boolean) {
        if (!ignoreDef) {
            value -= value * this.defence / 100
        }
        if (this.status!.hp - value > 0) {
            this.status!.hp -= value
        } else {
            this.status!.hp = 0
        }
        console.log(this.status?.hp)
    }
    editDefence(value: number) {
        if (this.status!.defence + value < 0) {
            this.status!.defence = 0
        } else {
            this.status!.defence += value
        }
        return true
    }
    editDamage(value: number) {
        if (this.status!.damage + value < 0) {
            this.status!.damage = 0
        } else {
            this.status!.damage += value
        }
        return true
    }
    editSpeed(value: number) {
        if (this.status!.speed + value < 0) {
            this.status!.speed = 0
        } else {
            this.status!.speed += value
        }
        return true
    }
    getOwner(fight: Fight) {
        return fight.anotherPlayer(fight.anotherPlayer(this.ownerId))
    }
    isDead() {
        return this.status!.hp <= 0
    }
}
export interface BattleStatus {
    maxhp: number,
    hp: number,
    speed: number,
    damage: number,
    evasion: number,
    defence: number,
    effects: Array<Effect> | null,
    cooldowns: Array<{ skill: Skill, cd: number }>
}

export interface InfoForAi {
    readonly counterStands: Array<keyof typeof standList>,
    readonly role: StandRole,
    readonly style: StandStyle
}

export interface ChargingSkill {
    readonly Skill: (fight: Fight, stand: Stand, self: Stand)=>boolean
    time: number
}

export enum StandRole {
    Support, Tank, Carry
}

export enum StandStyle {
    DamageDealer,
    Debuffer,
    Buffer,
    Killer,
    Disabler,
    Procast,
    Exchange
}

export interface Skill {
    readonly name: string
    readonly cooldown: number
    readonly use: (fight: Fight, stand: Stand, self: Stand)=>boolean
    readonly description: string
    readonly type: SkillType
    readonly damage: number
    readonly target?: boolean
    readonly counterAttack?: boolean
    readonly gif?: string
    readonly charging?: boolean
    readonly useCharged?: (fight: Fight, stand: Stand, self: Stand)=>boolean
}

export enum SkillType {
    Physical, Special
}

export const defaultValues = {
    expPerLvl: 100,
    expPerLvlMultiplier: 100
}
export interface Ability {
    readonly type: AbilityType,
    readonly use: Function | undefined,
    readonly name: string,
    readonly description: string,
    active: boolean
}

export enum AbilityType {
    Battlecry, Passive, Deathcry
}
