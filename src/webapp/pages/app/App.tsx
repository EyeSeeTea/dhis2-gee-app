import { useConfig } from "@dhis2/app-runtime";
import { HeaderBar } from "@dhis2/ui";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import CompositionRoot from "../../../CompositionRoot";
import { D2Api } from "../../../types/d2-api";
import Share from "../../components/share/Share";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Config } from "../../models/Config";
import { Instance } from "../../models/Instance";
import { User } from "../../models/User";
import { Router } from "../Router";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

export interface AppProps {
    api: D2Api;
    d2: D2;
    instance: Instance;
}

export const App: React.FC<AppProps> = React.memo(function App({ api, d2 }) {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState<AppContextState | null>(null);
    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function setup() {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());

            const [config, currentUser] = await Promise.all([Config.build(api), User.getCurrent(api)]);

            const version = (await api.system.info.getData()).version;
            if (!window.ee) throw new Error("Google Earth Engine not found (window.ee)");

            const compositionRoot = new CompositionRoot(api, window.ee, version, config);

            const dataImporter: boolean = process.env.REACT_APP_DATA_IMPORTER
                ? process.env.REACT_APP_DATA_IMPORTER === "true"
                : false;

            const appContext: AppContextState = {
                d2,
                api,
                config,
                currentUser,
                compositionRoot,
                isAdmin: !dataImporter,
            };

            // Google Earth Engine must be defined globally in window (as var 'ee') to work
            Object.assign(window, { app: appContext });
            setAppContext(appContext);

            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            if (currentUser.canReportFeedback()) initFeedbackTool(d2, appConfig);
            setLoading(false);
        }

        setup();
    }, [baseUrl, api, d2]);

    if (loading || !appContext) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <SnackbarProvider>
                    <LoadingProvider>
                        <HeaderBar appName={appContext.isAdmin ? "GEE App" : "GEE Data Importer App"} />

                        <div id="app" className="content">
                            <AppContext.Provider value={appContext}>
                                <Router />
                            </AppContext.Provider>
                        </div>

                        <Share visible={showShareButton} />
                    </LoadingProvider>
                </SnackbarProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
});

type D2 = object;

function initFeedbackTool(d2: D2, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");

    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        window.$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
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
