declare module "d2" {
    import { D2 } from "./d2";

    export function init(config: { baseUrl: string; headers?: any }): D2;
}
