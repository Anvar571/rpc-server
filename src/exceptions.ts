export interface IRPCExceptions {
    message: string,
    code: number,
    data: any,
}

export class RPCExceptions extends Error {
    private data: any;
    private code: number;

    constructor(options: IRPCExceptions) {
        super(options.message);
        this.message = options.message;
        this.code = options.code;
        this.data = options.data;
    }
};

export function InvalidParamException(data?: any) {
    return new RPCExceptions({ code: 409, message: "Invalid params", data });
}

export function ParseErrorException(data?: any) {
    return new RPCExceptions({ code: 410, message: "Parse error", data });
}

export function ServerError(data?: any) {
    return new RPCExceptions({ code: 501, message: "What is happened in server", data });
}