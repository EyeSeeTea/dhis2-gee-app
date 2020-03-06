import React from "react";
import { render, fireEvent, waitForDomChange } from "@testing-library/react";
import { SnackbarProvider } from "d2-ui-components";
import "@testing-library/jest-dom/extend-expect";
import { getMockApi } from "d2-api";

import Example from "../Example";
import { AppContext } from "../../../contexts/app-context";
import { User } from "../../../models/User";
import { Config } from "../../../models/Config";

const { api, mock } = getMockApi();

// TODO: Abstract

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

function getComponent({ name = "Some Name" } = {}) {
    return render(
        <AppContext.Provider value={{ d2, api, currentUser, config }}>
            <SnackbarProvider>
                <Example name={name} />
            </SnackbarProvider>
        </AppContext.Provider>
    );
}

describe("Example", () => {
    beforeEach(() => {
        mock.onGet("/dataSets", { params: { pageSize: 5 } }).reply(200, {
            pager: {
                page: 1,
                pageCount: 3,
                total: 12,
                pageSize: 5,
            },
            dataSets: [{ id: "1234a" }, { id: "1234b" }],
        });
    });

    test("greeting", async () => {
        const component = getComponent();
        // Use component.debug() to see its full HTML
        expect(component.queryByText("Hello Some Name!")).toBeInTheDocument();
    });

    test("dataset IDS", async () => {
        const component = getComponent();
        await waitForDomChange();
        expect(component.queryByText("1234a, 1234b", { exact: false })).toBeInTheDocument();
    });

    test("increment button", async () => {
        const component = getComponent();
        expect(component.queryByText("Value=0")).toBeInTheDocument();
        fireEvent.click(component.getByText("+1"));
        expect(component.queryByText("Value=1")).toBeInTheDocument();
    });

    test("feedback button", async () => {
        const component = getComponent();
        fireEvent.click(component.getByText("Click to show feedback"));
        expect(component.queryByText("Some info")).toBeInTheDocument();
    });
});
