import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ButtonStyle, SelectMenuInteraction, ButtonInteraction, SelectMenuComponent, ComponentType} from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance, getInventory} from "../db"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Переключение ролей'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
        const member = interaction.member as GuildMember
        if (!(await getInventory(client.pool, member.id)).filterArray('roles')) {
            interaction.reply('У вас нет ни одной купленной роли')
            return
        }
            const roleList = (await getInventory(client.pool, member.id)).filterArray('roles')
            const roleOptions = []
            for (const roleId of roleList) {
                const role = interaction.guild?.roles.cache.find(r => r.id === roleId)
                if (role) {
                    roleOptions.push({ label: role.name, description: 'Включить/Выключить', value: role.id })
                } else {
                    interaction.channel?.send(`Роли: ${roleId} не существует`)
                }
            }
            const roleMenu: any = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('roleMenu')
                        .setPlaceholder('Выберите роль для переключения')
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(roleOptions),
                )
            const returnBtn: any = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close')
                        .setLabel('Закрыть')
                        .setStyle(ButtonStyle.Secondary)
                )
        const msg = await interaction.reply({components: [roleMenu, returnBtn], fetchReply: true})
        const collector = msg.createMessageComponentCollector({ time: 60000 * 5 })
        collector.on('collect', async (i: SelectMenuInteraction | ButtonInteraction) => {
            switch(i.componentType) {
                case ComponentType.SelectMenu:
                    const value = i.values[0]
                    if (member.roles.cache.find(r => r.id === value)) {
                        member.roles.remove(value)
                    } else {
                        member.roles.add(value)
                    }
                    break
                case ComponentType.Button:
                    collector.stop()
                    break
            }
        })
        collector.on('end', async () => {
            msg.delete()
        })
    }
}
