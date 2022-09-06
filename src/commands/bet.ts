import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, HexColorString } from "discord.js"
import { Command } from "../interfaces"
import {addUser, getBalance, updateBalance} from "../db"

enum Result {
    'проиграли' = 0,
    'выиграли' = 1
}

enum Colors {
    '#ff0000' = 0,
    '#00ff00' = 1
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('bet')
        .setDescription('Сделать ставку 50 на 50')
        .addNumberOption(option => option.setName('value').setRequired(true).setDescription('Сумма')),
    exec: async (client, interaction: CommandInteraction) => {
        if (!interaction.member) return
        const result: Result = Math.round(Math.random())
        const value = interaction.options.get('value', true).value as number
        const balance = await getBalance(client.pool, interaction.member.user.id)
        if (balance < value || value < 0) {
            interaction.reply('Неверная сумма')
            return
        }
        await updateBalance(client.pool, interaction.member.user.id, balance - value + value * 2 * result)
        const emb = new EmbedBuilder()
            .setColor(<HexColorString>Colors[result])
            .setTitle("Bet")
            .setDescription(`Вы ${Result[result]} ${value}`)
            .addFields({name: 'Ваш баланс:', value: `${balance - value + value * 2 * result}`})
        interaction.reply({embeds: [emb]})
    }
}