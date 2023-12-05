import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GatewayIntentBits,
    Interaction
} from "discord.js";
import {green, red, redBright, yellow} from 'chalk-advanced';
import {SlashCommand} from "./SlashCommand";
import {Languages} from "./Languages";
import {SlashCommandRegistrar} from "./SlashCommandRegistrar";
import {DiscordEventRegistrar} from "./DiscordEventRegistrar";
import {Store} from "./Store";

export class Bot {
    client: Client;
    clientReady: boolean = false;
    srcPath: string;
    token: string;

    commands: Record<string, SlashCommand> = {};
    stores: Record<string, Store> = {};

    languages: Languages | undefined;

    guildId: string | undefined;

    log: boolean = true;

    constructor(token: string, intents: GatewayIntentBits[], srcPath: string, guildId?: string, log: boolean = true) {
        this.srcPath = srcPath;
        this.client = new Client({intents});
        this.token = token;
        this.guildId = guildId;
        this.log = log;
        this.setup();
    }

    async setup() {
        this.logLine("")
        this.logLine(yellow("╭── Bot Starting..."));
        this.logLine(yellow("│"));

        this.client.once('ready', (readyClient: Client) => {
            this.logLine(yellow("├── ") + green("Logged in as " + readyClient.user?.tag));
            this.logLine(yellow("│"));
            this.clientReady = true;
        });

        await this.client.login(this.token);

        while (!this.clientReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.languages = new Languages(this.srcPath);
        await this.registerAll();

        this.logLine(yellow("╰── Bot Started!"));
        this.logLine("");
    }

    private logLine(content: string) {
        if (this.log) {
            console.log(content);
        }
    }

    async registerAll() {
        const commandRegistrar = new SlashCommandRegistrar(
            this.srcPath,
            this.languages,
            this.log
        );
        await commandRegistrar.buildCommandList();
        await commandRegistrar.registerCommands(
            this.token,
            this.client.user!.id,
            this.guildId,
        );

        this.commands = commandRegistrar.commands;

        const eventRegistrar = new DiscordEventRegistrar(
            this.srcPath,
            this.log
        );
        await eventRegistrar.buildEventList();
        await eventRegistrar.registerEvents(this.client);

        await this.registerInteractionEvent();
    }

    async registerInteractionEvent() {
        this.client.on('interactionCreate', async (interaction: Interaction) => {
            if (interaction.isButton()) {
                await this.buttonInteraction(interaction);
            }

            if (interaction.isChatInputCommand()) {
                await this.chatInteraction(interaction);
            }
        });
    }


    async buttonInteraction(interaction: ButtonInteraction) {
        const customId = interaction.customId;

        for (const commandKey in this.commands) {
            const command = this.commands[commandKey];
            for (const buttonKey in command.buttons) {
                if (buttonKey === customId) {
                    await command.buttons[buttonKey].callback(
                        interaction,
                        this.stores[interaction.user.id] ?? (() => {this.stores[interaction.user.id] = new Store(); return this.stores[interaction.user.id];})(),
                        this.stores[interaction.message.id] ?? (() => {this.stores[interaction.message.id] = new Store(); return this.stores[interaction.message.id];})(),
                        {
                            actionRow: command.actionRow,
                            client: this.client,
                            getUserMessageInLanguage: (key: string) => {
                                if (this.languages) {
                                    const language = this.languages.getLanguage(interaction.locale);
                                    if (language.get(key)) {
                                        return language.get(key);
                                    }
                                    return undefined;
                                }
                                return undefined;
                            },
                            getServerMessageInLanguage: (key: string) => {
                                if (this.languages) {
                                    const language = this.languages.getLanguage(interaction.guild!.preferredLocale);
                                    if (language.get(key)) {
                                        return language.get(key);
                                    }
                                    return undefined;
                                }
                                return undefined;
                            }
                        });
                    break;
                }
            }
        }
    }

    async chatInteraction(interaction: ChatInputCommandInteraction) {
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
            const executeArguments = {
                client: this.client,
                createMessageStore: (messageId: string) => {
                    if (!this.stores[messageId]) {
                        this.stores[messageId] = new Store();
                    }
                    return this.stores[messageId];
                },
                getUserMessageInLanguage: (key: string) => {
                    if (this.languages) {
                        const language = this.languages.getLanguage(interaction.locale);
                        if (language.get(key)) {
                            return language.get(key);
                        }
                        return undefined;
                    }
                    return undefined;
                },
                getServerMessageInLanguage: (key: string) => {
                    if (this.languages) {
                        const language = this.languages.getLanguage(interaction.guild!.preferredLocale);
                        if (language.get(key)) {
                            return language.get(key);
                        }
                        return undefined;
                    }
                    return undefined;
                }
            }

            if (subCommandName) {
                const subCommand = command.subCommands[subCommandName];
                if (subCommand) {
                    await subCommand.executeFunction(
                        interaction as ChatInputCommandInteraction,
                        this.stores[interaction.user.id] ?? (() => {this.stores[interaction.user.id] = new Store(); return this.stores[interaction.user.id];})(),
                        {
                        actionRow: subCommand.actionRow,
                        ...executeArguments
                    });
                }
            }

            await command.executeFunction(
                interaction as ChatInputCommandInteraction,
                this.stores[interaction.user.id] ?? (() => {this.stores[interaction.user.id] = new Store(); return this.stores[interaction.user.id];})(),
                {
                    actionRow: command.actionRow,
                    ...executeArguments
                });
        } catch (error) {
            this.logLine(red("├── ") + redBright("An error occurred while executing command '" + command.builder.name + "':"));
            this.logLine(red("│") + redBright("      - " + error));

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
}