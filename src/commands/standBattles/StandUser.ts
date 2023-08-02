import { ButtonInteraction, GuildMember, InteractionCollector, CacheType, DMChannel, ComponentType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, SelectMenuBuilder, SelectMenuInteraction } from 'discord.js'
import { Fight } from './Fight';
import { Skill, Stand } from './Stand';

export class StandUser {
    readonly member: GuildMember
    readonly stands: Stand[]
    readonly fight: Fight
    dm: DMChannel
    collector: InteractionCollector<ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>>
    ready: boolean = false
    chosenSpell: Skill | null = null
    chosenStand: Stand | null = null
    chosenMove: 'Skill' | 'Swap' | 'Run' | 'Idle' = 'Idle'
    freezed: boolean = false
    message!: Message
    constructor(member: GuildMember, stands: Stand[], dm: DMChannel, fight: Fight) {
        this.member = member
        this.stands = stands
        this.fight = fight
        this.dm = dm
        this.collector = dm.createMessageComponentCollector({}) as InteractionCollector<ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>>
        this.collector.on('collect', async (i: ButtonInteraction | SelectMenuInteraction) => {
            this.menuHandler(i)
        })
        this.init()
        for (const stand of stands) {
            stand.user = this
        }
    }
    async init() {
        const options = []
        for (let i = 0; i < this.stands.length; i++) {
            const stand = this.stands[i]
            stand.startFight()
            options.push({ label: stand.name, description: `Lvl: ${stand.lvl}`, value: i.toString() })
        }
        const emb = new EmbedBuilder()
            .setTitle('Битва')
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('start_stand')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Выберите стартового стенда')
                    .addOptions(options)
            )
        this.message = await this.dm.send({ components: [menu], embeds: [emb] })
    }
    menuHandler(i: ButtonInteraction | SelectMenuInteraction) {
        switch (i.componentType) {
            case ComponentType.Button:
                this.message.delete()
                switch (i.customId) {
                    case 'attack':
                        this.sendAttackMenu()
                        break
                    case 'swap':
                        this.sendSwapMenu(false)
                        break
                    case 'giveup':
                        this.run()
                        break
                }
                break
            case ComponentType.SelectMenu:
                const values = (i as SelectMenuInteraction).values[0]
                switch (i.customId) {
                    case 'start_stand':
                        this.chosenStand = this.stands[parseInt(values)]
                        this.message.delete()
                        this.sendAttackMenu()
                        break
                    case 'swap_stand':
                        this.chosenStand = this.stands[parseInt(values)]
                        this.ready = true
                        this.fight.readyCheck()
                        this.message.delete()
                        break
                    case 'swap_stand_dead':
                        this.chosenStand = this.stands[parseInt(values)]
                        this.message.delete()
                        this.sendAttackMenu()
                    case 'attack_menu':
                        const chosenSkill = this.chosenStand?.usedSkills[parseInt(values)] as Skill
                        if (this.chosenStand?.getCooldown(chosenSkill) == 0) {
                            this.chosenSpell = chosenSkill
                            console.log(this.chosenSpell)
                            this.ready = true
                            this.fight.readyCheck()
                            this.message.delete()
                        } else {
                            i.reply('Этот скилл находится в кд')
                        }
                        break
                }
                break
        }
    }
    async sendSwapMenu(dead: boolean) {
        const options = []
        for (let i = 0; i < this.stands.length; i++) {
            const stand = this.stands[i]
            if (stand.status?.hp != 0) {
                options.push({ label: stand.name, description: `Lvl: ${stand.lvl}`, value: i.toString() })
            }
        }
        const customId = dead ? 'swap_stand_dead' : 'swap_stand'
        const emb = new EmbedBuilder()
            .setTitle('Битва')
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(customId)
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Выберите стенд')
                    .addOptions(options)
            )
        this.message = await this.dm.send({ components: [menu], embeds: [emb] })
    }
    async run() {
        this.fight.end('run', this)
    }
    async sendAttackMenu() {
        const options = []
        const stand = this.chosenStand as Stand
        for (let i = 0; i < stand.usedSkills.length; i++) {
            const skill = stand.usedSkills[i]
            options.push({ label: skill.name, description: `КД: ${stand.getCooldown(skill)}`, value: i.toString() })
        }
        const emb = new EmbedBuilder()
            .setTitle('Атака')
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('attack_menu')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Выберите скилл')
                    .addOptions(options)
            )
        this.message = await this.dm.send({ embeds: [emb], components: [menu] })
    }
    async sendMainMenu() {
        const emb = new EmbedBuilder()
            .setTitle('Битва')
            .setDescription('Выберите действие')
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        const buttons: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('attack')
                    .setLabel('Выбрать атаку')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('swap')
                    .setLabel('Поменять стенд')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('giveup')
                    .setLabel('Сдаться')
                    .setStyle(ButtonStyle.Primary)
            )
        this.message = await this.dm.send({ components: [buttons], embeds: [emb] })
    }
    useSpell() {
        if (this.chosenStand!.status!.hp > 0) {
            const sBuff = this.fight.standBuffer()
            const target = this.fight.anotherPlayer(this).chosenStand as Stand
            let message = ''
            const success = this.chosenSpell!.use(this.fight, target, this.chosenStand as Stand)
            if (this.chosenSpell?.charging) {
                message += `${this.chosenStand?.name} (${target.user.member.user.username}) готовит ${this.chosenSpell?.name}`
            } else {
                message += `${this.chosenStand?.name} (${target.user.member.user.username}) использовал ${this.chosenSpell?.name}`
            }
            if (!success) {
                message += `\n ${this.chosenSpell!.name} не сработал`
            }
            if (target.status!.hp <= 0) {
                message += `\n ${target.name} (${target.user.member.user.username}) умер`
            }
            this.fight.sendBattleLog(message, this.chosenSpell?.gif, sBuff.stand1, sBuff.stand2)
            if (this.chosenSpell!.cooldown > 0) {
                this.chosenStand?.status?.cooldowns.push({ skill: this.chosenSpell as Skill, cd: this.chosenSpell?.cooldown as number })
            }
        }
    }
    useChargedSpell() {
        if (this.chosenStand!.status!.hp > 0) {
            const sBuff = this.fight.standBuffer()
            const target = this.fight.anotherPlayer(this).chosenStand as Stand
            const spell = this.chosenStand!.chargingSkill!.Skill
            let message = ''
            const success = spell(this.fight, target, this.chosenStand as Stand)
            message += `${this.chosenStand?.name} (${target.user.member.user.username}) использовал ${this.chosenSpell?.name}`
            if (!success) {
                message += `\n ${this.chosenSpell!.name} не сработал`
            }
            if (target.status!.hp <= 0) {
                message += `\n ${target.name} (${target.user.member.user.username}) умер`
            }
            this.fight.sendBattleLog(message, this.chosenSpell?.gif, sBuff.stand1, sBuff.stand2)
        }
    }
    update() {
        if (!this.chosenSpell?.charging) this.chosenSpell = null
        this.chosenMove = "Idle"
    }
}
