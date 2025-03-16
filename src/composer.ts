import { Processor } from "./processor";
import { IMethod, IComposer } from "./types";

export class Composer extends Processor {
    constructor({handlers, defines}: IComposer) {
        super(defines, handlers);
    }

    public async onRequest(client, request) {
        try {

            var method: IMethod = await this.getMethod(request.method);

            if (this.handlers.init) {
                await this.handlers.init.call(client, request, method);
            }

            result = await method.operation.call(client, request.params);

            if (this.handlers.resolve) {
                await this.handlers.resolve.call(client, request, method, result);
            }
        }
        catch (err) {
            if (err instanceof ModuleError) {
                error = err;
            }
            else {
                error = ServerError(err);
            }

            if (this.handlers.reject) {
                await this.handlers.reject.call(client, request, method, error);
            }
        }
        finally {
            return {
                client: client,
                response: {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: result || undefined,
                    error: error || undefined,
                }
            };
        }
    }
}