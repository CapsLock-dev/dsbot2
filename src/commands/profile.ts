import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle, SelectMenuInteraction, ButtonInteraction, ComponentType, ButtonComponent, TextBasedChannel, TextChannel, StringSelectMenuBuilder } from "discord.js"
import { Command } from "../interfaces"
import { addUser, getBalance, getExp, getInventory, getLvl, getStands, getTeamStands, updateBalance, updateStandTeam } from "../db"
import { SkillType, Stand } from "./standBattles/Stand"

async function sendRoleMenu(client: any, interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember
    const roleList = (await getInventory(client.pool, member.id)).filterArray('roles')
    const roleOptions = []
    for (const roleId of roleList) {
        const role = interaction.guild?.roles.cache.find(r => r.id === roleId)
        if (role) {
            roleOptions.push({ label: role.name, description: 'Включить/Выключить', value: role.id })
        } else {
            let channel = interaction.channel as TextChannel;
            channel.send(`Роли: ${roleId} не существует`)
        }
    }
    const emb = new EmbedBuilder()
        .setTitle(member.displayName)
        .setDescription('Ваши роли: ' + roleList.map(role => `<@&${role}>`).join(', '))
        .setColor("#dacaa4")
    const roleMenu: any = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
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
    return { embeds: [emb], components: [roleMenu, returnBtn] }
}

async function sendStandMenu(client: any, interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember
    const standList = await getStands(client.pool, member.id)
    const options = []
    for (const stand of standList) {
        options.push({ label: stand.name, description: 'Нажмите, чтобы редактировать', value: stand.name })
    }
    const standTeam = await getTeamStands(client.pool, member.id)
    const team = standTeam.map(stand => stand.name)
    const emb = new EmbedBuilder()
        .setTitle(member.displayName)
        .setDescription('Команда: ' + team.join(', '))
        .setColor("#dacaa4")
    const standMenu: any = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
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
    return { embeds: [emb], components: [standMenu, returnBtn] }
}

