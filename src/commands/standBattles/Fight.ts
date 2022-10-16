import { GuildMember, DMChannel } from "discord.js";
import { StandUser } from "./StandUser";
import { Stand } from "./Stand"

export class Fight {
    p1: StandUser
    p2: StandUser
    constructor(member1: GuildMember, stands1: Stand[], dm1: DMChannel, member2: GuildMember, stands2: Stand[], dm2: DMChannel) {
        this.p1 = new StandUser(member1, stands1, dm1, this)
        this.p2 = new StandUser(member2, stands2, dm2, this)
    }
    fight() {

    }
    readyCheck() {

    }
    anotherPlayer(player: StandUser | string) {
        if (player instanceof StandUser) {
            return [this.p1, this.p2].filter(user => user != player)[0]
        } else {
            return [this.p1, this.p2].filter(user => user.member.id != player)[0]
        }
    }
}