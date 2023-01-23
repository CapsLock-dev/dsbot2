import { REST, Routes, IntentsBitField } from "discord.js";
import { Event, Command } from './interfaces'
import Bot from "./Client"
import { readdirSync } from "fs";

const client = new Bot({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.DirectMessages, 
                                    IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildPresences, 
                                    IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildVoiceStates] })
const commands = []

client.pool.query('CREATE TABLE IF NOT EXISTS users(id text CONSTRAINT id_pk PRIMARY KEY, lvl integer, exp integer, balance integer, inventory text[][])')
client.pool.query('CREATE TABLE IF NOT EXISTS stands(user_id text, name text, maxhp integer, lvl integer, exp integer, speed integer, defence integer, damage integer, expPerLvl integer, usedSkills text[], team boolean)')

for (const file of readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'))){
    const command: Command = require(`./commands/${file}`).command
    client.commands.set(command.data.name, command)
    console.log(command.data)
    commands.push(command.data.toJSON())
}

for (const file of readdirSync(__dirname  + '/events').filter(file=> file.endsWith('.js'))){
    const event: Event = require(`./events/${file}`).event
    if (event.once) {
        client.once(event.name, (...args) => event.exec(client, ...args))
    } else {
        client.on(event.name, (...args) => event.exec(client, ...args))
    }
}

if (process.env.TOKEN && process.env.GUILD_ID && process.env.CLIENT_ID) {    
    const rest = new REST({version:'10'}).setToken(process.env.TOKEN)
    rest.put(Routes.applicationGuildCommands(
        process.env.CLIENT_ID, process.env.GUILD_ID), {body: commands})
        .then(() => console.log('Commands deployed!'))
        .catch(console.error)

    client.login(process.env.TOKEN)
} else {
    console.log("env is undefined")
}
