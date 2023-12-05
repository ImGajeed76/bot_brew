import {SlashCommand} from "./SlashCommand";
import {ButtonStyle, EmbedBuilder} from "discord.js";

export class SlashCommandCarousel extends SlashCommand {
    pages: EmbedBuilder[] = [];

    constructor(
        previousButton:
            { label: string, style: ButtonStyle } =
            {label: "Previous", style: ButtonStyle.Primary},
        nextButton:
            { label: string, style: ButtonStyle } =
            {label: "Next", style: ButtonStyle.Primary}
    ) {
        super();

        this.addButton(
            {
                label: previousButton.label,
                style: previousButton.style,
                customId: "carousel_previous"
            },
            async (interaction, options) => {
                let page = options.getMessageVariable("page") ?? 0;
                page--;
                if (page < 0) page = this.pages.length - 1;
                await interaction.update({
                    embeds: [this.pages[page]],
                    components: [options.actionRow]
                });
                options.setMessageVariable("page", page);
            }
        )

        this.addButton(
            {
                label: nextButton.label,
                style: nextButton.style,
                customId: "carousel_next"
            },
            async (interaction, options) => {
                let page = options.getMessageVariable("page") ?? 0;
                page++;
                if (page >= this.pages.length) page = 0;
                await interaction.update({
                    embeds: [this.pages[page]],
                    components: [options.actionRow]
                });
                options.setMessageVariable("page", page);
            }
        )

        this.onExecute(async (interaction, options) => {
            await interaction.reply({
                embeds: [this.pages[0]],
                components: [options.actionRow]
            });
        });
    }

    addPage(page: EmbedBuilder) {
        this.pages.push(page);
        return this;
    }
}