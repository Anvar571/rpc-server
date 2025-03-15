import { IncomingMessage, ServerResponse, createServer } from "node:http";

interface RPCRequest<T> {
    jsonrpc: '2.0',
    method: string,
    params?: T,
    id: number | string | null;
}

interface RPCResponse<R, E> {
    jsonrpc: "2.0";
    result?: R;
    error?: E;
    id: number | string | null;
}

const methods: Map<string, (params: unknown) => Promise<unknown>> = new Map();

async function handleRequests(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== 'POST') {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: "Method Not Allowed", id: null }));
        return;
    }

    try {
        const body = await getBody(req);
        const handler = methods.get(body.method);

        if (!handler) {
            throw new Error("Method is not foud");
        }

        const result = await handler(body.params);
        
        sendSerponse(res, { result });
    } catch (error) {
        sendSerponse(res, {}, { error });
    }
}

async function getBody<T>(req: IncomingMessage): Promise<RPCRequest<T>> {
    return new Promise((done, fail) => {
        let buffer: Buffer[]= [];

        req.on('data', (chunk)=> {
            buffer.push(chunk);
        });

        req.on('end', () => {
            try {
                done(JSON.parse(Buffer.concat(buffer).toString()) as RPCRequest<T>);
            } catch (error) {
                fail(new Error("Invalid JSON format"));
            }
        });

        req.on('error', (err) => fail(err));
    })
}

function sendSerponse<R, E>(res: ServerResponse, data: R, error?: E) {
    const responseData: RPCResponse<R, E> = {
        jsonrpc: '2.0',
        result: data,
        error,
        id: null
    };
    res.writeHead(200, { 'content-type': "application/json" });
    res.end(JSON.stringify(responseData));
}

function createRPCServer() {
    const server = createServer(async (req, res) => {
        await handleRequests(req, res);
    });

    return {
        server,
        register: <T, R>(name: string, fn: (params: T) => Promise<R>) => {
            methods.set(name, fn as (params: unknown) => Promise<unknown>);
        }
    }
}

const rpcServer = createRPCServer();

rpcServer.register<{ a: number; b: number }, number>("sum", async ({ a, b }) => Promise.resolve(a + b));
rpcServer.register<{ name: string }, string>("greet", async ({ name }) => Promise.resolve(`Hello, ${name}!`));

rpcServer.server.listen(5000, "localhost", () => {
    console.log(`Server running on http://localhost:5000`);
});
