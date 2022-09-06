import Client from "../Client"
import { ClientEvents } from "discord.js"

export interface Event{
    name: keyof ClientEvents
    once: true | false
    exec: (client: Client, ...args: any[]) => Promise<void>
}