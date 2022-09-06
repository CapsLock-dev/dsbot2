import { BattleStatus, Skill, Stand, standList } from "../Stand";

export class Starplatinum implements Stand{
    name: keyof typeof standList;
    maxhp: number
    lvl: number
    exp: number
    speed: number
    defence: number
    damage: number
    range: number
    expPerLvl: number 
    status: BattleStatus | null = null;
    skills: Map<Number, Skill> = new Map<Number, Skill>;
    usedSkills: Skill[] = [];
    constructor(maxhp: number=100, lvl: number=1, exp: number=0, speed: number=5, defence: number=0, damage: number=5, range: number=1, expPerLvl: number=100, usedSkills: Skill[]=[]) {
        this.name = 'Star Platinum'
        this.maxhp = maxhp
        this.lvl = lvl
        this.exp = exp
        this.speed = speed
        this.defence = defence
        this.damage = damage
        this.range = range
        this.expPerLvl = expPerLvl
        this.usedSkills = usedSkills
    }
}