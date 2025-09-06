const path = window.location.origin
function getBaseUrl() {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
}
function getWebSocketUrl() {
    const { protocol, hostname } = window.location;

    // Xác định scheme ws:// hay wss://
    const wsProtocol = protocol === "https:" ? "wss:" : "ws:";

    // Kiểm tra hostname có phải là IP (IPv4/IPv6) hay không
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^[0-9a-fA-F:]+$/.test(hostname);

    if (isIp) {
        // Nếu là IP → ws://IP:3000
        return `${wsProtocol}//${hostname}:8000`;
    } else {
        // Nếu là domain → ws://domain/socket
        return `${wsProtocol}//${hostname}`;
    }
}

// ---- Cách dùng ----
const baseUrl = getBaseUrl();
// console.log("path", path)
// console.log("baseUrl ", baseUrl)
const webSocketUrl = getWebSocketUrl();
// console.log("WebSocket URL:", webSocketUrl);