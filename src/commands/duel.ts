import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, ComponentType, EmbedBuilder } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance, getStands } from "../db"
import { Fight } from "./standBattles/Fight"
import { StandUser } from "./standBattles/StandUser"

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
        new Fight(member, await getStands(client.pool, member.id), dm1, opponent, await getStands(client.pool, opponent.id), dm2)
    }
}