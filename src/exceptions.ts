export class RPCExceptions extends Error {
    constructor(message = "RPCExceptions") {
        super(message);
    }
};

export class InvalidParamExceptions extends RPCExceptions {
    constructor() {
        super();
    }
}