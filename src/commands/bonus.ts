import { SlashCommandBuilder, CommandInteraction } from "discord.js"
import { Command } from "../interfaces"
import {addUser, getBalance, updateBalance} from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('bonus')
        .setDescription('Получить ежечасный бонус'),
    exec: async (client, interaction: CommandInteraction) => {
        if (!interaction.member) return
        const cd = client.cooldowns.get(interaction.member.user.id);
        if (!cd?.findCooldown('bonus')) {
            const balance = await getBalance(client.pool, interaction.member.user.id)
            updateBalance(client.pool, interaction.member.user.id, balance + 100000)
            interaction.reply('Вы получили бонус 100000$')
            cd?.addCooldown('bonus', 3600)
        } else {
            interaction.reply('Вы не можете сейчас получить бонус')
        }
    }
}