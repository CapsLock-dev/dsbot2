import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance } from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('achievements'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
    }
}