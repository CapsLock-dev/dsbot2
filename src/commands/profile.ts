import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, SelectMenuInteraction, ButtonInteraction, ComponentType} from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, getExp, getInventory, getLvl, getStands, updateBalance } from "../db"
import { measureMemory } from "vm"
import { memoryUsage } from "process"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('profile'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
        const member = interaction.member as GuildMember
        const inv = await getInventory(client.pool, member.id)
        const bal = await getBalance(client.pool, member.id)
        if (!member.joinedAt) { return }

        async function sendRoleMenu() {
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
                        .setCustomId('return')
                        .setLabel('Назад')
                        .setStyle(ButtonStyle.Secondary)
                )
            return { components: [roleMenu, returnBtn] }
        }
        async function sendChannelMenu() {
            const channelList = (await getInventory(client.pool, member.id)).filterArray('channels')
            const options = []
            for (const channelId in channelList) {
                const channel = member.guild.channels.cache.find(c => c.id === channelId)
                if (channel) {
                    options.push({ label: channel.name, description: 'Нажмите чтобы редактировать', value: channelId })
                }
            }
            const channelMenu: any = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('channelMenu')
                        .setPlaceholder('Выберите канал для редактирования')
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(options),
                )
            const returnBtn: any = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('return')
                        .setLabel('Назад')
                        .setStyle(ButtonStyle.Secondary)
                )
            return { components: [channelMenu, returnBtn] }
        }
        async function sendStandMenu() {
            const standList = await getStands(client.pool, member.id)
            const options = []
            for (const stand of standList) {
                options.push({ label: stand.name, description: 'Нажмите, чтобы редактировать', value: stand.name})
            }
            const standMenu: any = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('standMenu')
                        .setPlaceholder('Выберите стенд для редактирования')
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(options),
                )
            const returnBtn: any = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('return')
                        .setLabel('Назад')
                        .setStyle(ButtonStyle.Secondary)
                )
            return { components: [standMenu, returnBtn] }
        }

        const serverDays = Math.round(((Date.now() as any) - (member.joinedAt as any)) / 1000 / 60 / 60 / 24).toString();
        const exp = getExp(client.pool, member.id)
        const lvl = getLvl(client.pool, member.id)
        const emb = new EmbedBuilder()
            .setTitle(member.displayName)
            .setDescription(`Награды: \nБаланс: ${bal}\nУровень: ${lvl}\nОпыт: ${exp}\nНа сервере: ${serverDays} дней`)
            .setThumbnail(member.avatarURL())
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('menu')
                    .setPlaceholder('Выберите опцию')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .addOptions([{label: 'Роли', description: 'Вкл/Выкл ролей', value: 'roles'},
                    {label: 'Каналы', description: 'Настройка личных каналов', value: 'channels'},
                    {label: 'Стенды', description: 'Ваши стенды', value: 'stands'}])
            )
        const closeButton: any =  new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close')
                    .setLabel('Закрыть')
                    .setStyle(ButtonStyle.Danger)
            )
        const message = await interaction.reply({embeds: [emb], components:[menu, closeButton], fetchReply: true})
        const collector = message.createMessageComponentCollector({time:60000*5})
        collector.on('collect', async (i: SelectMenuInteraction | ButtonInteraction) => { 
            if (i.member?.user.id !== interaction.user.id) return
            const member = i.member as GuildMember
            switch (i.componentType) {
                case ComponentType.SelectMenu:
                    switch (i.customId) {
                        case 'roles':
                            if (inv.filterArray('roles')) {
                                message.edit(await sendRoleMenu())
                            } else {
                                i.reply('У вас нет ни одной купленной роли')
                            }
                            break
                        case 'roles':
                            const value = i.values[0]
                            if (member.roles.cache.find(r => r.id === value)) {
                                member.roles.remove(value)
                            } else {
                                member.roles.add(value)
                            }
                            break
                        case 'channels':

                            break
                        case 'channels':
                            if (inv.filterArray('channels')) {
                                message.edit(await sendChannelMenu())
                            } else {
                                i.reply('У вас нет ни одного купленного канала')
                            }
                            break
                        case 'stands':
                            const stands = await getStands(client.pool, member.id)
                            if (stands) {
                                message.edit(await sendStandMenu())
                            } else {
                                i.reply('У вас нет ни одного стенда')
                            }
                            break
                            
                    }
                    break
                case ComponentType.Button:
                    switch (i.customId) {
                        case 'return':
                            message.edit({ components: [menu, closeButton] })
                            break

                        case 'close':
                            collector.stop()
                            break
                    }
                    break
            }
        })
        collector.on('end', async () => {
            message.delete()
        })
    }
}
/**
 * TODO:
 * Сделать инвентарь частью профиля
 * Сделать работы (Шахтер: идет в шахту и у него появляются на выбор действия, в шахте можно копать руду и дратсья с мобами ну короче ты вспомнишь наверно)
 * Сделать систему опыта
 */
