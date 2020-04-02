import i18n from "@dhis2/d2-i18n";
import { Icon, IconButton, makeStyles, Tooltip, Typography } from "@material-ui/core";
import { D2Api } from "d2-api";
import {
    TableAction,
    TableColumn,
    useSnackbar,
    ObjectsTable,
    ConfirmationDialog,
} from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import Mapping from "../../models/Mapping";
import AttributeMapping from "../../models/AttributeMapping";
import AttributeMappingDialog, { AttributeMappingDialogConfig } from "./AttributeMappingDialog";

const useStyles = makeStyles({
    iconButton: {
        padding: 0,
        paddingLeft: 8,
        paddingRight: 8,
    },
    instanceDropdown: {
        order: 0,
    },
    actionButtons: {
        order: 10,
        marginRight: 10,
    },
});

interface WarningDialog {
    title?: string;
    description?: string;
    action?: () => void;
}

interface AttributeMappingConfig {
    selection: string[];
    mappedId: string | undefined;
}

export interface AttributeMappingTableProps {
    api: D2Api;
    mapping: Mapping;
    onChange(newMapping: Mapping): void;
    availableBands: string[];
}

export default function AttributeMappingTable({
    api,
    mapping,
    onChange,
    availableBands,
}: AttributeMappingTableProps) {
    const classes = useStyles();
    const snackbar = useSnackbar();

    const [warningDialog, setWarningDialog] = useState<WarningDialog | null>(null);
    const [newMappingConfig, setNewMappingConfig] = useState<AttributeMappingDialogConfig | null>(
        null
    );

    const [rows, setRows] = useState<AttributeMapping[]>(
        AttributeMapping.getList(availableBands, mapping.attributeMappingDictionary)
            .attributeMappings
    );

    const openMappingDialog = useCallback(
        (geeBands: string[]) => {
            setNewMappingConfig({
                dataset: mapping.dataSetId,
                attributeMapping: _.find(rows, ["id", geeBands[0]]),
            });
        },
        [rows, mapping]
    );

    const deleteMapping = useCallback(
        (geeBands: string[], dryRun = true) => {
            if (dryRun) {
                if (geeBands.length > 0) {
                    setWarningDialog({
                        title: i18n.t("Disable mapping"),
                        description: i18n.t(
                            "Are you sure you want to disable mapping for {{total}} attributes?",
                            {
                                total: geeBands.length,
                            }
                        ),
                        action: () => deleteMapping(geeBands, false),
                    });
                } else {
                    snackbar.error(i18n.t("Please select at least one item to disable mapping"));
                }
            } else {
                const newMapping = mapping.set(
                    "attributeMappingDictionary",
                    _.omit(mapping.attributeMappingDictionary, geeBands)
                );
                setRows(
                    AttributeMapping.getList(availableBands, newMapping.attributeMappingDictionary)
                        .attributeMappings
                );
                onChange(newMapping);
            }
        },
        [snackbar, availableBands, mapping, onChange]
    );

    const onMappingChange = useCallback(
        (newAttributeMapping: AttributeMapping) => {
            const newMapping = mapping.set("attributeMappingDictionary", {
                ...mapping.attributeMappingDictionary,
                [newAttributeMapping.id]: newAttributeMapping,
            });
            setRows(
                AttributeMapping.getList(availableBands, newMapping.attributeMappingDictionary)
                    .attributeMappings
            );
            onChange(newMapping);
            setNewMappingConfig(null);
        },
        [mapping, availableBands, onChange]
    );

    const columns: TableColumn<AttributeMapping>[] = useMemo(
        () => [
            {
                name: "geeBand",
                text: i18n.t("Google Attribute"),
            },
            {
                name: "dataElementId",
                text: i18n.t("Mapped Id"),
                sortable: false,
                /*eslint-disable*/
                getValue: (row: AttributeMapping) => {
                    const value = row.dataElementId ?? "-";
                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {value}
                            </Typography>
                            <Tooltip title={i18n.t("Set mapping")} placement="top">
                                <IconButton
                                    className={classes.iconButton}
                                    onClick={() => {
                                        openMappingDialog([row.id]);
                                    }}
                                >
                                    <Icon color="primary">open_in_new</Icon>
                                </IconButton>
                            </Tooltip>
                        </span>
                    );
                },
            },
            {
                name: "dataElementName",
                text: i18n.t("Mapped Name"),
                sortable: false,
                getValue: (row: AttributeMapping) => {
                    const value = row.dataElementName ?? "-";
                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {value}
                            </Typography>
                        </span>
                    );
                },
            },
            {
                name: "dataElementCode",
                text: i18n.t("Mapped Code"),
                sortable: false,
                getValue: (row: AttributeMapping) => {
                    const value = row.dataElementCode ?? "-";

                    return (
                        <span>
                            <Typography variant={"inherit"} gutterBottom>
                                {value}
                            </Typography>
                        </span>
                    );
                },
            },
        ],
        [classes, openMappingDialog]
    );

    const actions: TableAction<AttributeMapping>[] = useMemo(
        () => [
            {
                // Required to disable default "select" action
                name: "select",
                text: "Select",
                isActive: () => false,
            },
            {
                name: "set-mapping",
                text: i18n.t("Set mapping"),
                multiple: false,
                onClick: openMappingDialog,
                icon: <Icon>open_in_new</Icon>,
            },
            {
                name: "delete-mapping",
                text: i18n.t("Disable mapping"),
                multiple: true,
                onClick: deleteMapping,
                icon: <Icon>sync_disabled</Icon>,
            },
        ],
        [deleteMapping, openMappingDialog]
    );

    const closeWarningDialog = () => setWarningDialog(null);
    const closeAttributeMappingDialog = () => setNewMappingConfig(null);

    return (
        <React.Fragment>
            {!!warningDialog && (
                <ConfirmationDialog
                    isOpen={true}
                    title={warningDialog.title}
                    description={warningDialog.description}
                    saveText={i18n.t("Ok")}
                    onSave={() => {
                        if (warningDialog.action) warningDialog.action();
                        setWarningDialog(null);
                    }}
                    onCancel={closeWarningDialog}
                />
            )}

            {!!newMappingConfig && (
                <AttributeMappingDialog
                    api={api}
                    params={newMappingConfig}
                    onMappingChange={onMappingChange}
                    onClose={closeAttributeMappingDialog}
                />
            )}

            <ObjectsTable<AttributeMapping>
                rows={rows}
                actions={actions}
                forceSelectionColumn={true}
                columns={columns}
                searchBoxLabel={i18n.t("Search by name / code")}
            />
        </React.Fragment>
    );
}
