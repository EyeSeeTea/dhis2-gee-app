/// <reference types="@welldone-software/why-did-you-render" />

import React from "react";

if (import.meta.env.DEV) {
    void import("@welldone-software/why-did-you-render").then(whyDidYouRender => {
        whyDidYouRender.default(React, {
            trackAllPureComponents: true,
        });
    });
}
