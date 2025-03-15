import { IncomingMessage, ServerResponse, createServer, type Server } from "http";

interface RPCRequest<T> {
    jsonrpc: "2.0";
    method: string;
    params?: T;
    id: number | string | null;
}

interface RPCResponse<R> {
    jsonrpc: "2.0";
    result?: R;
    error?: string;
    id: number | string | null;
}

interface RPCContext<T, R> {
    req: IncomingMessage;
    res: ServerResponse;
    body: RPCRequest<T>;
    methods: Record<string, (params: T) => Promise<R>>;
    response?: RPCResponse<R>;
}

async function getBody<T>(req: IncomingMessage): Promise<RPCRequest<T>> {
    return new Promise((resolve, reject) => {
        let buffer: Buffer[] = [];

        req.on("data", (chunk) => buffer.push(chunk));
        req.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(buffer).toString()) as RPCRequest<T>);
            } catch (error) {
                reject(new Error("Invalid JSON format"));
            }
        });
        req.on("error", reject);
    });
}

function compose<T, R>(
    middlewares: ((ctx: RPCContext<T, R>, next: () => Promise<void>) => Promise<void>)[]
) {
    return async (ctx: RPCContext<T, R>) => {
        let index = -1;
        async function dispatch(i: number): Promise<void> {
            if (i <= index) throw new Error("next() called multiple times");
            index = i;
            let fn = middlewares[i];
            if (fn) await fn(ctx, () => dispatch(i + 1));
        }
        await dispatch(0);
    };
}

function createRPCServer() {
    const methods: Record<string, (params: unknown) => Promise<unknown>> = {};

    const server: Server = createServer(async (req, res) => {
        if (req.method !== "POST") {
            res.writeHead(405, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ jsonrpc: "2.0", error: "Method Not Allowed", id: null }));
        }

        try {
            const body = await getBody<unknown>(req);
            const method = methods[body.method];

            if (!method) {
                throw new Error(`Method '${body.method}' not found`);
            }

            const context: RPCContext<unknown, unknown> = {
                req,
                res,
                body,
                methods
            };

            await compose([validateRequest, executeMethod, sendResponse])(context);
        } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ jsonrpc: "2.0", error: (error as Error).message, id: null }));
        }
    });

    return {
        server,
        register: <T, R>(name: string, fn: (params: T) => Promise<R>) => {
            methods[name] = fn as (params: unknown) => Promise<unknown>;
        },
    };
}

async function validateRequest<T, R>(ctx: RPCContext<T, R>, next: () => Promise<void>) {
    const { body } = ctx;
    if (!body.method || typeof body.method !== "string") {
        throw new Error("Invalid method name");
    }
    await next();
}

async function executeMethod<T, R>(ctx: RPCContext<T, R>, next: () => Promise<void>) {
    const { body, methods } = ctx;
    const method = methods[body.method] as (params: T) => Promise<R>;

    ctx.response = {
        jsonrpc: "2.0",
        result: await method(body.params as T),
        id: body.id,
    };
    await next();
}

async function sendResponse<T, R>(ctx: RPCContext<T, R>) {
    ctx.res.writeHead(200, { "Content-Type": "application/json" });
    ctx.res.end(JSON.stringify(ctx.response));
}

const rpcServer = createRPCServer();

rpcServer.register<{ a: number; b: number }, number>("sum", async ({ a, b }) => Promise.resolve(a + b));
rpcServer.register<{ name: string }, string>("greet", async ({ name }) => Promise.resolve(`Hello, ${name}!`));

rpcServer.server.listen(5000, "localhost", () => {
    console.log(`Server running on http://localhost:5000`);
});
