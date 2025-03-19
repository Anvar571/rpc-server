export interface IRPCExceptions {
    message: string;
    code: number;
    data?: any;
}

export class RPCExceptions extends Error {
    constructor(
        public readonly code: number,
        public readonly data: any = null,
        message: string
    ) {
        super(message);
        this.name = "RPCExceptions";
    }
}

export function createException(
    code: number,
    message: string,
    data: any = null
): RPCExceptions {
    return new RPCExceptions(code, data, message);
}

export const InvalidParamException = (data?: any) =>
    createException(409, "Invalid params", data);

export const ParseErrorException = (data?: any) =>
    createException(410, "Parse error", data);

export const ServerError = (data?: any) =>
    createException(501, "What happened on the server", data);
