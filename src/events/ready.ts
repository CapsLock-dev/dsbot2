import { Event } from "../interfaces"
import { Guild, GuildMember, Message } from "discord.js"
import { addUser } from "../db"
import { CooldownController } from '../Client'

export const event: Event = {
    name: 'ready',
    once: true,
    exec: async (client) => {
        for (const guild of client.guilds.cache) {
            for (const member of guild[1].members.cache) {
                addUser(client.pool, member[1].id)
                client.cooldowns.set(member[1].id, new CooldownController())
            }
            console.log('Running on guild: ' + guild[1].name)

        }
        console.log('Bot is ready!')
    }
}
