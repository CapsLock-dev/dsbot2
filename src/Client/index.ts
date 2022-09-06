import { Client, Collection, Role } from "discord.js";
import { Command, Event } from "../interfaces"
import { Pool } from 'pg'

const pgClient = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'root',
    database: 'mydb',
    port: 5432
})

export class CooldownController {
    cooldowns: Array<string> = []
    constructor(){}
    async addCooldown(name: string, time:number): Promise<void> {
        if (!this.cooldowns.includes(name)) {
            this.cooldowns.push(name);
            setTimeout(() => {
                this.cooldowns.filter((value:string) => value !== name)
            }, time * 1000)
        }
    }
    findCooldown(name: string): boolean {
        return this.cooldowns.includes(name)
    }
}

class MuteImmune {
    members: Array<string> = []
    async addMuteImmune(id: string, time: number) {
        if (!this.members.includes(id)) {
            this.members.push(id)
            setTimeout(() => {
                this.members.filter((value:string) => value !== id)
            }, time * 1000)
        }
    }
}

class Bot extends Client
{
    commands: Collection<string, Command> = new Collection()
    pool: Pool = pgClient
    cooldowns: Collection<string, CooldownController> = new Collection()
    muteImmune: MuteImmune = new MuteImmune()
}

export default Bot