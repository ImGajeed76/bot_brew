import {ChatInputCommandInteraction, Client, EmbedBuilder, GatewayIntentBits, REST, Routes} from "discord.js";
import {gray, green, red, redBright, yellow} from 'chalk-advanced';
import * as fs from "fs";
import {SlashCommand, SubCommand} from "./SlashCommand";

export class Bot {

    client: Client;
    clientReady: boolean = false;
    srcPath: string;
    token: string;

    commands: Record<string, SlashCommand> = {};
    variables: Record<string, any> = {};

    constructor(token: string, intents: GatewayIntentBits[], srcPath: string) {
        this.srcPath = srcPath;
        this.client = new Client({intents});
        this.token = token;
        this.setup();
    }

    async setup() {
        console.log()
        console.log(yellow("╭── Bot Starting..."));
        console.log(yellow("│"));

        this.client.once('ready', (readyClient) => {
            console.log(yellow("├── ") + green("Logged in as " + readyClient.user?.tag));
            console.log(yellow("│"));
            this.clientReady = true;
        });

        await this.client.login(this.token);

        while (!this.clientReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await this.registerCommands();
    }

    async registerCommands() {
        this.commands = {};

        // check if SlashCommands folder exists
        if (!fs.existsSync(`${this.srcPath}/SlashCommands`)) {
            console.log(red("├── ") + redBright("No SlashCommands folder found. Skipping command registration."));
            console.log(yellow("│"));
            return;
        }

        console.log(yellow("├── ") + gray("Registering slash commands..."));

        // iterate through folders in SlashCommands folder
        fs.readdirSync(`${this.srcPath}/SlashCommands`).forEach((folder) => {
            if (fs.lstatSync(`${this.srcPath}/SlashCommands/${folder}`).isDirectory()) {
                const folderName = folder;
                let slashCommand: SlashCommand | undefined = require(`${this.srcPath}/SlashCommands/${folder}/index.ts`);
                if (slashCommand instanceof SlashCommand) {
                    if (!slashCommand.builder.name) {
                        slashCommand.setName(folderName);
                    }
                    console.log(yellow("│") + gray("      - " + slashCommand.builder.name));
                }

                if (slashCommand) {
                    fs.readdirSync(`${this.srcPath}/SlashCommands/${folder}`).forEach((file) => {
                        if (fs.lstatSync(`${this.srcPath}/SlashCommands/${folder}/${file}`).isDirectory()) {
                            const subFolderName = file;

                            fs.readdirSync(`${this.srcPath}/SlashCommands/${folder}/${file}`).forEach((subFile) => {
                                if (subFile.endsWith('index.ts')) {
                                    const command = require(`${this.srcPath}/SlashCommands/${folder}/${subFolderName}/${subFile}`);
                                    if (command instanceof SubCommand) {
                                        if (!command.builder.name) {
                                            command.setName(subFolderName);
                                        }

                                        if (slashCommand) {
                                            slashCommand.addSubcommand(command.builder.name, command);
                                            console.log(yellow("│") + gray("      - " + slashCommand.builder.name + "/" + command.builder.name));
                                        }
                                    }
                                }
                            });
                        }
                    });

                    this.commands[slashCommand.builder.name] = slashCommand;
                }
            }
        });

        const rest = new REST({version: '9'}).setToken(this.token);

        try {
            console.log(yellow("├── ") + gray("Registering commands..."));

            await rest.put(
                Routes.applicationGuildCommands(this.client.user!.id, "828996782830125057"),
                {body: Object.values(this.commands).map(command => command.toJSON())},
            );

            console.log(yellow("├── ") + green("Successfully registered commands!"));
            console.log(yellow("│"));
        } catch (error) {
            console.log(red("├── ") + redBright("An error occurred while registering commands:"));
            console.log(red("│") + redBright("      - " + error));
        }

        this.client.on('interactionCreate', async (interaction) => {

            if (interaction.isButton()) {
                const customId = interaction.customId;

                for (const commandKey in this.commands) {
                    const command = this.commands[commandKey];
                    for (const buttonKey in command.buttons) {
                        if (buttonKey === customId) {
                            await command.buttons[buttonKey].callback(interaction, {
                                actionRow: command.actionRow,
                                client: this.client,
                                getMessageVariable: (name: string) => {
                                    return this.variables[`${interaction.message!.id}/${name}`];
                                },
                                setMessageVariable: (name: string, value: any) => {
                                    this.variables[`${interaction.message!.id}/${name}`] = value;
                                },
                                getUserVariable: (name: string) => {
                                    return this.variables[`${interaction.user.id}/${name}`];
                                },
                                setUserVariable: (name: string, value: any) => {
                                    this.variables[`${interaction.user.id}/${name}`] = value;
                                },
                            });
                            break;
                        }
                    }
                }
            }

            if (interaction.isChatInputCommand()) {
                const command = this.commands[interaction.commandName];

                if (!command) {
                    await interaction.reply({
                        content: 'An error occurred while executing this command!',
                        ephemeral: true
                    });
                    return;
                }

                const subCommandName = interaction.options.getSubcommand(false);

                try {
                    if (subCommandName) {
                        const subCommand = command.subCommands[subCommandName];
                        if (subCommand) {
                            await subCommand.executeFunction(interaction as ChatInputCommandInteraction, {
                                actionRow: subCommand.actionRow,
                                client: this.client,
                                getUserVariable: (name: string) => {
                                    return this.variables[`${interaction.user.id}/${name}`];
                                },
                                setUserVariable: (name: string, value: any) => {
                                    this.variables[`${interaction.user.id}/${name}`] = value;
                                },
                            });
                        }
                    }

                    await command.executeFunction(interaction as ChatInputCommandInteraction, {
                        actionRow: command.actionRow,
                        client: this.client,
                        getUserVariable: (name: string) => {
                            return this.variables[`${interaction.user.id}/${name}`];
                        },
                        setUserVariable: (name: string, value: any) => {
                            this.variables[`${interaction.user.id}/${name}`] = value;
                        },
                    });
                } catch (error) {
                    console.log(red("├── ") + redBright("An error occurred while executing command '" + command.builder.name + "':"));
                    console.log(red("│") + redBright("      - " + error));

                    const errorEmbed = new EmbedBuilder()
                        .setColor('#f54242') // Red color
                        .setDescription('There was an error while executing this command!');

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({embeds: [errorEmbed], ephemeral: true});
                    } else {
                        await interaction.reply({embeds: [errorEmbed], ephemeral: true});
                    }
                }
            }
        });
    }
}