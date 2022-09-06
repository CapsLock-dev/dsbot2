import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance } from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Кик. Цена: 1000')
        .addUserOption(option => option.setName('target').setDescription('Цель').setRequired(true)),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
        const target = interaction.options.getMember('target') as GuildMember
        const member = interaction.member as GuildMember
        if (client.cooldowns.get(member.id)?.findCooldown('kick')) {
            interaction.reply({ content: 'Вы не можете сейчас использовать кик', ephemeral: true })
            return
        }
        if (await getBalance(client.pool, member.id) >= 1000) {
            if (target.voice.channel) {
                await updateBalance(client.pool, member.id, await getBalance(client.pool, member.id) - 1000)
                target.voice.disconnect()
                interaction.reply({ content: 'Цель кикнута', ephemeral: true })
            } else {
                interaction.reply({ content: 'Цель не в канале', ephemeral: true })
            }
        } else {
            interaction.reply({ content: 'У вас недостаточно средств', ephemeral: true })
        }

    }
}