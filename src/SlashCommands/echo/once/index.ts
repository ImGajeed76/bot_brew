import {SubCommand} from "../../../BotBrew/modules/SlashCommand";

module.exports = new SubCommand()
    .setDescription("Echoes your message!")
    .addStringOption(option => option
        .setName("message")
        .setDescription("The message to echo")
        .setRequired(true)
    )
    .onExecute(async (interaction) => {
        await interaction.reply((interaction.options.getString("message")!));
    });
