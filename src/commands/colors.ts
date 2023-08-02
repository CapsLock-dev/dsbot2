import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, APISelectMenuOption, StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, Guild, ButtonInteraction, ComponentType, ButtonBuilder, ButtonStyle, Role, Message, ColorResolvable } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, updateBalance, getInventory, addElementInv} from "../db"
import { Inventory } from "./classes/Inventory"

const hexColors = [{ name: 'Pale Violet', hex: '#A387D7' }]
const colors: Array<{name: string, id: string}> = []

async function updateShopMenu(client: any, interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember
    const colorList: APISelectMenuOption[] = []
    const buyedRoles: string[] = (await getInventory(client.pool, member.id)).filterArray('roles')
    for (const role of colors) {
        const description =  !buyedRoles || buyedRoles.includes(role.id) ? 'Куплено' : 'Цена: 5000'
        colorList.push({ label: role.name, description: description, value: role.id });
    }
    const shopMenuEmb = new EmbedBuilder()
        .setTitle('Магазин цветных ролей')
        .setDescription('При выборе роли откроется меню покупки')
    const productMenu: any = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('colors')
            .setPlaceholder('Выберите роль')
            .setMaxValues(1)
            .setMinValues(1)
            .addOptions(colorList)
    )
    const returnBtn: any = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('escape')
            .setLabel('Закрыть')
            .setStyle(ButtonStyle.Danger)
    )
    return { components: [productMenu, returnBtn], embeds: [shopMenuEmb], fetchReply: true }
}

function prepareColorRoles(interaction: ChatInputCommandInteraction) {
    hexColors.forEach(async (hexColor) => {
        let exists = false
        for (const guildRole of interaction.guild!.roles.cache) {
            if (guildRole[1].name == hexColor.name) {
                colors.push({name: hexColor.name, id: guildRole[1].id})
                exists = true
                break
            }
        }
        if (!exists) {
            const newRole = await interaction.guild!.roles.create({name: hexColor.name, color: hexColor.hex as ColorResolvable, reason: "doesn't exists"})
            colors.push({name: hexColor.name, id: newRole.id})
        }
    })
}


export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('colors')
        .setDescription('Цвета'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        prepareColorRoles(interaction)

        const member = interaction.member as GuildMember
        const roleList: string[] = []
        colors.map((el) => {
            roleList.push(el.id)
        })

        let buyedRoles: string[] = (await getInventory(client.pool, member.id)).filterArray('roles')
        let shopMenu = await updateShopMenu(client, interaction)

        const message = await interaction.reply(shopMenu) as unknown as Message
        let chosenRole: Role 
        
        const collector = message.createMessageComponentCollector({time:60000*5})
        collector.on('collect', async (i: StringSelectMenuInteraction | ButtonInteraction) => {
            if (i.user.id !== interaction.user.id && i.guild) return
            // Обновление списка купленных ролей
            buyedRoles = (await getInventory(client.pool, member.id)).filterArray('roles')
            // Обновление меню магазина
            shopMenu = await updateShopMenu(client, interaction)
            switch (i.componentType) {
                case ComponentType.Button:
                    switch (i.customId) {
                        case 'buy':
                            const bal = await getBalance(client.pool, member.id)
                            // Если нет купленных ролей или роль не куплена
                            if (!buyedRoles || !buyedRoles.includes(chosenRole.id)) {
                                if (bal > 5000) {
                                    await updateBalance(client.pool, member.id, bal - 5000)
                                    if (!member.roles.cache.find(r => r.id === chosenRole.id)) member.roles.add(chosenRole)
                                    addElementInv(client.pool, member.id, 'roles', chosenRole.id)
                                    i.reply({ content: `Вы купили роль ` + chosenRole.name, ephemeral: true })
                                    message.edit(shopMenu)
                                } else {
                                    i.reply({ content: `У вас недостаточно средств`, ephemeral: true })
                                }
                            } else {
                                i.reply({ content: `У вас уже есть эта роль`, ephemeral: true })
                            }
                            break

                        case 'try':
                            if (!member.roles.cache.find(role => role.id === chosenRole.id)) {
                                member.roles.add(chosenRole)
                                const roleToRemove = chosenRole
                                setTimeout(async () => {
                                    const buyedRoles = (await getInventory(client.pool, member.id)).filterArray('roles')
                                    // У юзера все еще есть роль и она не куплена
                                    if (member.roles.cache.find(role => role.id === roleToRemove.id) && (!buyedRoles || !buyedRoles.includes(roleToRemove.id))) {
                                        member.roles.remove(roleToRemove)
                                    }
                                }, 15000)
                            }
                            break

                        case 'return':
                            message.edit(shopMenu)
                            break
                        case 'escape':
                            collector.stop()
                            break
                    }
                    break

                case ComponentType.StringSelect:
                    let colorRoleId = i.values[0]
                    const userRoles = (await getInventory(client.pool, member.id)).filterArray('roles')
                    if (!userRoles || !userRoles.includes(colorRoleId)) {
                        chosenRole = await i.guild?.roles.fetch(colorRoleId) as Role
                        if (!chosenRole) {
                            message.reply({ content: `Colors error: ${colorRoleId} doesn't exists` })
                            return
                        }
                        const roleMenu: any = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buy')
                                    .setLabel('Купить')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId('try')
                                    .setLabel('Попробовать')
                                    .setStyle(ButtonStyle.Primary),
                                new ButtonBuilder()
                                    .setCustomId('return')
                                    .setLabel('Вернуться')
                                    .setStyle(ButtonStyle.Danger)
                            )
                        const roleMenuEmb = new EmbedBuilder()
                            .setTitle(`Купить роль ${chosenRole.name}`)
                            .setDescription('Цвет: <@&' + colorRoleId + '>\nЦена: 5000')
                        const roleMenuMsg = { components: [roleMenu], embeds: [roleMenuEmb] }
                        i.deferUpdate()
                        message.edit(roleMenuMsg)
                    } else {
                        i.reply({ content: 'У вас уже есть эта роль', ephemeral: true })
                    } 
                    break
            }
        })
        collector.on('end', async (i) => {
            message.delete()
        })
    }
}
