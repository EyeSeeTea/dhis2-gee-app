import { Provider } from "@dhis2/app-runtime";
import { init } from "d2";
import _ from "lodash";
import ReactDOM from "react-dom";
import { D2Api } from "./types/d2-api";
import { EarthEngine } from "./types/google-earth-engine";
import i18n from "./utils/i18n";
import { getD2APiFromInstance } from "./utils/d2-api";
import { Instance } from "./webapp/models/Instance";
import { App } from "./webapp/pages/app/App";
import "./webapp/utils/wdyr";

declare global {
    interface Window {
        $: { feedbackDhis2(d2: object, appKey: string, feedbackOptions: object): void };
        api: D2Api;
        ee: EarthEngine;
    }
}

const isDev = import.meta.env.DEV;

function getInjectedBaseUrl(): string | null {
    const baseUrl = document.querySelector('meta[name="dhis2-base-url"]')?.getAttribute("content");
    if (baseUrl && baseUrl !== "__DHIS2_BASE_URL__") {
        return baseUrl;
    }
    return null;
}

async function getBaseUrlFromManifest(): Promise<string> {
    const response = await fetch("manifest.webapp");
    const manifest = await response.json();
    const { href } = manifest.activities.dhis;
    if (!href || href === "*") {
        throw new Error("Base URL not found in manifest.webapp (see DHIS2-19708)");
    }
    return href;
}

async function getBaseUrl(): Promise<string> {
    if (isDev) {
        return "/dhis2";
    }
    return getInjectedBaseUrl() ?? (await getBaseUrlFromManifest());
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

async function main() {
    const baseUrl = await getBaseUrl();

    try {
        const d2 = await init({ baseUrl: baseUrl + "/api", schemas: [] });
        const instance = new Instance({ url: baseUrl });
        const api = getD2APiFromInstance(instance);
        if (isDev) window.api = api;

        const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
        configI18n(userSettings);

        ReactDOM.render(
            <Provider config={{ baseUrl, apiVersion: 30 }}>
                <App api={api} d2={d2} instance={instance} />
            </Provider>,
            document.getElementById("root")
        );
    } catch (err: any) {
        console.error(err);
        const feedback = err.toString().match("Unable to get schemas") ? (
            <h3 style={{ margin: 20 }}>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>
            </h3>
        ) : (
            <h3>{err.toString()}</h3>
        );
        ReactDOM.render(<div>{feedback}</div>, document.getElementById("root"));
    }
}

void main();
