declare module needler {
    export class Kernel {
        bind(serviceName : string, constructor : any, scope? : string);
        bindFunction (serviceName : string, func : Function, scope? : string);
        get(serviceName: string) : any;
    }

    export function depends(constructor : any, dependenciesArray : string[]);
}

