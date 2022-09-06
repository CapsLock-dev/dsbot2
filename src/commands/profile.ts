import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance } from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('profile'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
    }
}