import {Client} from "discord.js";
import {gray, red, redBright, yellow} from "chalk-advanced";
import fs from "fs";
import {DiscordEvent} from "./DiscordEvent";

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
        fs.readdirSync(`${this.srcPath}/Events`).forEach((eventFile) => {
            if (eventFile.endsWith(".ts")) {
                const eventFileName = eventFile.split(".")[0];
                let discordEvent: DiscordEvent | undefined = require(`${this.srcPath}/Events/${eventFile}`);
                if (discordEvent instanceof DiscordEvent) {
                    if (!discordEvent.name) {
                        discordEvent.setName(eventFileName);
                    }
                    this.logLine(yellow("│") + gray("      - " + discordEvent.name));

                    this.events[discordEvent.name] = discordEvent;
                }
            }
        });

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