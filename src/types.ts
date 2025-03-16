export type Handler = <P, R>(params: P) => Promise<R>;

export interface IFeature {
    [key: string]: any;
}

export interface IMethod {
    feature?: IFeature;
    operation: (params?: any) => Promise<any>;
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
    modulename?: string;
    [key: string]: IMethod | string | undefined;
}

export interface IComposerOption {}

export interface PreparedMethods {
    name: string,
    props: PreparedMethods[]
    modulename?: string,
}

export type IComposer = {
    defines: [],
    handlers: Handler[],
    options?: IComposerOption
}

export interface Handlers<R, E> {
    init?: (request: R, method: IMethod) => Promise<any>;
    reject?: (request: R, method: IMethod, error: E) => Promise<any>;
    resolve?: (request: R, method: IMethod, result: any) => Promise<any>;
}