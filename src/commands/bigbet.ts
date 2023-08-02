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
        const author = interaction.member as GuildMember
        let prize = betValue
        let balance = await getBalance(client.pool, author.id)
        if (balance < betValue) {
            interaction.reply({ content: 'У вас недостаточно средств', ephemeral: true })
            return
        }
        userList.push(author.id)
        updateBalance(client.pool, author.id, balance - betValue)
        const row: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Сделать ставку')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('start')
                    .setLabel('Начать')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Отменить')
                    .setStyle(ButtonStyle.Danger),
            )
        const emb = new EmbedBuilder()
            .setTitle('Big Bet')
            .setDescription('Участники: ' + userList.map(id => { return `<@${id}>` }).join(', '))
            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }])
            .setColor("#dacaa4")
        const message = await interaction.reply({ embeds: [emb], components: [row], fetchReply: true })
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 * 5 })
        collector.on('collect', async i => {
            if (!i.member) return
            const member = i.member as GuildMember
            balance = await getBalance(client.pool, member.id)
            switch (i.customId) {
                case 'accept':
                    if (userList.find(id => id == member.id)) {
                        await i.reply({ content: 'Вы уже участвуете', ephemeral: true })
                        break
                    }
                    if (balance >= betValue) {
                        userList.push(`${member.id}`)
                        prize += betValue
                        const emb = new EmbedBuilder()
                            .setTitle('Big Bet')
                            .setDescription('Участники: ' + userList.map(id => { return `<@${id}>` }).join(', '))
                            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }])
                            .setColor("#dacaa4")
                        await updateBalance(client.pool, member.id, balance - betValue)
                        i.deferUpdate()
                        message.edit({ embeds: [emb], components: [row] })
                    } else {
                        await i.reply({ content: 'У вас недостаточно средств', ephemeral: true })
                    }
                    break;

                case 'start':
                    if (member.id == author.id) {
                        const winner = userList[Math.floor(Math.random() * userList.length)]
                        const emb = new EmbedBuilder()
                            .setTitle('Big Bet')
                            .setDescription('Участники: ' + userList.map(id => { return `<@${id}>` }).join(', '))
                            .setFields([{ name: 'Ставка: ', value: `${betValue}` }, { name: 'Выигрыш', value: prize.toString() }, 
                                        {name: 'Выиграл: ', value: `<@${winner}>`}])
                            .setColor("#dacaa4")
                        i.deferUpdate()
                        message.edit({ embeds: [emb] })
                        await updateBalance(client.pool, winner, balance + prize)
                        collector.stop()
                    } else {
                        await i.reply({ content: 'Вы не можете начать, т.к вы не создатель ставки', ephemeral: true })
                    }
                    break;
                case 'cancel':
                    if (member.id == author.id) {
                        await message.edit({ content: 'Отменено', embeds: [], components: [] })
                        userList.forEach(async id => {
                            const balance = await getBalance(client.pool, id)
                            await updateBalance(client.pool, id, balance + betValue)
                        })
                        collector.stop()
                    } else {
                        await i.reply({ content: 'Вы не можете начать, т.к вы не создатель ставки', ephemeral: true })
                    }
                    break
            }
        })
        collector.on('end', async (i) => {
            message.edit({components: []})
        })
    }
}
