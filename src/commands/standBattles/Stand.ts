import { kMaxLength } from "buffer"
import { link } from "fs"
import { getLineAndCharacterOfPosition } from "typescript"
import { Fight } from "./Fight"
import { SilverChariot } from "./stands/SilverChariot"
import { Starplatinum as StarPlatinum } from "./stands/StarPlatinum"
import { StandUser } from "./StandUser"

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
    gifLink!: string
    startFight() {
        this.status = {
            hp: this.maxhp,
            speed: this.speed,
            defence: this.defence,
            damage: this.damage,
            effect: null,
            buff: null,
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
    editHp(value: number, ignoreDef: boolean) {
        if (!ignoreDef) {
            value -= value * this.defence / 100
        }
        if (this.status!.hp - value > 0) {
            this.status!.hp -= value
        } else {
            this.status!.hp = 0
            this.user.swap('dead')
        }
    }
    editDefence(value: number) {
        if (this.status!.defence + value < 0) {
            this.status!.defence = 0
        } else {
            this.status!.defence += value
        }
    }
    editDamage(value: number) {
        if (this.status!.damage + value < 0) {
            this.status!.damage = 0
        } else {
            this.status!.damage += value
        }
    }
    editSpeed(value: number) {
        if (this.status!.speed + value < 0) {
            this.status!.speed = 0
        } else {
            this.status!.speed += value
        }
    }
    getOwner(fight: Fight) {
        return fight.anotherPlayer(fight.anotherPlayer(this.ownerId))
    }
}
export interface BattleStatus {
    hp: number,
    speed: number,
    damage: number,
    defence: number,
    effect: Effect | null,
    buff: Effect | null,
    cooldowns: Array<{ skill: Skill, cd: number }>
}

export interface InfoForAi {
    readonly counterStands: Array<keyof typeof standList>,
    readonly role: StandRole,
    readonly style: StandStyle
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

export interface Effect {
    readonly name: string,
    duration: number,
    user: Function
}

export interface GlobalEffect {
    readonly name: string,
    duration: number,
    use: Function
}

export interface Skill {
    readonly name: string,
    readonly cooldown: number,
    readonly use: (fight: Fight, stand: Stand)=>void,
    readonly description: string,
    readonly type: SkillType,
    readonly damage: number,
    readonly multi?: boolean,
    readonly target?: boolean,
    readonly counterAttack?: boolean
}

export enum SkillType {
    Physical, Special
}

export const defaultValues = {
    expPerLvl: 100,
    expPerLvlMultiplier: 100
}
export const standList = {
    'Silver Chariot': SilverChariot
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