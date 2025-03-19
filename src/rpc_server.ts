import { IncomingMessage, ServerResponse, createServer, type Server } from "http";
import { Composer } from "./composer";
import { IRPCServerOptions, IRequest } from "./types";
import { AddressInfo } from "net";
import { ParseErrorException, RPCExceptions } from "./exceptions";

export class RPCServer {
    constructor(private options: IRPCServerOptions, private readonly composer: Composer) {}

    public async init() {
        const server = createServer(this.callbacks.bind(this));
        const result = await this.initServer(server);
        console.log(result, "RPC Server is running");
    }

    private async callbacks(req: IncomingMessage, res: ServerResponse) {
        let client = null;
        
        try {
            const body = await this.getBody(req);
    
            if (!body || !body.jsonrpc || !body.method) {
                throw ParseErrorException({ message: "Jsonrpc and method is required" });
            }
    
            client = await this.prepareClient(req);
    
            const result = await this.composer.initRequest(client, body);
            this.createSuccessResponse(client, res, result );
        } catch (error) {
            this.createErrorResponse(client, res, error );
        }
    }

    private async initServer(server: Server): Promise<AddressInfo> {
        return new Promise((done, fail) => {
            server.listen(this.options.port, this.options.host, () => {
                done(server.address() as AddressInfo);
            })
        })
    }

    private createErrorResponse(client: any, res: ServerResponse, error: any) {
        const response = JSON.stringify({
            client,
            response: {
                jsonrpc: "2.0",
                error: error,
            }
        });

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': response.length
        };

        res.writeHead(409, headers);
        res.end(response);
    }

    private createSuccessResponse<T>(client: any, res: ServerResponse,  result: any) {
        const response = JSON.stringify(result);

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': response.length
        };

        res.writeHead(201, headers);
        res.end(response);
    }

    private async getBody<T>(req: IncomingMessage): Promise<IRequest<T>> {
        return new Promise((done, fail) => {
            let buffer: Buffer[]= [];
            req.on('data', (chunk) => {
                buffer.push(chunk);
            });
            req.on('end', () => {
                try {
                    done(JSON.parse(Buffer.concat(buffer).toString()));
                } catch (error) {
                    error = ParseErrorException(error);
                    fail(error);
                }
            });
            req.on('error', (err) => fail(err));
        })
    }

    private prepareClient(request: IncomingMessage) {
        const client: any = {};

        if (this.options.session && this.options.session.status === true) {
            const keyname = this.options.session.keyname.toLowerCase();
            client[keyname] = request.headers[keyname];
        }
        return client;
    }
}