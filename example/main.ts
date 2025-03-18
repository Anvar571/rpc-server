import { Composer } from "../src/composer";
import { RPCServer } from "../src/rpc_server";
import { IMethod } from "../src/types";

export class User {
    public name: string;
    constructor(name: string) {
        this.name = name;
    }

    public static authorization: IMethod = {
        feature: {
            session: 'active'
        },
        operation: async function (params): Promise<any> {
            console.log(params);
        }
    };

    public static registration: IMethod = {
        feature: {
            session: 'active'
        },
        operation: async function (params): Promise<any> {
            throw new Error("dsfkhfdksalf")
        }
    };

    public static get_info: IMethod = {
        feature: {
            session: 'active'
        },
        operation: async function (params): Promise<any> {

        }
    }
}

const user = new User("asd");

async function init(request: any, method: IMethod): Promise<any> {}
async function resolve(request: any, method: IMethod): Promise<any> {}
async function reject(request: any, method: IMethod): Promise<any> {}

const composer = new Composer({
    defines: [
        User
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