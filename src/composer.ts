import { RPCExceptions, ServerError } from "./exceptions";
import { Processor } from "./processor";
import { IComposer, IMethod } from "./types";

export class Composer extends Processor {
    constructor({ defines, handlers }: IComposer) {
        super(defines, handlers);
    }

    public async initRequest(client: any, body: any) {
        let result, error;
        
        const method: IMethod = await this.getMethod(body.method);

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
        }
    }
}
