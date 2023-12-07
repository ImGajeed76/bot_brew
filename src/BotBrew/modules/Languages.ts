import fs from "fs";
import chalk from "chalk-advanced";
import * as toml from "toml";

const {gray, red, redBright, yellow} = chalk;

export enum DiscordLanguages {
    EnglishUS = "en-US",
    EnglishUK = "en-GB",
    Bulgarian = "bg",
    ChineseSimplified = "zh-CN",
    ChineseTraditional = "zh-TW",
    Croatian = "hr",
    Czech = "cs",
    Danish = "da",
    Dutch = "nl",
    Finnish = "fi",
    French = "fr",
    German = "de",
    Greek = "el",
    Hindi = "hi",
    Hungarian = "hu",
    Italian = "it",
    Japanese = "ja",
    Korean = "ko",
    Lithuanian = "lt",
    Norwegian = "no",
    Polish = "pl",
    PortugueseBrazil = "pt-BR",
    Romanian = "ro",
    Russian = "ru",
    Spanish = "es-ES",
    Swedish = "sv-SE",
    Thai = "th",
    Turkish = "tr",
    Ukrainian = "uk",
    Vietnamese = "vi"
}


export class Languages {
    srcPath: string;

    languages: Record<string, Record<string, any>> = {};

    constructor(srcPath: string) {
        this.srcPath = srcPath;
        this.loadLanguages();
    }

    loadLanguages() {
        if (!fs.existsSync(`${this.srcPath}/Languages`)) {
            console.log(red("├── ") + redBright("No Languages folder found. Skipping registration."));
            console.log(yellow("│"));
            return;
        }

        console.log(yellow("├── ") + gray("Loading languages..."));

        fs.readdirSync(`${this.srcPath}/Languages`).forEach((file) => {
            if (file.endsWith(".toml")) {
                const fileName = file.split(".")[0];

                if (!(Object.values(DiscordLanguages).includes(fileName as DiscordLanguages))) {
                    console.log(red("│") + redBright("      - " + fileName + " is not a valid language code. Skipping."));
                    return;
                }

                this.languages[fileName] = toml.parse(fs.readFileSync(`${this.srcPath}/Languages/${file}`, "utf-8"));
                console.log(yellow("│") + gray("      - " + fileName));
            }
        });

        console.log(yellow("│"));
    }

    getLanguage(language: string) {
        return new Language(this.languages[language]);
    }
}

export class Language {
    language: Record<string, any>;

    constructor(language: Record<string, any>) {
        this.language = language;
    }

    get(key: string) {
        const keys = key.split(".");
        let value = this.language;
        for (const key of keys) {
            value = value[key];
        }
        return value;
    }
}