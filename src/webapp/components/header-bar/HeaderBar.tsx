import React from "react";
import { HeaderBar as D2HeaderBar } from "@dhis2/ui";

type HeaderBarProps = {
    appName: string;
};

// avoid rendering header for versions > 2.41
// https://developers.dhis2.org/docs/references/global-shell/#header-bars
export const HeaderBar: React.FC<HeaderBarProps> = ({ appName }) => {
    const shouldRenderHeaderBar = window.self === window.top;
    return shouldRenderHeaderBar ? <D2HeaderBar appName={appName} /> : null;
};
