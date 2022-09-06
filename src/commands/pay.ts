import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, EmbedBuilder } from "discord.js"
import { Command } from "../interfaces"
import {addUser, getBalance, updateBalance} from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Перевод на счет')
        .addUserOption(o=>o.setName('user').setDescription('получатель').setRequired(true))
        .addNumberOption(o=>o.setName('amount').setDescription('сумма').setRequired(true)),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        const member = interaction.member as GuildMember
        const reciever = interaction.options.getUser('user', true)
        const amount = interaction.options.getNumber('amount', true)
        const balance = await getBalance(client.pool, member.id)
        const recieverBalance = await getBalance(client.pool, reciever.id)
        if (balance > amount && amount >= 0) {
            updateBalance(client.pool, member.id, balance-amount)
            updateBalance(client.pool, reciever.id, recieverBalance+amount)
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`Перевод пользователю ${reciever.username} выполнен успшено`)
                .addFields({name: 'Сумма:', value: `${amount}`}, 
                           {name: 'Ваш баланс:', value: `${balance-amount}`}, 
                           {name: `Баланс получателя`, value: `${recieverBalance+amount}`, inline: true})
            interaction.reply({embeds:[embed]})
        } else {
            interaction.reply('Неверная сумма')
        }
    }
}