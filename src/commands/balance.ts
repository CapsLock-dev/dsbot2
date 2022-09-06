import { SlashCommandBuilder, CommandInteraction } from "discord.js"
import { Command } from "../interfaces"
import {addUser, getBalance} from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Узнать баланс'),
    exec: async (client, interaction: CommandInteraction) => {
        if (!interaction.member) return
        await addUser(client.pool, interaction.member.user.id);
        const balance = await getBalance(client.pool, interaction.member.user.id);
        interaction.reply(`Ваш баланс: ${balance}$`)
    }
}