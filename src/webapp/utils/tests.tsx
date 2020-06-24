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
                    imports: {
                        suffix: "@import",
                    },
                },
            },
            googleDatasets: {
                chirpsDaily: {
                    displayName: "CHIRPS - DAILY",
                    pointer: "UCSB-CHG/CHIRPS/DAILY",
                    bands: ["precipitation"],
                    doc:
                        "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
                },
                era5Daily: {
                    displayName: "ERA5 - DAILY",
                    pointer: "ECMWF/ERA5/DAILY",
                    bands: [
                        "mean_2m_air_temperature",
                        "minimum_2m_air_temperature",
                        "maximum_2m_air_temperature",
                        "dewpoint_2m_temperature",
                        "total_precipitation",
                        "surface_pressure",
                        "mean_sea_level_pressure",
                        "u_component_of_wind_10m",
                        "v_component_of_wind_10m",
                    ],
                    doc:
                        "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
                },
                daymetV3: {
                    displayName: "DAYMET V3",
                    pointer: "NASA/ORNL/DAYMET_V3",
                    bands: ["dayl", "prcp", "srad", "swe", "tmax", "tmin", "vp"],
                    doc:
                        "https://developers.google.com/earth-engine/datasets/catalog/NASA_ORNL_DAYMET_V3",
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
