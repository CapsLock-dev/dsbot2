import { SilverChariot } from "./stands/SilverChariot"
import { Starplatinum } from "./stands/StarPlatinum"

export interface Stand {
    readonly name: keyof typeof standList,
    readonly maxhp: number,
    readonly lvl: number,
    readonly exp: number,
    readonly speed: number,
    readonly defence: number,
    readonly damage: number,
    readonly range: number,
    readonly expPerLvl: number,
    readonly status: BattleStatus | null,
    readonly skills: Map<Number, Skill>,
    readonly usedSkills: Array<Skill>,
}
export interface BattleStatus {
    hp: number,
    speed: number,
    damage: number,
    range: number,
    effect: Effect,
    buff: Effect,
}

export interface Effect {
    readonly name: string,
    duration: number
}

export interface Skill {
    readonly name: string,
    readonly cooldown: number,
    readonly use: Function
}

export const defaultValues = {
    expPerLvl: 100,
}
export const standList = {
    'Star Platinum': Starplatinum,
    'Silver Chariot': SilverChariot
}