# BotBrew

## Introduction
BotBrew is a TypeScript-based npm package designed to facilitate the development of Discord bots, with a special emphasis on slash command functionality. This lightweight library is perfect for developers looking to streamline their bot development process with an easy-to-implement solution.

## Features
- **Slash Command Support**: Easily create and manage Discord slash commands.
- **TypeScript Integration**: Take advantage of TypeScript for more reliable and maintainable code.
- **Modular Command Structure**: Organize your commands in separate folders for better scalability.
- **Event Handling for Discord Events**: Efficiently handle various Discord events.
- **Simplified Bot Development**: Focus on your bot's functionality without worrying about boilerplate code.

## Installation
Install BotBrew in your project with the following command:

```bash
npm install botbrew
```

## Setting Up Your Bot
To set up your bot, add the following code in your main file:

```typescript
require("dotenv").config();
import { Bot } from "botbrew";
import { GatewayIntentBits } from "discord.js";

const bot = new Bot(process.env.DISCORD_TOKEN!, [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages], __dirname);
```

## Creating Slash Commands

1. Create a folder named SlashCommands in the same scope as your main file.
2. Inside SlashCommands, create a subfolder for each command, e.g., ping.
3. In each command folder, create an index.ts file. For example, for a "ping" command:
```typescript
import { SlashCommand } from "botbrew";
import { ChatInputCommandInteraction } from "discord.js";

module.exports = new SlashCommand()
    .setName("ping")
    .setDescription("Replies with pong!")
    .onExecute(async (interaction: ChatInputCommandInteraction) => {
        await interaction.reply("Pong!");
    });
```
BotBrew automatically scans the SlashCommands folder and adds these commands to your bot.

## Creating Subcommands
1. Create a `SlashCommands` folder in the same scope as your main file.
2. Inside `SlashCommands`, create a subfolder for each command, e.g., `echo`.
3. To add subcommands, create further subfolders within the command folder.

### Example: Echo Command
Folder structure for `echo` command with `once` and `twice` subcommands:

```
SlashCommands
└── echo
    ├── index.ts
    ├── once
    │   └── index.ts
    └── twice
        └── index.ts
```

#### once/index.ts
```typescript
import {SubCommand} from "botbrew";

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
```

#### twice/index.ts
```typescript
import {SubCommand} from "botbrew";

module.exports = new SubCommand()
    .setDescription("Echoes your message twice!")
    .addStringOption(option => option
        .setName("message")
        .setDescription("The message to echo")
        .setRequired(true)
    )
    .onExecute(async (interaction) => {
        await interaction.reply((interaction.options.getString("message")!) + " " + (interaction.options.getString("message")!));
    });
```

#### index.ts
```typescript
import {SlashCommand} from "botbrew";

module.exports = new SlashCommand()
    .setDescription("Echoes your message!");
```

`Note: ` If no command name is provided, the name of the command folder is used as the command name. In this case, the command name is `echo`. and the subcommands are `once` and `twice`.


## License
BotBrew is [ISC licensed.](https://opensource.org/license/isc-license-txt/)