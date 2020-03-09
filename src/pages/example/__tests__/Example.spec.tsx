import React from "react";
import { render, fireEvent, waitForDomChange, RenderResult } from "@testing-library/react";
import { SnackbarProvider } from "d2-ui-components";
import "@testing-library/jest-dom/extend-expect";
import { getMockApi } from "d2-api";

import Example from "../Example";
import { AppContext } from "../../../contexts/app-context";
import { User } from "../../../models/User";
import { Config } from "../../../models/Config";
import { act } from "react-dom/test-utils";

const { api, mock } = getMockApi();

// TODO: Move currentUser / config  / d2 to a separate file to reuse

const currentUser = new User(api, {
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

const config = new Config(api, {
    base: {},
    categoryCombos: [],
});

const d2 = {};

function getComponent({ name = "Some Name" } = {}): RenderResult {
    return render(
        <AppContext.Provider value={{ d2, api, currentUser, config }}>
            <SnackbarProvider>
                <Example name={name} showExtraComponents={false} />
            </SnackbarProvider>
        </AppContext.Provider>
    );
}

describe("Example", () => {
    beforeEach(() => {
        mock.onGet("/dataSets", {
            params: { pageSize: 5, fields: "categoryCombo[name],id" },
        }).reply(200, {
            pager: {
                page: 1,
                pageCount: 3,
                total: 12,
                pageSize: 5,
            },
            dataSets: [{ id: "ds-1" }, { id: "ds-2" }],
        });
    });

    test("renders a greeting", async () => {
        const component = getComponent();
        await waitForDomChange();
        expect(component.queryByText("Hello Some Name!")).toBeInTheDocument();
    });

    test("renders the data set ids", async () => {
        const component = getComponent();
        await waitForDomChange();
        // component.debug() # show HTML of a componet on the console
        expect(component.queryByText("ds-1, ds-2", { exact: false })).toBeInTheDocument();
    });

    test("counter is incremented when increment button is clicked", async () => {
        const component = getComponent();

        expect(component.queryByText("Value=0")).toBeInTheDocument();
        await act(async () => {
            fireEvent.click(component.getByText("+1"));
        });
        expect(component.queryByText("Value=1")).toBeInTheDocument();
    });

    test("Info is shown when feedback button is pressed", async () => {
        const component = getComponent();
        await act(async () => {
            fireEvent.click(component.getByText("Click to show feedback"));
        });
        expect(component.queryByText("Some info")).toBeInTheDocument();
    });
});
