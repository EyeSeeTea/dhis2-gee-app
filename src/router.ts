import { useHistory } from "react-router";

const routes = {
    imports: () => "/",
    mappings: () => `/mappings`,
    "mappings.edit": ({ id }: { id: string }) => `/mappings/${id}`,
    "mappings.new": () => `/mappings/new`,
};

type Routes = typeof routes;
export type GoTo = typeof generateUrl;

export function generateUrl<Name extends keyof Routes>(
    name: Name,
    params: Parameters<Routes[Name]>[0] = undefined
): string {
    const fn = routes[name];
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return params ? fn(params as any) : fn(undefined as any);
}

export function useGoTo(): GoTo {
    const history = useHistory();
    const goTo: GoTo = (name, params) => {
        const url = generateUrl(name, params);
        history.push(url);
        return url;
    };
    return goTo;
}
