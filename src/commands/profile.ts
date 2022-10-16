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
/**
 * TODO:
 * Сделать инвентарь частью профиля
 * Сделать работы (Шахтер: идет в шахту и у него появляются на выбор действия, в шахте можно копать руду и дратсья с мобами ну короче ты вспомнишь наверно)
 * Сделать систему опыта
 */