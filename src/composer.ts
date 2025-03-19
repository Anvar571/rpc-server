import { InvalidParamException, ParseErrorException, RPCExceptions, ServerError } from "./exceptions";
import { Processor } from "./processor";
import { IComposer, IMethod } from "./types";

export class Composer extends Processor {
    constructor({ defines, handlers }: IComposer) {
        super(defines, handlers);
    }

    public async initRequest(client: any, body: any) {
        if (!body || !body.method) {
            return this.createErrorResponse(client, ParseErrorException("Invalid request: 'method' is required"), body);
        }

        const method: IMethod | undefined = this.getMethod(body.method);
        
        if (!method || !method.operation) {
            return this.createErrorResponse(client, InvalidParamException(`Method not found: ${body.method}`), body);
        }

        return this.processMethod(client, body, method);
    }

    private async processMethod(client: any, body: any, method: IMethod) {
        try {
            if (this.handlers.init) {
                await this.handlers.init.call(client, body, method);
            }

            const result = await method.operation.call(client, body.params);

            if (this.handlers.resolve) {
                await this.handlers.resolve.call(client, body, method, result);
            }

            return this.createSuccessResponse(client, result, body);
        } catch (err) {
            return this.createErrorResponse(client, err, body, method);
        }
    }

    private createSuccessResponse(client: any, result: any, body: any) {
        return {
            client,
            response: {
                jsonrpc: "2.0",
                id: body.id,
                result,
                error: undefined,
            },
        };
    }

    private createErrorResponse(client: any, error: any, body: any, method?: IMethod) {
        const rpcError = error instanceof RPCExceptions ? error : ServerError(error);

        if (this.handlers.reject && method) {
            this.handlers.reject.call(client, body, method, rpcError);
        }

        return {
            client,
            response: {
                jsonrpc: "2.0",
                id: body.id,
                result: undefined,
                error: rpcError,
            },
        };
    }
}