async function sendProfileMenu(client: any, interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember
    const inv = await getInventory(client.pool, member.id)
    const bal = await getBalance(client.pool, member.id)
    const serverDays = Math.round(((Date.now() as any) - (member.joinedAt as any)) / 1000 / 60 / 60 / 24).toString();
    const exp = await getExp(client.pool, member.id)
    const lvl = await getLvl(client.pool, member.id)
    const emb = new EmbedBuilder()
        .setTitle(member.displayName)
        .setDescription(`Награды: \nБаланс: ${bal}\nУровень: ${lvl}\nОпыт: ${exp}\nНа сервере: ${serverDays} дней`)
        .setThumbnail(member.avatarURL())
        .setColor("#dacaa4")
    const menu: any = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('menu')
                .setPlaceholder('Выберите опцию')
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions([{ label: 'Роли', description: 'Вкл/Выкл ролей', value: 'roles' },
                { label: 'Стенды', description: 'Ваши стенды', value: 'stands' }])
        )
    const closeButton: any = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('close')
                .setLabel('Закрыть')
                .setStyle(ButtonStyle.Danger)
        )
    return { embeds: [emb], components: [menu, closeButton] }
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('profile'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        const member = interaction.member as GuildMember
        if (!member || !member.joinedAt) return
        const inv = await getInventory(client.pool, member.id)
        const bal = await getBalance(client.pool, member.id)

        const message = await interaction.reply(await sendProfileMenu(client, interaction))
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 })
        let chosenStand: string

        collector.on('collect', async (i: SelectMenuInteraction | ButtonInteraction) => {
            if (i.member?.user.id !== interaction.user.id) return
            const member = i.member as GuildMember
            switch (i.componentType) {
                case ComponentType.StringSelect:
                    switch (i.customId) {
                        case "menu":
                            switch (i.values[0]) {
                                case 'roles':
                                    if (inv.filterArray('roles').length > 0) {
                                        message.edit(await sendRoleMenu(client, interaction))
                                        i.deferUpdate()
                                    } else {
                                        i.reply({ content: 'У вас нет ни одной купленной роли', ephemeral: true })
                                        i.deferUpdate()
                                    }
                                    break
                                case 'stands':
                                    const stands = await getStands(client.pool, member.id)
                                    if (stands.length > 0) {
                                        message.edit(await sendStandMenu(client, interaction))
                                        i.deferUpdate()
                                    } else {
                                        i.reply({ content: 'У вас нет ни одного стенда', ephemeral: true })
                                    }
                                    break
                            }
                            break
                        case 'roleMenu':
                            const value = i.values[0]
                            if (member.roles.cache.find(r => r.id === value)) {
                                console.log("role removed")
                                member.roles.remove(value)
                                i.deferUpdate()
                            } else {
                                member.roles.add(value)
                                console.log("role added")
                                i.deferUpdate()
                            }
                            break
                        case 'standMenu':
                            const standName = i.values[0]
                            chosenStand = standName
                            const stand = (await getStands(client.pool, member.id)).filter(stand => stand.name == standName)[0]
                            const skills = stand.usedSkills.map(skill => {
                                return {
                                    name: skill.name,
                                    value: `Описание: ${skill.description}\n КД: ${skill.cooldown}\n Тип: ${skill.type == SkillType.Special ? 'Спец' : 'Физ'}`, inline: true
                                }
                            })
                            const emb = new EmbedBuilder()
                                .setTitle(stand.name)
                                .setDescription(`HP: ${stand.maxhp}\nDamage: ${stand.damage}\nSpeed: ${stand.speed}\nDefence: ${stand.defence}`)
                                .addFields(skills)
                            if (stand.image) {
                                emb.setImage(stand.image)
                            }
                            const team = (await getTeamStands(client.pool, member.id)).find(stand => stand.name == standName)
                            let buttonName = team ? 'Убрать из команды' : 'Добавить в команду'
                            let buttonId = team ? 'removeTeam' : 'addTeam'
                            let buttonStyle = team ? ButtonStyle.Danger : ButtonStyle.Success
                            const btns: any = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('returnStand')
                                        .setLabel('Назад')
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId(buttonId)
                                        .setLabel(buttonName)
                                        .setStyle(buttonStyle)
                                )
                            message.edit({ components: [btns], embeds: [emb] })
                            i.deferUpdate()
                            break
                    }
                case ComponentType.Button:
                    switch (i.customId) {
                        case 'return':
                            message.edit(await sendProfileMenu(client, interaction))
                            i.deferUpdate()
                            break
                        case 'returnStand':
                            message.edit(await sendStandMenu(client, interaction))
                            i.deferUpdate()
                            break
                        case 'removeTeam':
                            if ((await getTeamStands(client.pool, member.id)).length <= 0) {
                                await updateStandTeam(client.pool, member.id, chosenStand, false)
                                i.reply({ ephemeral: true, content: `${chosenStand} убран из команды` })
                            } else {
                                i.reply({ ephemeral: true, content: `Команда пуста` })
                            }
                            const team = (await getTeamStands(client.pool, member.id)).find(stand => stand.name == chosenStand)
                            let buttonName = team ? 'Убрать из команды' : 'Добавить в команду'
                            let buttonId = team ? 'removeTeam' : 'addTeam'
                            let buttonStyle = team ? ButtonStyle.Danger : ButtonStyle.Success
                            const btns: any = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('returnStand')
                                        .setLabel('Назад')
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId(buttonId)
                                        .setLabel(buttonName)
                                        .setStyle(buttonStyle)
                                )
                            message.edit({ components: [btns] })
                            break
                        case 'addTeam':
                            if ((await getTeamStands(client.pool, member.id)).length < 5) {
                                await updateStandTeam(client.pool, member.id, chosenStand, true)
                                i.reply({ ephemeral: true, content: `${chosenStand} добавлен в команду` })
                            } else {
                                i.reply({ ephemeral: true, content: `Команда заполнена` })
                            }
                            const team1 = (await getTeamStands(client.pool, member.id)).find(stand => stand.name == chosenStand)
                            let buttonName1 = team ? 'Убрать из команды' : 'Добавить в команду'
                            let buttonId1 = team ? 'removeTeam' : 'addTeam'
                            let buttonStyle1 = team ? ButtonStyle.Danger : ButtonStyle.Success
                            const btns1: any = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('returnStand')
                                        .setLabel('Назад')
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId(buttonId1)
                                        .setLabel(buttonName1)
                                        .setStyle(buttonStyle1)
                                )
                            message.edit({ components: [btns1] })
                            message.edit(await sendStandMenu(client, interaction))
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
