import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, Role } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance } from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Мут. КД: 60 сек.')
        .addUserOption(option => option.setName('user').setDescription('Цель').setRequired(true))
        .addNumberOption(option => option.setName('time').setDescription('Время в секундах. Стоимость: 10 за сек.').setRequired(true)),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
        const member = interaction.member as GuildMember
        const target = interaction.options.getMember('user') as GuildMember
        const time = interaction.options.getNumber('time', true)
        if (client.cooldowns.get(member.id)?.findCooldown('mute')) {
            interaction.reply({ ephemeral: true, content: 'Вы не можете сейчас использовать мут' })
            return
        }
        if (await getBalance(client.pool, member.id) >= time * 10) {
            const muteRole = await interaction.guild?.roles.fetch('1012129124778786817')
            if (!muteRole) {
                interaction.reply({ ephemeral: true, content: 'Мут роли не существует' })
            } else {
                if (!target.roles.cache.find(role => role.id === muteRole.id)) {
                    const balance = await getBalance(client.pool, member.id)
                    updateBalance(client.pool, member.id, balance - time * 10)
                    const deletedRoles: Role[] = []
                    for (const role of target.roles.cache) {
                        try {
                            console.log(role[1].id)
                            await target.roles.remove(role[1])
                            deletedRoles.push(role[1])
                        } catch (error) { }
                    }
                    await target.roles.add(muteRole)
                    setTimeout((target: GuildMember) => {
                        target.roles.add(deletedRoles)
                    }, time * 1000, target)
                    interaction.reply({ ephemeral: true, content: 'Цель получила мут на ' + time + ' секунд' })
                } else {
                    interaction.reply({ ephemeral: true, content: 'Цель уже в муте' })
                }
            }
        } else {
            interaction.reply({ ephemeral: true, content: 'У вас недостатчно средств' })
        }
    }
}