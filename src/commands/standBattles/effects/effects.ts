import { Stand } from "../Stand"
import { Fight } from "../Fight"
import { TheWorld } from "../stands/TheWorld"
import { StandUser } from "../StandUser"

export interface GlobalEffect {
    readonly name: string
    user: StandUser
    enemy: StandUser
    fight: Fight
    duration: number
    use: (user: Stand, enemy: Stand, fight: Fight)=>void
    end: ()=>void
    description: string
    preventSwap: boolean
    type: EffectType
}

export interface Effect {
    readonly name: string
    duration: number
    use: (target: Stand, fight: Fight)=>void
    end: (target: Stand, fight: Fight)=>void
    description: string
    preventSwap: boolean
    dispel: DispelType
    type: EffectType
}

export enum EffectType {
    OnSwap, Once, Periodic
}

export enum DispelType {
    Normal, Strong, Death
}

export class Afterimage implements Effect {
    name = 'Afterimage'
    description = 'Повышает уклонение на 10% за единицу разницы скорости'
    duration = 2    
    preventSwap = false
    evasionBuff = 0
    dispel = DispelType.Normal
    type = EffectType.Once
    use(target: Stand, fight: Fight) {
        const e = fight.anotherPlayer(target.user).chosenStand as Stand
        let r = target.speed - e.speed
        if (r < 0) {
            r = 1
        }
        target.status!.evasion += r * 0.1
        this.evasionBuff = target.status!.evasion
    }
    end(target: Stand, fight: Fight) {
        if (target.status!.evasion - this.evasionBuff < 0) {
            target.status!.evasion = 0
        } else {
            target.status!.evasion -= this.evasionBuff
        }
    }
}
export class TimeStop implements GlobalEffect {
    name = 'Time Stop'
    description = 'Замораживает любые действия противника. Усиливается после каждого применения'
    duration = 1
    preventSwap = true
    user!: StandUser
    enemy!: StandUser 
    fight!: Fight
    type = EffectType.Once
    use(user: Stand, enemy: Stand, fight: Fight) {
        this.duration = (user as TheWorld).timeStopDuration
        enemy.getOwner(fight).freezed = true
        this.user = user.getOwner(fight)
        this.enemy = enemy.getOwner(fight)
        this.fight = fight
    }
    end() {
        this.enemy.freezed = false
    }
}
 
export class Bleed implements Effect {
    name = 'Bleed'
    description = 'Наносит переодический урон в 5% от текущего хп на 5 ходов'
    duration = 5 
    preventSwap = false
    dispel = DispelType.Normal
    type = EffectType.Periodic
    use(target: Stand, fight: Fight) {
        const currentHp = target.status!.hp 
        target.editHp(Math.ceil(currentHp*0.05), true)
    }
    end(target: Stand, fight: Fight) {

    }
}
