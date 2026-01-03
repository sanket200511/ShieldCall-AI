export const storage = {
    get: (key, def) => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : def;
        } catch (e) {
            return def;
        }
    },
    set: (key, value) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(e);
        }
    }
};
