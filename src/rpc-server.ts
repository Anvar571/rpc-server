import * as http from "http";
import { Composer, IRPCRequest } from "./composer";

export class RPCServer {
    private server: http.Server;
    private composer: Composer;

    constructor(private port: number, private host: string, composer: Composer) {
        this.composer = composer;
        this.server = http.createServer(this.handleRequest.bind(this));
    }

    start() {
        this.server.listen(this.port, this.host, () => {
            console.log(`RPC Server running at http://${this.host}:${this.port}`);
        });
    }

    private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        if (req.method !== "POST") {
            res.writeHead(405, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Method Not Allowed" }));
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const request: IRPCRequest = JSON.parse(body);
                const response = await this.composer.onRequest(request);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(response));
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
    }
}
