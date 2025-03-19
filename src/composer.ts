import { InvalidParamException, ParseErrorException, RPCExceptions, ServerError } from "./exceptions";
import { Processor } from "./processor";
import { IComposer, IMethod } from "./types";

export class Composer extends Processor {
    constructor({ defines, handlers }: IComposer) {
        super(defines, handlers);
    }

    public async initRequest(client: any, body: any) {
        let result, error;
    
        if (!body || !body.method) {
            throw ParseErrorException("Invalid request: 'method' is required");
        }

        const method: IMethod | undefined = await this.getMethod(body.method);
        if (!method || !method.operation) {
            throw InvalidParamException(`Method not found: ${body.method}`);
        }

        try {
            if (this.handlers.init) {
                await this.handlers.init.call(client, body, method);
            }

            result = await method.operation.call(client, body.params);

            if (this.handlers.resolve) {
                await this.handlers.resolve.call(client, body, method, result);
            }
        }
        catch (err) {
            if (err instanceof RPCExceptions) {
                error = err;
            }
            else {
                error = ServerError(err);
            }

            if (this.handlers.reject) {
                await this.handlers.reject.call(client, body, method, error);
            }
        } finally {
            return {
                client: client,
                response: {
                    jsonrpc: "2.0",
                    id: body.id,
                    result: result || undefined,
                    error: error || undefined,
                }
            };
        }
    }
}
