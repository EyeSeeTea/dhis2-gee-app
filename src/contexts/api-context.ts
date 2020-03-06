import React, { useContext } from "react";
import { D2Api } from "d2-api";

export interface AppContext {
    api: D2Api;
    d2: object;
    // TODO: Add config / currentUser
    // config: Config;
    // currentUser: User;
}

export const ApiContext = React.createContext<AppContext | null>(null);

export function useAppContext() {
    const context = useContext(ApiContext);
    if (context) {
        return context;
    } else {
        throw new Error("Context not found");
    }
}
