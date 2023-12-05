import {SlashCommandCarousel} from "../../BotBrew/modules/SlashCommandCarousel";
import {EmbedBuilder} from "discord.js";

module.exports = new SlashCommandCarousel()
    .setName("carousel")
    .setDescription("A carousel")
    .addPage(
        new EmbedBuilder()
            .setTitle("Page 1")
            .setDescription("This is page 1")
            .setColor(0x00ff00)
    )
    .addPage(
        new EmbedBuilder()
            .setTitle("Page 2")
            .setDescription("This is page 2")
            .setColor(0xff0000)
    )
    .addPage(
        new EmbedBuilder()
            .setTitle("Page 3")
            .setDescription("This is page 3")
            .setColor(0x0000ff)
    )