import { Event } from "../interfaces"
import { GuildMember, Message } from "discord.js"
import { addUser } from "../db"


export const event: Event = {
    name: 'guildMemberAdd',
    once: false,
    exec: async (client, member: GuildMember) => {
        addUser(client.pool, member.id)
    }
}