import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, ComponentType, EmbedBuilder, TextBasedChannel, TextChannel } from "discord.js"
import { Command } from "../interfaces"
import { getStands } from "../db"
import { Fight } from "./standBattles/Fight"
export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('duel')
        .setDescription('duel')
        .addUserOption(option=>option.setName('opponent').setDescription('противник').setRequired(true)),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
        const opponent = interaction.options.getMember('opponent') as GuildMember
        const member = interaction.member as GuildMember
        const dm1 = await member.createDM()
        const dm2 = await opponent.createDM()
        new Fight(interaction.channel as TextChannel,member, await getStands(client.pool, member.id), dm1, opponent, await getStands(client.pool, opponent.id), dm2)
    }
}
