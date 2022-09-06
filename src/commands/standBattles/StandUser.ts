import { ButtonInteraction, GuildMember, InteractionCollector, CacheType, DMChannel, ComponentType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js'
import { Fight } from './Fight';
import { Skill, Stand } from './Stand';

export class StandUser {
    readonly member: GuildMember
    readonly stands: Stand[]
    readonly fight: Fight
    dm: DMChannel
    collector: InteractionCollector<ButtonInteraction<CacheType>>
    ready: boolean = false
    chosenSpell: Skill | null = null
    chosenStand: Stand | null = null
    freezed: number = 0
    message!: Message
    constructor(member: GuildMember, stands: Stand[], dm: DMChannel, fight: Fight) {
        this.member = member
        this.stands = stands
        this.fight = fight
        this.dm = dm
        this.collector = dm.createMessageComponentCollector({ componentType: ComponentType.Button })
        this.collector.on('collect', async (i: ButtonInteraction) => {
            this.buttonHandler(i)
        })
        this.sendMenu()
    }
    buttonHandler(i: ButtonInteraction) {
        switch (i.customId) {
            case '':

        }
    }
    async sendMenu() {
        const emb = new EmbedBuilder()
            .setTitle('Fight')
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
        this.message = await this.dm.send({components: [buttons], embeds: [emb]})
    }
}