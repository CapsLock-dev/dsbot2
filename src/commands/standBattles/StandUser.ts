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
    chosenSpell: Skill[] | null = null
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
        this.collector.on('collect', async (i: ButtonInteraction) => {
            this.buttonHandler(i)
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
    buttonHandler(i: ButtonInteraction | SelectMenuInteraction) {
        switch (i.componentType) {
            case ComponentType.Button:
                break
            case ComponentType.SelectMenu:
                break
        }
    }
    async swap(reason: string) {

    }
    async run() {
        
    }
    async setAttackMenu() {
        const emb = new EmbedBuilder()
            .setTitle('Атака')
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('attack_menu')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Выберите действие')
                    .addOptions()
            )
        for (let i = 0; i < 4; i++) {
            menu.addComponents(
                new ButtonBuilder()
                    .setCustomId(i.toString())
                    .setLabel(this.chosenStand!.usedSkills[i].name)
                    .setStyle(ButtonStyle.Primary)
            )
        }
    }
    async setMainMenu() {
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
        await this.message.edit({ components: [buttons], embeds: [emb] })
    }
}