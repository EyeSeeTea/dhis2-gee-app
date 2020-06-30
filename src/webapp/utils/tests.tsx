import React from "react";
import { SnackbarProvider } from "d2-ui-components";
import { getMockApi } from "d2-api";
import { render, RenderResult } from "@testing-library/react";

import { Config } from "./../models/Config";
import { User } from "./../models/User";
import { AppContext } from "../contexts/app-context";
import { ReactNode } from "react";

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
            gee: {
                serviceAccount: "test-63@foo-dhis2-gee-app.iam.gserviceaccount.com",
                privateKeyFile: "foo-dhis2-gee-app-09be93975aeb.json",
            },
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

export function getReactComponent(children: ReactNode, context: AppContext): RenderResult {
    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
