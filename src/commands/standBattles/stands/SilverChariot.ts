import { BattleStatus, Skill, Stand, defaultValues, standList, SkillType } from "../Stand";
import { Fight } from "../Fight"

export class SilverChariot extends Stand {
    constructor(maxhp: number = 100, lvl: number = 1, exp: number = 0, speed: number = 5, defence: number = 0, damage: number = 5, range: number = 1, expPerLvl: number = 100, usedSkills: Skill[] = []) {
        super();
        this.name = 'Silver Chariot'
        this.maxhp = maxhp
        this.lvl = lvl
        this.exp = exp
        this.status = null
        this.skills = new Map<Number, Skill>;
        this.speed = speed
        this.defence = defence
        this.damage = damage
        this.range = range
        this.expPerLvl = expPerLvl
        this.usedSkills = usedSkills
    }
    setSkills() {
        this.skills.set(1, { name: 'Rapier hit', use: this.rapier_hit, cooldown: 0, description: '', type: SkillType.Physical })
        this.skills.set(1, { name: 'Remove armor', use: this.remove_armor, cooldown: 99999, description: '', type: SkillType.Special })
        this.skills.set(1, { name: '', use: , cooldown: , description: '', type: })
        this.skills.set(1, { name: '', use: , cooldown: , description: '', type: })
        this.skills.set(1, { name: '', use: , cooldown: , description: '', type: })
        this.skills.set(1, { name: '', use: , cooldown: , description: '', type: })
        
    }
    rapier_hit(fight: Fight, enemy: Stand) {
        if (!enemy.status) return
        enemy.status.hp - this.damage * 2
    }
    remove_armor(fight: Fight, enemy: Stand) {

    }
}