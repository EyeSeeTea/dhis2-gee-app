import i18n from "@dhis2/d2-i18n";
import { DialogContent, makeStyles, Theme } from "@material-ui/core";

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

/* eslint-disable @typescript-eslint/no-var-requires */
const { TextField } = require("@dhis2/d2-ui-core");

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
    const [fieldValue, setFieldValue] = useState(value);
    const geeDataSets = useCompositionRoot().geeDataSets();
    const classes = useStyles();

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

                if (selectedDataSet && inputRef) {
                    setFieldValue(selectedDataSet.id);

                    debugger;

                    if (inputRef.current) {
                        inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                        inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                    }

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
                inputProps={{
                    readOnly: Boolean(true),
                    disabled: Boolean(true),
                }}
                className={classes.textField}
                onClick={() => setOpen(true)}
                //disabled={true}
                floatingLabelText={floatingLabelText}
                onChange={handleChange}
                value={fieldValue}
                ref={inputRef}
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
                        forceSelectionColumn={false}
                        rows={rows}
                        actions={actions}
                        details={details}
                        columns={columns}
                        searchBoxLabel={i18n.t("Search by name / code")}
                    />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default GeeDataSetSelector;

const useStyles = makeStyles((theme: Theme) => ({
    textField: {
        marginTop: theme.spacing(2),
        width: "33%",
    },
}));
