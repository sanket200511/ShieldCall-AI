// Centralized Configuration for API URLs

const getBaseUrl = () => {
    // In Vite, env vars are accessed via import.meta.env
    // If VITE_API_URL is set, use it. Otherwise, assume backend is on the same host at port 8000.
    // This allows mobile devices to connect via IP automatically (e.g. 192.168.1.5:8000)
    let url = import.meta.env.VITE_API_URL;

    if (!url) {
        url = `http://${window.location.hostname}:8000`;
    }

    // Remove trailing slash if present
    if (url.endsWith("/")) url = url.slice(0, -1);
    return url;
};

export const API_BASE_URL = getBaseUrl();

// WebSocket URL needs to change protocol from http/s to ws/s
export const WS_BASE_URL = (() => {
    let url = API_BASE_URL;
    if (url.startsWith("https://")) {
        return url.replace("https://", "wss://") + "/ws/monitor";
    } else if (url.startsWith("http://")) {
        return url.replace("http://", "ws://") + "/ws/monitor";
    }
    // Fallback if no protocol specified (rare)
    return "ws://" + url + "/ws/monitor";
})();

console.log("ShieldCall Config Loaded:", { API_BASE_URL, WS_BASE_URL });
