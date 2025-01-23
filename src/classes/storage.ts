const STORAGE_KEY = 'storage';

export class Storage {
    private static data: Record<string, any> = {};
    private static isLoaded: boolean = false;

    public static load() {
        if (this.isLoaded) {
            return;
        }

        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                this.data = JSON.parse(data);
            }
        } catch (e) {
            console.error('Failed to load storage data:', e);
        }

        this.isLoaded = true;

        setInterval(() => {
            this.save();
        }, 1000);
    }

    private static save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save storage data:', e);
        }
    }

    public static set<T>(key: string, value: T) {
        this.data[key] = value;
    }

    public static get<T>(key: string, fallback: T | null = null): T {
        this.load();
        return this.data[key] ?? fallback;
    }
}