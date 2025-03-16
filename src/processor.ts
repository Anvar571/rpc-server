import { Handler, IDefine, IMethod } from "./types";

export class Processor {
    private _handlers: Handler[];
    private preparedMethods: { [key: string]: IMethod } = {};

    constructor(defines: IDefine[], handlers?: Handler[]) {
        this._handlers = handlers || [];
        this.initDefines(defines);
    }

    public get handlers() {
        return this._handlers;
    }

    public initDefines(defines: IDefine[]) {
        defines.forEach(define => {
            const props: string[] = Object.getOwnPropertyNames(define);
            const moduleName = (define.modulename || define.name).toLowerCase();

            props.forEach(prop => {
                const method: any = define[prop];

                if (method.operation && method.operation.prototype === Function) {
                    const moduleFullName = `${moduleName}.${prop}`;
                    this.preparedMethods[moduleFullName] = method;
                }
            })
        })
    }

    public async getMethod(key: string) {
        return this.preparedMethods[key];
    }
}