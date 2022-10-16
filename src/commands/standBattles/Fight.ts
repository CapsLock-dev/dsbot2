import { GuildMember, DMChannel, EmbedBuilder } from "discord.js";
import { StandUser } from "./StandUser";
import { Skill, Stand } from "./Stand"

export class Fight {
    p1: StandUser
    p2: StandUser
    constructor(member1: GuildMember, stands1: Stand[], dm1: DMChannel, member2: GuildMember, stands2: Stand[], dm2: DMChannel) {
        this.p1 = new StandUser(member1, stands1, dm1, this)
        this.p2 = new StandUser(member2, stands2, dm2, this)
    }
    fight() {
        if (this.p1.chosenSpell && this.p2.chosenSpell) {
            const first = this.getFastest() as StandUser
            const second = this.anotherPlayer(first)
            for (const spell of first.chosenSpell as Skill[]) {
                spell.use(this, second.chosenStand as Stand)
            }
        } else {
            const array = [this.p1, this.p2].filter((player) => player.chosenMove != 'Skill')
            array.forEach((player) => {
                switch(player.chosenMove) {
                    case 'Run':
                        player.run()
                        break
                    case 'Swap':
                        player.swap('player')
                        break
                }
            })
            if (array.length == 1) {
                const player = this.anotherPlayer(array[0])
                for (const spell of player.chosenSpell as Skill[]) {
                    spell.use(this, array[0].chosenStand as Stand)
                }
            }
        }
    }
    readyCheck() {
        if (this.p1.ready && this.p2.ready) {
            this.p1.ready = false
            this.p2.ready = false
            this.fight()
        }
    }
    getFastest() {
        const array = [this.p1, this.p2]
        array.filter((user) => {
            let counterAttack = false
            user.chosenSpell?.forEach((spell) => {
                if (spell.counterAttack) {
                    counterAttack = true
                    return
                }
            })
            return counterAttack
        }) 
        if (array.length == 1) {
            return array[0]
        } else {
            const stand1 = this.p1.chosenStand as Stand
            const stand2 = this.p2.chosenStand as Stand
            if (stand1.speed > stand2.speed) {
                return this.p1
            } else if (stand2.speed < stand1.speed) {
                return this.p2
            } else {
                return [this.p1, this.p2][Math.round(Math.random())]
            }
        }
    }
    anotherPlayer(player: StandUser | string) {
        if (player instanceof StandUser) {
            return [this.p1, this.p2].filter(user => user != player)[0]
        } else {
            return [this.p1, this.p2].filter(user => user.member.id != player)[0]
        }
    }
    sendBattleLog(text: string) {
        const embed = new EmbedBuilder()
            .setTitle()
    }
}