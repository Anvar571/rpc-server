import { Composer } from "../src/composer";
import { RPCServer } from "../src/rpc_server";
import { IDefine, IMethod } from "../src/types";

export class User {
    public name: string;
    constructor(name: string) {
        this.name = name;
    }

    public authorization: IMethod = {
        feature: {
            session: 'active'
        },
        operation: async function (params): Promise<any> {
            console.log(params);
        }
    };

    public registration: IMethod = {
        feature: {
            session: 'active'
        },
        operation: async function (params): Promise<any> {
            throw new Error("dsfkhfdksalf")
        }
    };

    public get_info: IMethod = {
        feature: {
            session: 'active'
        },
        operation: async function (params): Promise<any> {
            console.log("user get info");
            return "user get info"
        }
    }
}

async function init(request: any, method: IMethod): Promise<any> {
    console.log(request, method);
    
    console.log("first init function");
}
async function resolve(request: any, method: IMethod): Promise<any> {}
async function reject(request: any, method: IMethod): Promise<any> {}

const composer = new Composer({
    defines: [
        new User('user')
    ],
    handlers: {
        init,
        resolve,
        reject
    }
});

const rpcServer = new RPCServer({ port: 5000, host: "localhost", session: {
    keyname: "temp", 
    status: true,
} }, composer);

rpcServer.init();