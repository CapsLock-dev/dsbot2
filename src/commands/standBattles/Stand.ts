import { Fight } from "./Fight"
import { SilverChariot } from "./stands/SilverChariot"
import { Starplatinum as StarPlatinum } from "./stands/StarPlatinum"
import { StandUser } from "./StandUser"

export class Stand {
    name!: keyof typeof standList
    maxhp!: number
    lvl!: number
    exp!: number
    speed!: number
    defence!: number
    damage!: number
    range!: number
    expPerLvl!: number
    status!: BattleStatus | null
    skills!: Map<Number, Skill>
    usedSkills!: Array<Skill>
    user!: StandUser
    startFight() {
        this.status = {
            hp: this.maxhp,
            speed: this.speed,
            defence: this.defence,
            range: this.range,
            damage: this.damage,
            effect: null,
            buff: null,
            cooldowns: []
        }
    }
    addExp(exp: number) {

    }
    dealDamage(value: number, ignoreDef: boolean) {
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

    }
    editRange(value: number) {

    }
    editDamage(value: number) {

    }
    editSpeed(value: number) {

    }
}
export interface BattleStatus {
    hp: number,
    speed: number,
    damage: number,
    defence: number,
    range: number,
    effect: Effect | null,
    buff: Effect | null,
    cooldowns: Array<{ skill: Skill, cd: number }>
}

export interface Effect {
    readonly name: string,
    duration: number
}

export interface Skill {
    readonly name: string,
    readonly cooldown: number,
    readonly use: Function,
    readonly description: string,
    readonly type: SkillType
}

export enum SkillType {
    Physical, Special
}

export const defaultValues = {
    expPerLvl: 100,
}
export const standList = {
    'Star Platinum': StarPlatinum,
    'Silver Chariot': SilverChariot
}