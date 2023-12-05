import {Awaitable} from "discord.js";

export type DiscordCallback = (...args: any[]) => Awaitable<void>;

export class DiscordEvent {
    name: string = "";
    callback: DiscordCallback = () => {};
    once: boolean = false;

    constructor() {}

    setName(name: string) {
        this.name = name;
        return this;
    }

    onCall(callback: DiscordCallback) {
        this.callback = callback;
        return this;
    }

    setOnce(once: boolean) {
        this.once = once;
        return this;
    }
}