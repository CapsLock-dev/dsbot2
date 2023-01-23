import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance } from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('bigbet')
        .setDescription('Ставка на несколько человек')
        .addIntegerOption(o => o.setName('value').setDescription('сумма').setRequired(true)),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        const userList: string[] = []
        const betValue = interaction.options.getInteger('value', true)
        let prize = betValue
        if (await getBalance(client.pool, interaction.member?.user.id as string) < betValue) {
            interaction.reply({ content: 'У вас недостаточно средств', ephemeral: true })
            return
        }
        updateBalance(client.pool, interaction.member?.user.id as string, await getBalance(client.pool, interaction.member?.user.id as string) - betValue)
        const row: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Bet')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('start')
                    .setLabel('Запустить')
                    .setStyle(ButtonStyle.Success)
            )
        const emb = new EmbedBuilder()
            .setTitle('Big Bet')
            .setDescription('Участники: ' + userList.join(', '))
            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }])
        const message = await interaction.reply({ embeds: [emb], components: [row], fetchReply: true })
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, max: 1 })
        collector.on('collect', async i => {
            if (userList.includes(i.member?.user.id as string)) return
            switch (i.customId) {
                case 'accept':
                    if (await getBalance(client.pool, i.member?.user.id as string) >= betValue) {
                        userList.push(i.member?.user.id as string)
                        prize += betValue
                        const emb = new EmbedBuilder()
                            .setTitle('Big Bet')
                            .setDescription('Участники: ' + userList.join(', '))
                            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }])
                        updateBalance(client.pool, i.member?.user.id as string, await getBalance(client.pool, i.member?.user.id as string) - betValue)
                        message.edit({ embeds: [emb], components: [row] })
                    } else {
                        i.reply({ content: 'У вас недостаточно средств', ephemeral: true })
                    }
                    break;

                case 'start':
                    if (interaction.user.id === i.member?.user.id) {
                        const winner = userList[Math.floor(Math.random() * userList.length)]
                        i.reply(`${interaction.guild?.members.cache.find(u => u.id === winner)?.user.username} выиграл ${prize}`)
                    }
                    break;
            }
        })
    }
}
