import { BattleStatus, Skill, Stand, standList } from "../Stand";

export class Starplatinum extends Stand{
    constructor(maxhp: number=100, lvl: number=1, exp: number=0, speed: number=5, defence: number=0, damage: number=5, expPerLvl: number=100, usedSkills: Skill[]=[]) {
        super()
        this.maxhp = maxhp
        this.lvl = lvl
        this.exp = exp
        this.speed = speed
        this.defence = defence
        this.damage = damage
        this.expPerLvl = expPerLvl
        this.usedSkills = usedSkills
    }
}