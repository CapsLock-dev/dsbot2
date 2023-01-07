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
    freezed: number = 0
    message!: Message
    constructor(member: GuildMember, stands: Stand[], dm: DMChannel, fight: Fight) {
        this.member = member
        this.stands = stands
        this.fight = fight
        this.dm = dm
        this.collector = dm.createMessageComponentCollector()
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
        for (let i = 0; i < 4; i++) {
            const stand = this.stands[i]
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
                break
            case ComponentType.SelectMenu:
                switch (i.customId) {
                    case 'start_stand':
                        this.chosenStand = this.stands[parseInt(i.values[0])]
                        this.sendAttackMenu()
                        break
                    case 'swap_stand':
                        this.chosenStand = this.stands[parseInt(i.values[0])]
                        break
                    case 'attack_menu':
                        const chosenSkill = this.chosenStand?.usedSkills[parseInt(i.values[0])] as Skill
                        if (this.chosenStand?.getCooldown(chosenSkill) == 0) {
                            this.chosenSpell = chosenSkill
                        } else {
                            i.reply('Этот скилл находится в кд')
                        }
                }
                break
        }
    }
    async sendSwapMenu(dead: boolean) {
        await this.message.delete()
        const options = []
        for (let i = 0; i < 4; i++) {
            const stand = this.stands[i]
            if (stand.status?.hp != 0) {
                options.push({ label: stand.name, description: `Lvl: ${stand.lvl}`, value: i.toString() })
            }
        }
        const emb = new EmbedBuilder()
            .setTitle('Битва')
            .setThumbnail('https://media.discordapp.net/attachments/966392406662586458/1041374682072490045/unknown.png?width=649&height=618')
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('swap_stand')
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
        await this.message.delete()
        const options = []
        const stand = this.chosenStand as Stand
        for (let i = 0; i < stand.usedSkills.length; i++) {
            const skill = stand.usedSkills[i]
            options.push({label: skill.name, description: `КД: ${stand.getCooldown(skill)}`, value: i.toString()})
        }
        const emb = new EmbedBuilder()
            .setTitle('Атака')
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('attack_menu')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Выберите скилл')
                    .addOptions(options)
            )
        this.message = await this.dm.send({ embeds: [emb], components: [menu]}) 
    }
    async sendMainMenu() {
        this.message.delete()
        const emb = new EmbedBuilder()
            .setTitle('Битва')
            .setDescription('Выберите действие')
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
            const target = this.fight.anotherPlayer(this).chosenStand as Stand
            let message = ''
            this.chosenSpell!.use(this.fight, target)
            message += `${this.chosenStand?.name} использовал ${this.chosenSpell as Skill}`
            if (target.status!.hp <= 0) {
                message += `\n ${target.name} умер`           
            }
        } else {
        }
    }
    update() {
        for (const stand of this.stands.filter(s => s.status!.hp > 0)) {
            for (const entry of stand.status!.cooldowns) {
                entry.cd -= 1 
            }
        }
        this.chosenSpell = null
        this.chosenMove = "Idle"
    }
}
