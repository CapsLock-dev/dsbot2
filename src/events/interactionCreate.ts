import { Event } from "../interfaces"
import { Message, BaseInteraction } from "discord.js"

export const event: Event = {
    name: 'interactionCreate',
    once: false,
    exec: async (client, interaction: BaseInteraction) => {
        if (interaction.isChatInputCommand()) {
            const {commandName} = interaction
            if (client.commands.has(commandName)) {
                if (process.env.TOKEN == "NzA5NDU5MDQyMjQ5OTk4Mzk2.GQgv9r.isnEFlVTuW_fpAUic3nhiBD5O0k1-1ZKKqB4Io") {
                    if (interaction.user.id == '470188760777359361') {
                        client.commands.get(commandName)?.exec(client, interaction)
                    }
                } else {
                    client.commands.get(commandName)?.exec(client, interaction)
                }
            }
        }
    }
}