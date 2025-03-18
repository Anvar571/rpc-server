import { IncomingMessage, ServerResponse, createServer, type Server } from "http";
import { Composer } from "./composer";
import { IRPCServerOptions } from "./types";
import { AddressInfo } from "net";
import { ParseErrorException } from "./exceptions";

export class RPCServer {
    constructor(private options: IRPCServerOptions, private readonly composer: Composer) {}

    public async init() {
        const server = createServer(this.callbacks.bind(this));
        const result = await this.initServer(server);
        console.log(result, "reserver");
    }

    private async callbacks(req: IncomingMessage, res: ServerResponse) {
        try {
            const body = await this.getBody(req);
            const client = await this.prepareClient(req);

            const result = await this.composer.initRequest(client, body);

            this.sendSerponse({ status_code: 200, data: result }, res);
        } catch (error) {
            this.sendSerponse({ status_code: 504, data: error }, res);
        }
    } 

    private async initServer(server: Server): Promise<AddressInfo> {
        return new Promise((done, fail) => {
            server.listen(this.options.port, this.options.host, () => {
                done(server.address() as AddressInfo);
            })
        })
    }

    private sendSerponse(result: { status_code: number, data: any }, res: ServerResponse) {
        const newResult = JSON.stringify(result.data);

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': newResult.length
        };

        res.writeHead(result.status_code, headers);
        res.end(newResult);
    }

    private async getBody(req: IncomingMessage) {
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