import React, { useEffect, useState } from "react";
import moment from "moment";
//@ts-ignore
import { HeaderBar } from "@dhis2/ui-widgets";
import { MuiThemeProvider } from "@material-ui/core/styles";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
//@ts-ignore
import { useDataQuery, useConfig } from "@dhis2/app-runtime";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";
import { init } from "d2";
import { SnackbarProvider } from "d2-ui-components";
import { D2ApiDefault, D2Api } from "d2-api";

import "./App.css";
import { muiTheme } from "./themes/dhis2.theme";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import Root from "../../pages/root/Root";
import Share from "../share/Share";
import { AppContext } from "../../contexts/app-context";
import { Config } from "../../models/Config";
import { User } from "../../models/User";
import { LinearProgress } from "@material-ui/core";
// @ts-ignore
import gee from "@google/earthengine";
import { GeeDhis2 } from "../../models/GeeDhis2";
import Axios from "axios";
import { EarthEngine } from "../../models/EarthEngine";

type D2 = object;

type AppWindow = Window & {
    $: {
        feedbackDhis2: (
            d2: D2,
            appKey: string,
            feedbackOptions: AppConfig["feedback"]["feedbackOptions"]
        ) => void;
    };
};

function isLangRTL(code: string): boolean {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
}

function initFeedbackTool(d2: D2, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");

    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        ((window as unknown) as AppWindow).$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
}

function configI18n(userSettings: { keyUiLocale: string }) {
    const uiLocale = userSettings.keyUiLocale;
    i18n.changeLanguage(uiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(uiLocale) ? "rtl" : "ltr");
}

const settingsQuery = { userSettings: { resource: "/userSettings" } };

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState<AppContext | null>(null);
    const [showShareButton, setShowShareButton] = useState(false);
    const { loading, error, data } = useDataQuery(settingsQuery);

    useEffect(() => {
        const run = async () => {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());
            const api = new D2ApiDefault({ baseUrl });

            const [d2, config, currentUser] = await Promise.all([
                init({ baseUrl: baseUrl + "/api" }),
                Config.build(api),
                User.getCurrent(api),
            ]);

            configI18n(data.userSettings);
            const appContext: AppContext = { d2, api, config, currentUser };
            setAppContext(appContext);
            Object.assign(window, { app: appContext, ee: gee });

            /*
            const result = getGeeData(ee, {
                id: "UCSB-CHG/CHIRPS/DAILY",
                bands: ["precipitation"],
                geometry: {
                    type: "point",
                    coordinates: [-12.9487, 9.0131],
                },
                period: {
                    type: "daily" as const,
                    start: moment("2018-08-23"),
                    end: moment("2018-09-02"),
                },
            });
            console.log({ result });
            */
            testGee2(api);

            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            if (currentUser.canReportFeedback()) {
                initFeedbackTool(d2, appConfig);
            }
        };

        if (data) run();
    }, [baseUrl, data]);

    if (error) {
        return (
            <h3 style={{ margin: 20 }}>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>
                {` ${baseUrl}`}
            </h3>
        );
    } else if (loading || !appContext) {
        return (
            <div style={{ margin: 20 }}>
                <h3>Connecting to {baseUrl}...</h3>
                <LinearProgress />
            </div>
        );
    } else {
        return (
            <MuiThemeProvider theme={muiTheme}>
                <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                    <SnackbarProvider>
                        <HeaderBar appName={"Google Earth Engine Connector"} />

                        <div id="app" className="content">
                            <AppContext.Provider value={appContext}>
                                <Root />
                            </AppContext.Provider>
                        </div>

                        <Share visible={showShareButton} />
                    </SnackbarProvider>
                </OldMuiThemeProvider>
            </MuiThemeProvider>
        );
    }
};

async function testGee2(api: D2Api) {
    // const credentials = await api.get<Credentials>("/tokens/google").getData();
    // Workaround until we have a dhis-google-auth.json
    const tokenUrl = "https://play.dhis2.org/2.33dev/api/tokens/google";
    const auth = { username: "admin", password: "district" };
    const credentials = (await Axios.get(tokenUrl, { auth })).data;

    const ee = await EarthEngine.init(gee, credentials);
    const geeDhis2 = GeeDhis2.init(api, ee);

    const dataValueSet = await geeDhis2.getDataValueSet({
        geeDataSetId: "ECMWF/ERA5/DAILY",
        mapping: {
            // eslint-disable-next-line @typescript-eslint/camelcase
            total_precipitation: "uWYGA1xiwuZ",
            // eslint-disable-next-line @typescript-eslint/camelcase
            mean_2m_air_temperature: "RSJpUZqMoxC",
        },
        orgUnits: [{ id: "IyO9ICB0WIn" }, { id: "xloTsC6lk5Q" }],
        interval: {
            type: "daily",
            start: moment("2018-08-23"),
            end: moment("2018-08-25"), // Last day is not included
        },
    });
    console.log(dataValueSet);

    const res = await geeDhis2.postDataValueSet(dataValueSet);
    console.log(res);
}

interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback: {
        token: string[];
        createIssue: boolean;
        sendToDhis2UserGroups: string[];
        issues: {
            repository: string;
            title: string;
            body: string;
        };
        snapshots: {
            repository: string;
            branch: string;
        };
        feedbackOptions: {};
    };
}

export default React.memo(App);
