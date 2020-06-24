import i18n from "@dhis2/d2-i18n";
import {
    DialogContent,
    TextField,
    FormControl,
    MuiThemeProvider,
    createMuiTheme,
    Typography,
    makeStyles,
} from "@material-ui/core";

import React, { useState, useEffect, useRef } from "react";
import { GeeDataSet, Cadence } from "../../../domain/entities/GeeDataSet";
import { useCompositionRoot } from "../../contexts/app-context";
import {
    TableColumn,
    ObjectsTableDetailField,
    TableAction,
    ConfirmationDialog,
    ObjectsTable,
} from "d2-ui-components";
import Dropdown from "../dropdown/Dropdown";

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
    const classes = useStyles();
    const [rows, setRows] = useState<GeeDataSet[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [cadenceFilter, setCadenceFilter] = useState<string>("");
    const [objectsTableKey, setObjectsTableKey] = useState<number>(new Date().getTime());

    const [cadenceFilterOptions] = useState<{ id: Cadence; name: string }[]>([
        {
            id: "year",
            name: i18n.t("Year"),
        },
        {
            id: "day",
            name: i18n.t("Day"),
        },
        {
            id: "month",
            name: i18n.t("Month"),
        },
    ]);

    const inputRef = useRef<HTMLInputElement>(null);
    const geeDataSets = useCompositionRoot().geeDataSets();

    const materialTheme = getMaterialTheme();

    useEffect(() => {
        geeDataSets.getAll.execute({ search: searchFilter, cadence: cadenceFilter }).then(setRows);
    }, [geeDataSets.getAll, searchFilter, cadenceFilter, objectsTableKey]);

    const columns: TableColumn<GeeDataSet>[] = [
        {
            name: "id",
            hidden: true,
            text: i18n.t("Id"),
        },
        {
            name: "imageCollectionId",
            hidden: true,
            text: i18n.t("Image Collection Id"),
        },
        {
            name: "displayName",
            text: i18n.t("Name"),
        },
        {
            name: "description",
            text: i18n.t("Description"),
            getValue: (dataSet: GeeDataSet) =>
                dataSet.description.length > 300
                    ? dataSet.description.substring(0, 300) + " ..."
                    : dataSet.description,
        },
        {
            name: "cadence",
            text: i18n.t("Cadence"),
        },
        {
            name: "type",
            text: i18n.t("Type"),
            hidden: true,
        },
    ];

    const details: ObjectsTableDetailField<GeeDataSet>[] = [
        { name: "displayName", text: i18n.t("Name") },
        {
            name: "type",
            text: i18n.t("Type"),
        },
        {
            name: "description",
            text: i18n.t("Description"),
        },
        {
            name: "doc",
            text: i18n.t("Link"),
        },
        {
            name: "bands",
            text: i18n.t("Bands"),
            /*eslint-disable*/
            getValue: (dataSet: GeeDataSet) => {
                return (
                    <ul style={{ paddingLeft: 18 }}>
                        {dataSet.bands &&
                            dataSet.bands.map(band => {
                                return (
                                    <li key={band.name}>
                                        <Typography variant="subtitle1">{band.name}</Typography>
                                        {band.units && (
                                            <Typography variant="subtitle1">
                                                {`units: ${band.units}`}
                                            </Typography>
                                        )}
                                        <Typography variant="subtitle1">
                                            {band.description}
                                        </Typography>
                                    </li>
                                );
                            })}
                    </ul>
                );
            },
        },
        {
            name: "keywords",
            text: i18n.t("Keywords"),
            getValue: (dataSet: GeeDataSet) => dataSet.keywords.join(", "),
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

    const customFilters = (
        <React.Fragment>
            <Dropdown
                key={"cedence-filter"}
                items={cadenceFilterOptions}
                onValueChange={setCadenceFilter}
                value={cadenceFilter}
                label={i18n.t("Cadence")}
            />
        </React.Fragment>
    );

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
                    className={classes.geeInput}
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
                    onCancel={() => {
                        setCadenceFilter("");
                        setSearchFilter("");
                        setObjectsTableKey(new Date().getTime());
                        setOpen(false);
                    }}
                    maxWidth={"xl"}
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
                            onChangeSearch={setSearchFilter}
                            searchBoxLabel={i18n.t("Search")}
                            filterComponents={customFilters}
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
                    minWidth: 250,
                },
            },
        },
    });

const useStyles = makeStyles({
    geeInput: {
        marginTop: 20,
    },
});
