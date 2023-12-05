// import and export all modules in src/BotBrew
module.exports = {
    ...require("./BotBrew/modules/Bot"),
    ...require("./BotBrew/modules/SlashCommand"),
    ...require("./BotBrew/modules/SlashCommandCarousel"),
    ...require("./BotBrew/modules/Languages"),
    ...require("./BotBrew/modules/DiscordEvent")
}