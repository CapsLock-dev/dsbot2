import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, GuildMember, SelectMenuInteraction, Role } from "discord.js"
import { Command } from "../interfaces"
import { addElementInv, addStand, addUser, getBalance, getInventory, getStands, updateBalance, updateStand } from "../db"
import { standList } from "./standBattles/data" 

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('shop'),
    exec: async (client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.member) return
        const member = interaction.member as GuildMember
        const emb = new EmbedBuilder()
            .setTitle('Магазин')
        const menu: any = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('shop')
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder('Выберите, чтобы купить')
                    .addOptions([{ label: 'Текстовый канал', description: 'Цена: 6000', value: 'text' },
                    { label: 'Стрела', description: 'Цена: 10000', value: 'arrow' },
                    { label: 'Легендарная стрела', description: 'Цена: 1000000', value: 'legendary_arrow' }])
            )
        const message = await interaction.reply({ components: [menu], embeds: [emb], fetchReply: true })
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 })
        collector.on('collect', async (i: SelectMenuInteraction) => {
            if (i.user.id !== member.id) return
            switch (i.values[0]) {
                case 'text':
                    if (await getBalance(client.pool, member.id) >= 6000) {
                        try {
                            const everyone = member.guild.roles.cache.find(r => r.name === '@everyone') as Role
                            const channel = await member.guild.channels.create({
                                name: member.user.username,
                                parent: '1046774338185076786',
                                permissionOverwrites: [{ id: everyone.id, deny: ['ViewChannel'] }, { id: member.id, allow: ['ViewChannel', 'ManageChannels'] }]
                            })
                            //addElementInv(client.pool, member.id, 'channels', channel.id)
                            await updateBalance(client.pool, member.id, await getBalance(client.pool, member.id) - 6000)
                            i.reply({ content: 'Канал создан', ephemeral: true })
                        } catch (e) {
                            console.log(e)
                            i.reply( {content: 'Недостаточно прав', ephemeral: true} )
                        }
                    } else {
                        i.reply({ content: 'У вас недостаточно средств', ephemeral: true })
                    }
                    break;

                case 'arrow':
                    if (await getBalance(client.pool, member.id) >= 10000) {
                        const userStands = await getStands(client.pool, member.id)
                        const stands = Object.keys(standList).filter((standName => {
                            for (const stand of userStands) {
                                if (stand.name == standName) return false
                            }
                            return true
                        }))
                        if (stands.length == 0) {
                            i.reply({ content: 'У вас уже есть все стенды', ephemeral: true })
                        } else {
                            const standName = stands[Math.round(Math.random() * (stands.length-1))]
                            const stand = new (standList[standName as keyof typeof standList])
                            await updateBalance(client.pool, member.id, await getBalance(client.pool, member.id) - 10000)
                            await addStand(client.pool, member.id, stand)
                            i.reply({content: 'Вы получили: ' + standName, ephemeral: true})
                        }
                    }
                    break;
            }
        })
    }
}
