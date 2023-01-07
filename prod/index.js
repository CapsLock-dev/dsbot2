"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Client_1 = __importDefault(require("./Client"));
const fs_1 = require("fs");
const client = new Client_1.default({ intents: [discord_js_1.IntentsBitField.Flags.Guilds, discord_js_1.IntentsBitField.Flags.DirectMessages,
        discord_js_1.IntentsBitField.Flags.GuildMessages, discord_js_1.IntentsBitField.Flags.GuildPresences,
        discord_js_1.IntentsBitField.Flags.GuildMembers, discord_js_1.IntentsBitField.Flags.GuildVoiceStates] });
const commands = [];
client.pool.query('CREATE TABLE IF NOT EXISTS users(id text CONSTRAINT id_pk PRIMARY KEY, lvl integer, exp integer, balance integer, inventory text[][])');
client.pool.query('CREATE TABLE IF NOT EXISTS stands(user_id text, name text, maxhp integer, lvl integer, exp integer, speed integer, defence integer, damage integer, expPerLvl integer, usedSkills text[], team boolean)');
// client.pool.query('ALTER TABLE users ADD inventory text[][]')
for (const file of (0, fs_1.readdirSync)(__dirname + '/commands').filter(file => file.endsWith('.js'))) {
    const command = require(`./commands/${file}`).command;
    client.commands.set(command.data.name, command);
    console.log(command.data);
    commands.push(command.data.toJSON());
}
for (const file of (0, fs_1.readdirSync)(__dirname + '/events').filter(file => file.endsWith('.js'))) {
    const event = require(`./events/${file}`).event;
    if (event.once) {
        client.once(event.name, (...args) => event.exec(client, ...args));
    }
    else {
        client.on(event.name, (...args) => event.exec(client, ...args));
    }
}
if (process.env.TOKEN && process.env.GUILD_ID && process.env.CLIENT_ID) {
    const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.TOKEN);
    rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
        .then(() => console.log('Commands deployed!'))
        .catch(console.error);
    client.login(process.env.TOKEN);
}
else {
    console.log("env is undefined");
}
