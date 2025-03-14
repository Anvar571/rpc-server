export interface IRPCRequest {
    jsonrpc: string;
    method: string;
    params?: any;
    id?: number | string;
}

export interface IRPCResponse {
    jsonrpc: string;
    result?: any;
    error?: any;
    id?: number | string;
}

export class Composer {
    private services: Record<string, Function>;

    constructor() {
        this.services = {};
    }

    register(method: string, handler: Function) {
        this.services[method] = handler;
    }

    async onRequest(request: IRPCRequest): Promise<IRPCResponse> {
        if (request.jsonrpc !== "2.0") {
            return { jsonrpc: "2.0", error: "Invalid JSON-RPC version", id: request.id };
        }

        const handler = this.services[request.method];

        if (!handler) {
            return { jsonrpc: "2.0", error: `Method not found: ${request.method}`, id: request.id };
        }

        try {
            const result = await handler(request.params);
            return { jsonrpc: "2.0", result, id: request.id };
        } catch (error) {
            return { jsonrpc: "2.0", error: error, id: request.id };
        }
    }
}
