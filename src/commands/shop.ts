import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, GuildMember, SelectMenuInteraction, Role } from "discord.js"
import { Command } from "../interfaces"
import { addChannelInv, addUser, getBalance, getInventory, updateBalance } from "../db"

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
                    { label: 'Стрела', description: 'Цена: 10000', value: 'arrow' }])
            )
        const message = await interaction.reply({ components: [menu], embeds: [emb], fetchReply: true })
        const collector = message.createMessageComponentCollector({ time: 60000 * 5 })
        collector.on('collect', async (i: SelectMenuInteraction) => {
            if (i.user.id !== member.id) return
            switch (i.values[0]) {
                case 'text':
                    if (await getBalance(client.pool, member.id) >= 6000) {
                        const everyone = member.guild.roles.cache.find(r => r.name === '@everyone') as Role
                        const channel = await member.guild.channels.create({
                            name: member.user.username,
                            parent: '1016804550788776076',
                            permissionOverwrites: [{ id: everyone.id, deny: ['ViewChannel'] }, { id: member.id, allow: ['ViewChannel'] }]
                        })
                        addChannelInv(client.pool, member.id, channel.id)
                        await updateBalance(client.pool, member.id, await getBalance(client.pool, member.id) - 6000)
                        i.reply({ content: 'Канал создан', ephemeral: true })
                    } else {
                        i.reply({ content: 'У вас недостаточно средств', ephemeral: true })
                    }
                    break;

                case 'arrow':
                    break;
            }
        })
    }
}