import { Effect, Stand, GlobalEffect } from "../Stand"
import { Fight } from "../Fight"

export class Afterimage implements Effect {
    name = 'Afterimage'
    description = ''
    duration = 2    
    preventSwap = false
    evasionBuff = 0
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
    description = ''
    duration = 2
    preventSwap = true
    use(user: Stand, enemy: Stand, fight: Fight) {
        
    }
    end(user: Stand, enemy: Stand, fight: Fight) {

    }
}
