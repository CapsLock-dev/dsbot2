import { Event } from "../interfaces"
import { GuildMember, Message } from "discord.js"
import { removeUser } from "../db"


export const event: Event = {
    name: 'guildMemberRemove',
    once: false,
    exec: async (client, member: GuildMember) => {
        removeUser(client.pool, member.id)
    }
}