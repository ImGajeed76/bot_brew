import {
    ActionRowBuilder,
    ButtonBuilder, ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandUserOption
} from "discord.js";
import {SlashCommandIntegerOption, SlashCommandNumberOption} from "@discordjs/builders";
import {
    SlashCommandAttachmentOption,
    SlashCommandChannelOption,
    SlashCommandMentionableOption,
    SlashCommandRoleOption
} from "@discordjs/builders/dist";
import {Store} from "./Store";

export type SlashCommandExecuteFunction = (interaction: ChatInputCommandInteraction, userStore: Store, options: Record<string, any>) => Promise<void>;
export type ButtonExecuteFunction = (interaction: ButtonInteraction, userStore: Store, messageStore: Store, options: Record<string, any>) => Promise<void>;

export type StringOption =
    Omit<SlashCommandStringOption, 'addChoices'>
    | Omit<SlashCommandStringOption, 'setAutocomplete'>
    | SlashCommandStringOption
    | ((builder: SlashCommandStringOption) => Omit<SlashCommandStringOption, 'addChoices'> | Omit<SlashCommandStringOption, 'setAutocomplete'> | SlashCommandStringOption);

export type NumberOption =
    Omit<SlashCommandNumberOption, 'addChoices'>
    | Omit<SlashCommandNumberOption, 'setAutocomplete'>
    | SlashCommandNumberOption
    | ((builder: SlashCommandNumberOption) => Omit<SlashCommandNumberOption, 'addChoices'> | Omit<SlashCommandNumberOption, 'setAutocomplete'> | SlashCommandNumberOption);

export type IntegerOption =
    Omit<SlashCommandIntegerOption, 'addChoices'>
    | Omit<SlashCommandIntegerOption, 'setAutocomplete'>
    | SlashCommandIntegerOption
    | ((builder: SlashCommandIntegerOption) => Omit<SlashCommandIntegerOption, 'addChoices'> | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | SlashCommandIntegerOption);

export type BooleanOption =
    SlashCommandBooleanOption |
    ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption);

export type UserOption =
    SlashCommandUserOption |
    ((builder: SlashCommandUserOption) => SlashCommandUserOption);

export type ChannelOption =
    SlashCommandChannelOption
    | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption);

export type RoleOption =
    SlashCommandRoleOption |
    ((builder: SlashCommandRoleOption) => SlashCommandRoleOption);

export type AttachmentOption =
    SlashCommandAttachmentOption
    | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption);

export type MentionableOption =
    SlashCommandMentionableOption
    | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption);

export type ButtonOptions = {
    label: string,
    style: ButtonStyle,
    customId: string,
    disabled?: boolean,
    emoji?: string,
    url?: string
}

export class SubCommand {
    builder: SlashCommandSubcommandBuilder | SlashCommandBuilder;
    executeFunction: SlashCommandExecuteFunction = async () => {
    };

    buttons: Record<string, { button: ButtonBuilder, callback: ButtonExecuteFunction }> = {};
    actionRow = new ActionRowBuilder();

    nameLanguageID: string | undefined;
    descriptionLanguageID: string | undefined;

    longDescription: string | undefined;
    longDescriptionLanguageID: string | undefined;

    constructor() {
        this.builder = new SlashCommandSubcommandBuilder();
    }

    setName(name: string) {
        this.builder.setName(name);
        return this;
    }

    setNameLanguageID(id: string) {
        this.nameLanguageID = id;
        return this;
    }

    setNameLocalizations(localizations: Record<string, string>) {
        this.builder.setNameLocalizations(localizations);
        return this;
    }

    setDescription(description: string) {
        this.builder.setDescription(description);
        return this;
    }

    setDescriptionLanguageID(id: string) {
        this.descriptionLanguageID = id;
        return this;
    }

    setDescriptionLocalizations(localizations: Record<string, string>) {
        this.builder.setDescriptionLocalizations(localizations);
        return this;
    }

    setLongDescription(description: string) {
        this.longDescription = description;
        return this;
    }

    setLongDescriptionLanguageID(id: string) {
        this.longDescriptionLanguageID = id;
        return this;
    }

    addStringOption(option: StringOption) {
        this.builder.addStringOption(option);
        return this;
    }

    addNumberOption(option: NumberOption) {
        this.builder.addNumberOption(option);
        return this;
    }

    addIntegerOption(option: IntegerOption) {
        this.builder.addIntegerOption(option);
        return this;
    }

    addBooleanOption(option: BooleanOption) {
        this.builder.addBooleanOption(option);
        return this;
    }

    addUserOption(option: UserOption) {
        this.builder.addUserOption(option);
        return this;
    }

    addChannelOption(option: ChannelOption) {
        this.builder.addChannelOption(option);
        return this;
    }

    addRoleOption(option: RoleOption) {
        this.builder.addRoleOption(option);
        return this;
    }

    addAttachmentOption(option: AttachmentOption) {
        this.builder.addAttachmentOption(option);
        return this;
    }

    addMentionableOption(option: MentionableOption) {
        this.builder.addMentionableOption(option);
        return this;
    }

    onExecute(func: SlashCommandExecuteFunction) {
        this.executeFunction = func;
        return this;
    }

    addButton(options: ButtonOptions, callback: ButtonExecuteFunction) {
        const id = this.builder.name + options.customId;

        const button = new ButtonBuilder()
            .setLabel(options.label)
            .setStyle(options.style)
            .setCustomId(id);

        if (options.disabled !== undefined) {
            button.setDisabled(options.disabled);
        }

        if (options.emoji) {
            button.setEmoji(options.emoji);
        }

        if (options.url) {
            button.setURL(options.url);
        }

        this.buttons[id] = {
            button: button,
            callback: callback
        }

        this.actionRow = new ActionRowBuilder()
            .addComponents(Object.values(this.buttons).map(button => button.button));

        return this;
    }

    toJSON() {
        return this.builder.toJSON();
    }
}

export class SlashCommand extends SubCommand {

    override builder: SlashCommandBuilder;
    executeFunction: SlashCommandExecuteFunction = async () => {
    };
    subCommands: Record<string, SubCommand> = {};

    buttons: Record<string, { button: ButtonBuilder, callback: ButtonExecuteFunction }> = {};
    actionRow = new ActionRowBuilder();

    nameLanguageID: string | undefined;
    descriptionLanguageID: string | undefined;

    longDescription: string | undefined;
    longDescriptionLanguageID: string | undefined;

    constructor() {
        super();
        this.builder = new SlashCommandBuilder();
    }

    addSubcommand(name: string, subCommand: SubCommand) {
        this.subCommands[name] = subCommand;
        return this;
    }

    override toJSON() {
        for (const subCommand in this.subCommands) {
            this.builder.addSubcommand(this.subCommands[subCommand].builder as SlashCommandSubcommandBuilder);
        }

        return this.builder.toJSON();
    }
}