import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { render, RenderResult } from "@testing-library/react";
import { ReactNode } from "react";
import { getMockApi } from "../../types/d2-api";
import { AppContext, AppContextState } from "../contexts/app-context";
import { Config } from "./../models/Config";
import { User } from "./../models/User";

export function getTestUser() {
    return new User({
        id: "xE7jOejl9FI",
        displayName: "John Traore",
        username: "admin",
        organisationUnits: [
            {
                level: 1,
                id: "ImspTQPwCqd",
                path: "/ImspTQPwCqd",
            },
        ],
        userRoles: [],
    });
}

export function getTestConfig() {
    return new Config({
        base: {
            dataStore: {
                namespace: "dhis2-gee-app",
                keys: {
                    mappings: "mappings",
                    importRules: "importRules",
                    importsHistory: "imports-history",
                    imports: {
                        suffix: "@import",
                    },
                    globalOUMapping: "globalOUMapping",
                    geeDataSets: "geeDataSets",
                },
            },
        },
    });
}

export function getTestD2() {
    return {};
}

export function getTestContext() {
    const { api, mock } = getMockApi();

    return {
        mock,
        api,
        context: {
            api: api,
            d2: getTestD2(),
            currentUser: getTestUser(),
            config: getTestConfig(),
        },
    };
}

export function getReactComponent(children: ReactNode, context: AppContextState): RenderResult {
    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
