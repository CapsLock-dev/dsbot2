import { GuildMember, DMChannel, EmbedBuilder, MessageOptions } from "discord.js";
import { StandUser } from "./StandUser";
import { GlobalEffect, Skill, Stand, Effect } from "./Stand"

export class Fight {
    p1: StandUser
    p2: StandUser
    fieldEffect: GlobalEffect | undefined
    constructor(member1: GuildMember, stands1: Stand[], dm1: DMChannel, member2: GuildMember, stands2: Stand[], dm2: DMChannel) {
        this.p1 = new StandUser(member1, stands1, dm1, this)
        this.p2 = new StandUser(member2, stands2, dm2, this)
    }
    fight() {
        if (this.fieldEffect) {
            this.fieldEffect.use(this)
            this.sendBattleLog('На поле действует' + this.fieldEffect.name, this.p1.chosenStand as Stand, this.p2.chosenStand as Stand)
        }
        if (this.p1.chosenSpell && this.p2.chosenSpell) {
            const first = this.getFastest() as StandUser
            const second = this.anotherPlayer(first)
            first.useSpell()
            second.useSpell()
        } else {
            const array = [this.p1, this.p2].filter((player) => player.chosenMove != 'Skill' && player.chosenStand?.status?.hp != 0)
            if (array.length == 1) {
                const player = this.anotherPlayer(array[0])
                player.useSpell()
            }
        }
        const players = [this.p1, this.p2]
        players.forEach(p => {
            p.update()
            if (p.chosenStand?.isDead) {
                p.sendSwapMenu(true)
            } else {
                p.sendMainMenu()
            }
        })
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
            return user.chosenSpell?.counterAttack
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
    sendBoth(content: EmbedBuilder) {
        this.p1.dm.send({embeds: [content]})
        this.p2.dm.send({embeds: [content]})
    }
    sendBattleLog(text: string, stand1Before: Stand, stand2Before: Stand) {
        const stand1 = {past: this.p1.chosenStand as Stand, before: stand1Before}
        const stand2 = {past: this.p2.chosenStand as Stand, before: stand2Before}
        const stands = [stand1, stand2]
        const fields = []
        for (const stand of stands) {
            fields.push({
                name: stand.past.name,
                value: `HP: ${this.calcValue(stand.past.status?.hp as number, stand.before.status?.hp as number)}\n 
                        Defence: ${this.calcValue(stand.past.status?.defence as number, stand.before.status?.defence as number)}\n 
                        Speed: ${this.calcValue(stand.past.status?.speed as number, stand.before.status?.speed as number)}\n 
                        Damage: ${this.calcValue(stand.past.status?.damage as number, stand.before.status?.damage as number)}\n 
                        Buff: ${stand.past.status?.buff as Effect}\n 
                        Effect: ${stand.past.status?.effect as Effect}\n`
            })
        }
        const embed = new EmbedBuilder()
            .setDescription(text[0])
            .setTitle('Битва')
            .setFields(fields)
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        this.sendBoth(embed)
    }
    calcValue(val1: number, val2: number) {
        const val = val1 - val2
        const a = val < 0 ? '+' : '' 
        return `${val2} (${a}${val})`
    }
    end(reason: "dead" | "run", user: StandUser) {
        let desc = ""
        switch (reason) {
            case "run":
                desc = `${user.member.user.username} сбежал.\nБой окончен`
                break
            case "dead":
                desc = `${user.member.user.username} выиграл`
                break
        }
        const emb = new EmbedBuilder()
            .setTitle('Битва')
            .setDescription(desc)
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        this.sendBoth(emb)
        this.p1.collector.stop()
        this.p2.collector.stop()
    }
}
