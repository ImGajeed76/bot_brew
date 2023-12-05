import {SlashCommand} from "../../BotBrew/modules/SlashCommand";
import {ChatInputCommandInteraction} from "discord.js";

module.exports = new SlashCommand()
    .setName("ping")
    .setDescription("Replies with pong!")
    .onExecute(async (interaction: ChatInputCommandInteraction) => {
        await interaction.reply("Pong!");
    });