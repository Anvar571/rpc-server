import { Handlers, IDefine, IMethod } from "./types";

export class Processor {
    private _handlers: Handlers;
    private preparedMethods: { [key: string]: IMethod } = {};

    constructor(defines: IDefine[], handlers?: Handlers) {
        this._handlers = handlers || {};
        this.initDefines(defines);
    }

    protected get handlers() {
        return this._handlers;
    }

    public getMethods() {
        return this.preparedMethods;
    }

    private initDefines(defines: IDefine[]) {
        defines.forEach(define => {
            const props: string[] = Object.getOwnPropertyNames(define);
            const moduleName = define.name.toLowerCase();

            props.forEach(prop => {
                const method: any = define[prop];

                if (method.operation && method.operation.prototype === Function) {
                    const moduleFullName = `${moduleName}.${prop}`;
                    this.preparedMethods[moduleFullName] = method;
                }
            })
        })
    }

    protected async getMethod(key: string) {
        return this.preparedMethods[key];
    }
}