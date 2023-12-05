export class Store {
    store: Record<string, any> = {};

    constructor() {}

    set(key: string, value: any) {
        this.store[key] = value;
    }

    get(key: string) {
        return this.store[key];
    }
}