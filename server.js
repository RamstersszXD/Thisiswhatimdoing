const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Relay is online");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (client) => {
    console.log("Client connected");

    client.on("message", (data) => {
        let packet;

        try {
            packet = JSON.parse(data.toString());
        } catch {
            return;
        }

        if (typeof packet.message !== "string") return;

        const message = packet.message.slice(0, 2000);

        for (const other of wss.clients) {
            if (other.readyState === WebSocket.OPEN) {
                other.send(JSON.stringify({
                    message: message
                }));
            }
        }
    });

    client.on("close", () => {
        console.log("Client disconnected");
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Relay listening on ${PORT}`);
});
