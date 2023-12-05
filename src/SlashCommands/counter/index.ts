import {SlashCommand} from "../../BotBrew/modules/SlashCommand";
import {ButtonStyle, ChatInputCommandInteraction} from "discord.js";

module.exports = new SlashCommand()
    .setName("counter")
    .setDescription("Count up with a button")
    .addButton({
            label: "Up",
            style: ButtonStyle.Primary,
            customId: "count_up"
        },
        async (interaction, options) => {
            let count = options.getMessageVariable("count") ?? 0;
            count++;
            await interaction.update({
                content: "Counter " + count,
                components: [options.actionRow]
            });
            options.setMessageVariable("count", count);
        })
    .addButton({
            label: "Down",
            style: ButtonStyle.Danger,
            customId: "count_down"
        },
        async (interaction, options) => {
            let count = options.getMessageVariable("count") ?? 0;
            count--;
            await interaction.update({
                content: "Counter " + count,
                components: [options.actionRow]
            });
            options.setMessageVariable("count", count);
        })
    .onExecute(async (interaction, options) => {
        await interaction.reply({
            content: "Lol",
            components: [options.actionRow]
        });
    });