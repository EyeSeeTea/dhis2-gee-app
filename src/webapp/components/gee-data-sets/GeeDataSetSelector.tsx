import i18n from "@dhis2/d2-i18n";
import { DialogContent, TextField } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { GeeDataSet } from "../../../domain/entities/GeeDataSet";
import { useCompositionRoot } from "../../contexts/app-context";
import {
    TableColumn,
    ObjectsTableDetailField,
    TableAction,
    ConfirmationDialog,
    ObjectsTable,
} from "d2-ui-components";

export interface DropdownOption {
    id: string;
    name: string;
}

interface GeeDataSetSelectorProps {
    value: string;
    label: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const GeeDataSetSelector: React.FC<GeeDataSetSelectorProps> = ({ onChange, label, value }) => {
    const [rows, setRows] = useState<GeeDataSet[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [inputElement, setInputElement] = useState<HTMLDivElement | null>(null);
    const geeDataSets = useCompositionRoot().geeDataSets();

    useEffect(() => {
        geeDataSets.getAll.execute().then(setRows);
    }, [geeDataSets.getAll]);

    const columns: TableColumn<GeeDataSet>[] = [
        {
            name: "displayName",
            text: i18n.t("Name"),
        },
    ];

    const details: ObjectsTableDetailField<GeeDataSet>[] = [
        { name: "displayName", text: i18n.t("Name") },
    ];

    const actions: TableAction<GeeDataSet>[] = [
        {
            name: "select",
            text: i18n.t("Select"),
            multiple: false,
            primary: true,
            onClick: (ids: string[]) => {
                const selectedDataSet = rows.find(row => row.id === ids[0]);

                if (selectedDataSet && inputElement) {
                    debugger;
                    setNativeValue(inputElement, selectedDataSet.id);
                    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
                    setOpen(false);
                }
            },
        },
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
        },
    ];

    const setNativeValue = (element: HTMLDivElement, value: string) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, "value")!!.set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")!!.set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter!!.call(element, value);
        } else {
            valueSetter!!.call(element, value);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        debugger;
        if (onChange) {
            onChange(event);
        }
    };

    //const materialTheme = getMaterialTheme();
    return (
        <React.Fragment>
            <TextField
                onClick={() => setOpen(true)}
                disabled={true}
                label={label}
                onChange={handleChange}
                value={value}
                ref={input => setInputElement(input)}
            />
            <ConfirmationDialog
                open={open}
                title={i18n.t("Gee data sets")}
                onCancel={() => setOpen(false)}
                maxWidth={"lg"}
                fullWidth={true}
                disableSave={false}
                cancelText={i18n.t("Cancel")}
            >
                <DialogContent>
                    <ObjectsTable<GeeDataSet>
                        rows={rows}
                        actions={actions}
                        details={details}
                        forceSelectionColumn={true}
                        columns={columns}
                        searchBoxLabel={i18n.t("Search by name / code")}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default GeeDataSetSelector;
