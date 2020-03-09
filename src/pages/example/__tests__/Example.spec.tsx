import React from "react";
import { fireEvent, waitForDomChange, RenderResult } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import Example from "../Example";
import { act } from "react-dom/test-utils";
import { getTestContext, getReactComponent } from "../../../utils/tests";

const { mock, context } = getTestContext();

function getComponent({ name = "Some Name" } = {}): RenderResult {
    return getReactComponent(<Example name={name} showExtraComponents={false} />, context);
}

describe("Example", () => {
    beforeEach(() => {
        mock.onGet("/dataSets", {
            params: { pageSize: 5, fields: "categoryCombo[name],id" },
        }).reply(200, {
            pager: { page: 1, pageCount: 3, total: 12, pageSize: 5 },
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
