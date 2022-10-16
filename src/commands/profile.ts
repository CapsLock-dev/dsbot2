import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, getInventory, updateBalance } from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('profile'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
        const member = interaction.member as GuildMember
        const inv = await getInventory(client.pool, member.id)
        const emb = new EmbedBuilder()
            .setTitle(member.displayName)
            .setDescription(`Значки: ${inv.badges.join(' ')}`)
            .setFields({name: '', value: ''})
    }
}