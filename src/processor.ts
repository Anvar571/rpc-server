import { InvalidParamException } from "./exceptions";
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

    protected getMethods() {
        return this.preparedMethods;
    }

    private initDefines(defines: IDefine[]) {
        defines.forEach(define => {
            const moduleName = define.name.toLowerCase();
        
            Object.entries(define).forEach(([prop, value]) => {
                if (typeof value === 'object' && 'feature' in value && 'operation' in value) {
                    const moduleFullName = `${moduleName}.${prop}`;
                    this.preparedMethods[moduleFullName] = value;
                }
            });
        })
    }

    protected getMethod(key: string) {
        return this.preparedMethods[key];
    }
}