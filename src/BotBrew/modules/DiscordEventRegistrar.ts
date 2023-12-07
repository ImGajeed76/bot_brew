import {Client} from "discord.js";
import chalk from "chalk-advanced";
import fs from "fs";
import {DiscordEvent} from "./DiscordEvent.js";

const {red, redBright, yellow, gray} = chalk;

export class DiscordEventRegistrar {
    srcPath: string;
    events: Record<string, DiscordEvent> = {};
    log: boolean;

    constructor(srcPath: string, log: boolean = true) {
        this.srcPath = srcPath;
        this.log = log;
    }

    private logLine(content: string) {
        if (this.log) {
            console.log(content);
        }
    }

    async buildEventList() {
        this.events = {};

        // check if DiscordEvents folder exists
        if (!fs.existsSync(`${this.srcPath}/Events`)) {
            this.logLine(red("├── ") + redBright("No Events folder found. Skipping event registration."));
            this.logLine(yellow("│"));
            return;
        }

        this.logLine(yellow("├── ") + gray("Loading Discord events..."));

        // iterate through files in Events folder
        const eventFiles = fs.readdirSync(`${this.srcPath}/Events`)
        for (const eventFile of eventFiles) {
            if (eventFile.endsWith(".ts")) {
                const eventFileName = eventFile.split(".")[0];
                let discordEvent: DiscordEvent | undefined = undefined;

                try {
                    discordEvent = (await import(`${this.srcPath}/Events/${eventFile}`)).default;
                } catch (e) {
                    console.log(red("├── ") + redBright("An error occurred while loading event " + eventFileName + ":"));
                }

                if (discordEvent instanceof DiscordEvent) {
                    if (!discordEvent.name) {
                        discordEvent.setName(eventFileName);
                    }
                    this.logLine(yellow("│") + gray("      - " + discordEvent.name));

                    this.events[discordEvent.name] = discordEvent;
                }
            }
        }

        if (Object.keys(this.events).length === 0) {
            this.logLine(yellow("│") + gray("      - No events found."));
        }

        this.logLine(yellow("│"));
    }

    async registerEvents(client: Client) {
        for (const eventName in this.events) {
            const event = this.events[eventName];
            if (event.callback) {
                if (event.once) {
                    client.once(event.name, event.callback);
                } else {
                    client.on(event.name, event.callback);
                }
            }
        }
    }
}