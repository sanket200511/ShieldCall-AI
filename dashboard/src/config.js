// Automatically detect the API Host based on where the frontend is loaded from.
// This allows the app to work on 'localhost' AND on '192.168.x.x' (Phone) without code changes.

const hostname = window.location.hostname;
const protocol = window.location.protocol;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

// Backend is always on Port 8001
export const API_BASE_URL = `${protocol}//${hostname}:8001`;
export const WS_URL = `${wsProtocol}//${hostname}:8001/ws/monitor`;

console.log("Configuration Loaded:", { API_BASE_URL, WS_URL });
