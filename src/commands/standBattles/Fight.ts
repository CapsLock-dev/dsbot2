import { GuildMember, DMChannel, EmbedBuilder, TextBasedChannel, TextChannel } from "discord.js";
import { StandUser } from "./StandUser";
import { Skill, Stand } from "./Stand"
import { Effect, EffectType, GlobalEffect } from './effects/effects'

enum PlayerState {
    Attack, NotAttack, Charge, ChargeReady
}

export class Fight {
    p1: StandUser
    p2: StandUser
    fieldEffect: GlobalEffect | undefined
    mChannel: TextChannel
    constructor(mChannel: TextChannel, member1: GuildMember, stands1: Stand[], dm1: DMChannel, member2: GuildMember, stands2: Stand[], dm2: DMChannel) {
        this.p1 = new StandUser(member1, stands1, dm1, this)
        this.p2 = new StandUser(member2, stands2, dm2, this)
        this.mChannel = mChannel
    }
    fight() {
        // Update stands
        [this.p1, this.p2].forEach(p => {
            for (const stand of p.stands.filter(s => s.status!.hp > 0)) {
                stand.update()
            }
        })
        // Update global effect
        this.updateGlobalEffects()

        // 
        const first = this.getFastest() as StandUser
        const second = this.anotherPlayer(first)
        const arr = [first, second]
        arr.forEach(user => {
            const state = this.getPlayerState(user)
            switch (state) {
                case PlayerState.Attack:
                    user.useSpell()
                    break;
                case PlayerState.Charge:
                    user.ready = true
                    break;
                case PlayerState.ChargeReady:
                    user.useChargedSpell()
                    break;
                case PlayerState.NotAttack:

                    break;
            }
        })

        // Use spell if freezed
        let freezed = false
        if (this.p1.freezed || this.p2.freezed) {
            const p = this.anotherPlayer([this.p1, this.p2].filter(player => player.freezed)[0])
            p.useSpell()
            freezed = true
        }
        // Use spell both
        if (this.p1.chosenSpell && this.p2.chosenSpell && !freezed) {
            const first = this.getFastest() as StandUser
            const second = this.anotherPlayer(first)
            first.useSpell()
            second.useSpell()
            // Use spell if another player chose swap
        } else {
            const array = [this.p1, this.p2].filter((player) => player.chosenMove == 'Skill')
            if (array.length == 1) {
                const player = this.anotherPlayer(array[0])
                player.useSpell()
            }
        }
    }
    getPlayerState(player: StandUser) {
        let state: PlayerState
        if (player.freezed) {
            return PlayerState.NotAttack
        }
        if (player.chosenMove == 'Skill') {
            state = PlayerState.Attack
        } else if (player.chosenStand?.chargingSkill) {
            if (player.chosenStand.chargingSkill.time > 0) {
                state = PlayerState.Charge
            } else {
                state = PlayerState.ChargeReady
            }
        } else {
            state = PlayerState.NotAttack
        }
        return state
    }
    nextMove(player: StandUser) {
        if (!this.isEnd()) {
            const players = [this.p1, this.p2]
            players.forEach(p => {
                p.update()
                if (p.chosenStand?.isDead()) {
                    p.sendSwapMenu(true)
                } else {
                    if (!p.freezed) {
                        p.sendMainMenu()
                    } else {
                        p.ready = true
                    }
                }
            })
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
    addGlobalEffect(user: Stand, target: Stand, effect: GlobalEffect) {
        effect.use(user, target, this)
    }
    updateGlobalEffects() {
        if (!this.fieldEffect) return
        this.fieldEffect.duration -= 1
        if (this.fieldEffect.duration <= 0 && this.fieldEffect.type == EffectType.Periodic) {

        }
        if (this.fieldEffect.duration == 0) {
            this.fieldEffect.end()
            this.fieldEffect = undefined
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
        this.p1.dm.send({ embeds: [content] })
        this.p2.dm.send({ embeds: [content] })
    }
    standBuffer() {
        return { stand1: this.p1.chosenStand as Stand, stand2: this.p2.chosenStand as Stand }
    }
    sendBattleLog(text: string, spellGif: string | undefined, stand1Before: Stand, stand2Before: Stand) {
        const stand1 = { past: this.p1.chosenStand as Stand, before: stand1Before }
        const stand2 = { past: this.p2.chosenStand as Stand, before: stand2Before }
        const stands = [stand1, stand2]
        const fields = []
        for (const stand of stands) {
            fields.push({
                name: stand.past.name + ` (${stand.past.user.member.user.username})`,
                value: `HP: ${this.calcValue(stand.past.status?.hp as number, stand.before.status?.hp as number)}\n 
                        Defence: ${this.calcValue(stand.past.status?.defence as number, stand.before.status?.defence as number)}\n 
                        Speed: ${this.calcValue(stand.past.status?.speed as number, stand.before.status?.speed as number)}\n 
                        Damage: ${this.calcValue(stand.past.status?.damage as number, stand.before.status?.damage as number)}\n 
                        Effect: ${stand.past.status?.effects?.join()}\n`,
                inline: true
            })
        }
        const embed = new EmbedBuilder()
            .setDescription(text)
            .setTitle('Битва')
            .setFields(fields)
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        if (spellGif) {
            embed.setImage(spellGif)
        }
        this.sendBoth(embed)
        this.mChannel.send({ embeds: [embed] })
    }
    calcValue(val1: number, val2: number) {
        const val = val1 - val2
        const a = val > 0 ? '+' : ''
        return `${val1} (${a}${val})`
    }
    end(reason: "dead" | "run", user: StandUser) {
        let desc = ""
        switch (reason) {
            case "run":
                desc = `${user.member.user.username} сдался.\nБой окончен`
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
        this.mChannel.send({ embeds: [emb] })
        this.p1.collector.stop()
        this.p2.collector.stop()
    }
    isEnd() {
        const players = [this.p1, this.p2]
        for (const p of players) {
            if (p.stands.filter(s => !s.isDead).length == 0) {
                this.end('dead', p)
                return true
            }
        }
        return false
    }
}
