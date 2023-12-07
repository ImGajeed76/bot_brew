import fs from "fs";
import chalk from "chalk-advanced";
import {SlashCommand, SubCommand} from "./SlashCommand.js";
import {Languages} from "./Languages.js";
import {REST, Routes} from "discord.js";

const {gray, green, red, redBright, yellow} = chalk;

export class SlashCommandRegistrar {
    srcPath: string;
    commands: Record<string, SlashCommand> = {};
    languages?: Languages;
    log: boolean;

    constructor(srcPath: string, languages?: Languages, log: boolean = true) {
        this.srcPath = srcPath;
        this.languages = languages;
        this.log = log;
    }

    private logLine(content: string) {
        if (this.log) {
            console.log(content);
        }
    }

    async buildCommandList() {
        this.commands = {};

        // check if SlashCommands folder exists
        if (!fs.existsSync(`${this.srcPath}/SlashCommands`)) {
            this.logLine(red("├── ") + redBright("No SlashCommands folder found. Skipping command registration."));
            this.logLine(yellow("│"));
            return;
        }

        this.logLine(yellow("├── ") + gray("Loading slash commands..."));

        // iterate through folders in SlashCommands folder
        const commandFolders = fs.readdirSync(`${this.srcPath}/SlashCommands`)
        for (const folder of commandFolders) {
            if (fs.lstatSync(`${this.srcPath}/SlashCommands/${folder}`).isDirectory()) {
                const folderName = folder;
                let slashCommand: SlashCommand | undefined = undefined;

                const jsOrTsFiles = fs.readdirSync(`${this.srcPath}/SlashCommands/${folder}`)

                try {
                    let filePath = "";
                    if (jsOrTsFiles.includes('index.ts')) {
                        filePath = `${this.srcPath}/SlashCommands/${folder}/index.ts`;
                    } else if (jsOrTsFiles.includes('index.js')) {
                        filePath = `${this.srcPath}/SlashCommands/${folder}/index.js`;
                    } else {
                        console.log(red("├── ") + redBright("No index.ts or index.js file found in slash command " + folderName + ". Skipping."));
                        continue;
                    }

                    slashCommand = (await import(filePath)).default;
                } catch (e) {
                    console.log(red("├── ") + redBright("An error occurred while loading slash command " + folderName + ":"));
                    console.log(red("│") + redBright("      - " + e));
                }

                if (slashCommand instanceof SlashCommand) {
                    if (!slashCommand.builder.name) {
                        slashCommand.setName(folderName);
                    }
                    this.logLine(yellow("│") + gray("      - " + slashCommand.builder.name));
                }

                if (slashCommand) {
                    if (this.languages) {
                        if (slashCommand.nameLanguageID) {
                            const nameLocalization: Record<string, string> = {};
                            for (const languageKey in this.languages.languages) {
                                const language = this.languages.getLanguage(languageKey);
                                nameLocalization[languageKey] = language.get(slashCommand.nameLanguageID).toString();
                            }
                            slashCommand.setNameLocalizations(nameLocalization);
                        }

                        if (slashCommand.descriptionLanguageID) {
                            const descriptionLocalization: Record<string, string> = {};
                            for (const languageKey in this.languages.languages) {
                                const language = this.languages.getLanguage(languageKey);
                                descriptionLocalization[languageKey] = language.get(slashCommand.descriptionLanguageID).toString();
                            }
                            slashCommand.setDescriptionLocalizations(descriptionLocalization);
                        }
                    }

                    const subFolders = fs.readdirSync(`${this.srcPath}/SlashCommands/${folder}`)
                    for (const file of subFolders) {
                        if (fs.lstatSync(`${this.srcPath}/SlashCommands/${folder}/${file}`).isDirectory()) {
                            const subFolderName = file;

                            const subFolderFiles = fs.readdirSync(`${this.srcPath}/SlashCommands/${folder}/${file}`)
                            for (const subFile of subFolderFiles) {
                                if (subFile.endsWith('index.ts')) {
                                    let command: SubCommand | undefined = undefined;

                                    try {
                                        command = (await import(`${this.srcPath}/SlashCommands/${folder}/${subFolderName}/${subFile}`)).default;
                                    } catch (e) {
                                        console.log(red("├── ") + redBright("An error occurred while loading slash command " + folderName + "/" + subFolderName + ":"));
                                    }

                                    if (command instanceof SubCommand) {
                                        if (!command.builder.name) {
                                            command.setName(subFolderName);
                                        }

                                        if (slashCommand) {
                                            slashCommand.addSubcommand(command.builder.name, command);
                                            this.logLine(yellow("│") + gray("      - " + slashCommand.builder.name + "/" + command.builder.name));
                                        }
                                    }
                                }
                            }
                        }
                    }

                    this.commands[slashCommand.builder.name] = slashCommand;
                }
            }
        }

        this.logLine(yellow("│"));
    }

    async registerCommands(
        token: string,
        clientId: string,
        guildId?: string,
    ) {
        const rest = new REST({version: '9'}).setToken(token);

        try {
            this.logLine(yellow("├── ") + gray("Registering slash commands..."));

            if (guildId) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    {body: Object.values(this.commands).map(command => command.toJSON())},
                );
            } else {
                await rest.put(
                    Routes.applicationCommands(clientId),
                    {body: Object.values(this.commands).map(command => command.toJSON())},
                );
            }

            this.logLine(yellow("├── ") + green("Successfully registered commands!"));
            this.logLine(yellow("│"));
        } catch (error) {
            this.logLine(red("├── ") + redBright("An error occurred while registering commands:"));
            this.logLine(red("│") + redBright("      - " + error));
        }
    }
}