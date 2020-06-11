import i18n from "@dhis2/d2-i18n";
import {
    DialogContent,
    TextField,
    FormControl,
    MuiThemeProvider,
    createMuiTheme,
    Typography,
} from "@material-ui/core";

import React, { useState, useEffect, useRef } from "react";
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
    floatingLabelText: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const GeeDataSetSelector: React.FC<GeeDataSetSelectorProps> = ({
    onChange,
    floatingLabelText,
    value,
}) => {
    const [rows, setRows] = useState<GeeDataSet[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const geeDataSets = useCompositionRoot().geeDataSets();

    const materialTheme = getMaterialTheme();

    useEffect(() => {
        geeDataSets.getAll.execute().then(setRows);
    }, [geeDataSets.getAll]);

    const columns: TableColumn<GeeDataSet>[] = [
        {
            name: "displayName",
            text: i18n.t("Name"),
        },
        {
            name: "description",
            text: i18n.t("Description"),
        },
        {
            name: "bands",
            text: i18n.t("Bands"),
            getValue: (dataSet: GeeDataSet) => dataSet.bands.map(band => band.name).join(", "),
        },
    ];

    const details: ObjectsTableDetailField<GeeDataSet>[] = [
        { name: "displayName", text: i18n.t("Name") },
        {
            name: "description",
            text: i18n.t("Description"),
        },
        {
            name: "bands",
            text: i18n.t("Bands"),
            /*eslint-disable*/
            getValue: (dataSet: GeeDataSet) => {
                return (
                    <ul style={{ paddingLeft: 18 }}>
                        {dataSet.bands.map(band => {
                            return (
                                <li key={band.name}>
                                    <Typography variant="subtitle1">{band.name}</Typography>
                                    <Typography variant="subtitle1">
                                        {`units: ${band.units}`}
                                    </Typography>
                                    <Typography variant="subtitle1">{band.description}</Typography>
                                </li>
                            );
                        })}
                    </ul>
                );
            },
        },
    ];

    const actions: TableAction<GeeDataSet>[] = [
        {
            name: "select",
            text: i18n.t("Select"),
            multiple: false,
            primary: true,
            onClick: (ids: string[]) => {
                const selectedDataSet = rows.find(row => row.id === ids[0]);

                if (selectedDataSet && inputRef.current) {
                    setNativeValue(inputRef.current, selectedDataSet.id);
                    inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));

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

    const setNativeValue = (element: HTMLInputElement, value: string) => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const valueSetter = Object.getOwnPropertyDescriptor(element, "value")!!.set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")!!.set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter!!.call(element, value);
        } else {
            valueSetter!!.call(element, value);
        }
    };

    return (
        <MuiThemeProvider theme={materialTheme}>
            <FormControl>
                <TextField
                    inputProps={{
                        readOnly: Boolean(true),
                        disabled: Boolean(true),
                    }}
                    onClick={() => setOpen(true)}
                    label={floatingLabelText}
                    onChange={onChange}
                    value={value}
                    inputRef={inputRef}
                />
                <ConfirmationDialog
                    open={open}
                    title={i18n.t("Select G.E.E dataset")}
                    onCancel={() => setOpen(false)}
                    maxWidth={"lg"}
                    fullWidth={true}
                    disableSave={false}
                    cancelText={i18n.t("Cancel")}
                >
                    <DialogContent>
                        <ObjectsTable<GeeDataSet>
                            forceSelectionColumn={false}
                            rows={rows}
                            actions={actions}
                            details={details}
                            columns={columns}
                            searchBoxLabel={i18n.t("Search by name / code")}
                        />
                    </DialogContent>
                </ConfirmationDialog>
            </FormControl>
        </MuiThemeProvider>
    );
};

export default GeeDataSetSelector;

const getMaterialTheme = () =>
    createMuiTheme({
        overrides: {
            MuiFormLabel: {
                root: {
                    color: "#aaaaaa",
                    "&$focused": {
                        color: "#aaaaaa",
                    },
                },
            },
            MuiTextField: {
                root: {
                    marginTop: 20,
                    minWidth: 250,
                },
            },
        },
    });
