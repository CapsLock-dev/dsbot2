import Client from "../Client"
import { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandsOnlyBuilder, RESTPostAPIApplicationCommandsJSONBody } from "discord.js"

export interface Command{
    data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> | SlashCommandSubcommandsOnlyBuilder
    exec: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>
}