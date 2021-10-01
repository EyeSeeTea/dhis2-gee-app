import React, { useContext } from "react";
import CompositionRoot from "../../CompositionRoot";
import { D2Api } from "../../types/d2-api";
import { Config } from "../models/Config";
import { User } from "../models/User";

export interface AppContextState {
    api: D2Api;
    d2: object;
    config: Config;
    currentUser: User;
    compositionRoot: CompositionRoot;
    isAdmin: boolean;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("Context not found");
    }
}

export function useCompositionRoot() {
    const context = useContext(AppContext);
    if (context) {
        return context.compositionRoot;
    } else {
        throw new Error("Context not found");
    }
}

export function useCurrentUser() {
    const context = useContext(AppContext);
    if (context) {
        return context.currentUser;
    } else {
        throw new Error("Context not found");
    }
}
