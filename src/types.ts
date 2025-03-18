export type Handler = <P, R>(params: P) => Promise<R>;

export interface IFeature {
    [key: string]: any;
}

export interface IMethod {
    feature?: IFeature;
    operation: (params?: any) => Promise<any>;
}

export interface Handlers {
    init?: (request: any, method: IMethod) => Promise<any>;
    reject?: (request: any, method: IMethod, error: any) => Promise<any>;
    resolve?: (request: any, method: IMethod, result: any) => Promise<any>;
}

export type JSON_RPC_VERTION = '2.0';

export interface IRequest<P> {
    jsonrpc: JSON_RPC_VERTION,
    method: string,
    params: P,
}

export interface Response {
    client: any;
    response: {
        jsonrpc: string;
        id: number | null;
        error: any;
        result: any;
    }
}

export interface IDefine {
    name: string;
    [key: string]: IMethod | string;
}

export interface IComposerOptions {}

export interface IRPCServerOptions {
    port?: number,
    host?: string,
    session?: {
        status: boolean;
        keyname: string;
    }
}

export type IComposer = {
    defines: any[],
    handlers: Handlers,
    options?: IComposerOptions
}
